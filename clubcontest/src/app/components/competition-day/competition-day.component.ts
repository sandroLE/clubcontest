import { UserService } from './../../services/user.service';
import { ApiService } from './../../services/api.service';
import { FlightService } from './../../services/flight.service';
import { TaskScoringService } from './../../services/taskScoring.service';
import { MapService } from './../../services/map.service';
import { GeoUtilService } from './../../services/geoUtil.service';
import { ITask, ITaskPoint } from './../../models/task';
import { IFlight, ILoggerPoint, IFlightScoring } from './../../models/flight';
import { IDay } from './../../models/day';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input, EventEmitter, Output, HostListener, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'leaflet-geometryutil';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ChangeDateDialog } from '../changeDateDialog/changeDate.component';
import { Color } from '../../Color';
import { FlightSorter } from '../../pipes/orderby.pipe';

@Component({
  selector: 'app-competition-day',
  templateUrl: './competition-day.component.html',
  styleUrls: ['./competition-day.component.css'],

})
export class CompetitionDayComponent {

  public day: IDay = null;
  public isMapVisible = true;
  public isInProgress = false;
  public expandedFlight: number = null;
  public isSideBarHidden = false;
  public sliderMinTime = 0;
  public sliderMaxTime = 100;
  public sliderTime = 50;
  public sliderDisplayTime = "";

  public hasError = false;
  @Input() private dayId = 0;
  @Output() private deleted = new EventEmitter<void>();

  constructor(
    private route: ActivatedRoute
    , private mapService: MapService
    , private http: Http
    , private geoUtil: GeoUtilService
    , private scoring: TaskScoringService
    , private flightService: FlightService
    , private apiService: ApiService
    , private router: Router
    , public userService: UserService
    , public dialog: MatDialog) { }

  ngOnChanges() {
    this.mapService.clearMap();

    if (this.dayId > 0) {
      this.loadDay(this.dayId);
    }
  }

  ngAfterViewInit() {
    this.mapService.createMap('mapid');

  }

  onTaskCreated(task) {
    this.day.XcSoarTask = task;
  }


  private deleteDay() {
    var url = this.apiService.apiBaseUrl + "/Day/Delete?id=" + this.day.Id;

    if (confirm("Bist du dir sicher?")) {
      this.http.delete(url).subscribe(() => {
        this.deleted.emit();
      });
    }
  }


  private loadDay(dayId: number) {
    this.isMapVisible = false;
    this.hasError = false;
    var url = this.apiService.apiBaseUrl + "/Day/Get?id=" + dayId
    this.http.get(url)
      .subscribe(x => {
        this.day = x.json();
        if (this.day == null) {
          this.hasError = true;
        }
        else {
          this.day.Flights.forEach((f: IFlight) => { this.flightService.fix(f); });//TODO: move to service or find better solution
          this.setScores();
          this.day.Flights = FlightSorter.sort(this.day.Flights);
          this.day.Flights.forEach((f, i) => f.color = Color.get(i));
          this.mapService.showTask(this.day.XcSoarTask);
        }
      });
  }




  private setScores() {
    this.scoring.setFlightScrores(this.day.Flights)
  }

  private uploadFlight(files: FileList) {
    this.isInProgress = true
    this.flightService.uploadFlight(files, this.day.Id).subscribe((uploadedFlight) => {

      if (uploadedFlight.Finished == null) {

        let scoring = this.scoring.getFlightScoring(uploadedFlight, this.day.XcSoarTask);
        this.flightService.updateFlightScoring(uploadedFlight, scoring).subscribe((updatedFlight) => {
          this.day.Flights = [...this.day.Flights, updatedFlight];
          this.expandFlight(updatedFlight);
        });
      }
    });
  }


  private deselectFlight(flight: IFlight) {
    this.mapService.clearFlights();
    this.day.Flights
      .filter(x => x.isSelected)
      .forEach((f, i) => this.mapService.addFlight(f, { color: f.color }));
    this.initializeSliderValues();
  }

  private selectFlight(flight: IFlight, isSelected: boolean): Observable<IFlight> {
    flight.isSelected = isSelected;
    flight.isLoading = true;

    var obs: Observable<IFlight>;
    if (isSelected) {
      obs = this.flightService.getFlight(flight.Id);
    }
    else {
      obs = Observable.of(flight);
    }

    obs.subscribe(loadedFlight => {
      this.isInProgress = false;
      loadedFlight.isLoading = false;
      loadedFlight.isSelected = isSelected;
      loadedFlight.color = flight.color || "black";
      this.replace(loadedFlight);
      this.mapService.clearFlights();
      this.day.Flights.filter(x => x.isSelected).forEach((f, i) => this.mapService.addFlight(f, { color: f.color }));
      this.initializeSliderValues();
    });
    return obs;
  }


  selectAll(){
    this.mapService.clearFlights();
    this.day.Flights.forEach(f => this.selectFlight(f, true));
  }

  deselectAll(){
    this.day.Flights.forEach(f => f.isSelected = false);
  }


  private initializeSliderValues() {
    var selectedFlights = this.day.Flights.filter(x => x.Points != null && x.Points.length > 0 && x.isSelected);
    if (selectedFlights.length > 0) {
      var first = selectedFlights.sort((a, b) => a.Points[0].Time.getTime() - b.Points[0].Time.getTime())[0];
      this.sliderMinTime = first.Points[0].Time.getTime();
      var last = selectedFlights.sort((a, b) => a.Points[a.Points.length - 1].Time.getTime() - b.Points[b.Points.length - 1].Time.getTime())[selectedFlights.length - 1];
      this.sliderMaxTime = this.sliderTime = last.Points[last.Points.length - 1].Time.getTime();
      this.sliderDisplayTime = this.getFormatedTime(new Date(this.sliderTime));
      this.sliderChanged();
    }

  }




  private replace(newFlight: IFlight) {
    var f = this.day.Flights.filter(x => x.Id == newFlight.Id)[0];
    newFlight.Score = f.Score;
    var index = this.day.Flights.indexOf(f);
    this.day.Flights[index] = newFlight;
    this.day.Flights = [...this.day.Flights];
  }

  private collapseFlight(flight: IFlight) {
    flight.isExpanded = false;
  }

  private expandFlight(flight: IFlight) {
    this.selectFlight(flight, true).subscribe((f) => {
      f.isExpanded = true;
    });
  }

  private onTurnpointsChanged(flight: IFlight): void {
    this.mapService.clearFlights();
    this.mapService.addFlight(flight, { color: flight.color, showMarker: true });
  }

  private applyFlightUpdates(flight: IFlight): void {
    this.flightService.updateFlight(flight).subscribe(() => {
      this.loadDay(this.dayId);
    });

  }

  private deleteFlight(flight: IFlight) {
    this.flightService.deleteFlight(flight.Id).subscribe(() => {
      this.loadDay(this.dayId);
    }, (error) => console.error(error));
  }

  private addToArray(array: number[], value: number) {
    if (array.indexOf(value) < 0) {
      array.push(value);
    }
  }

  private removeFromArray(array: number[], value: number) {
    if (array.indexOf(value) >= 0) {
      array = array.filter(x => x != value);
      return [...array];
    }
    return array;
  }

  public hideSidebar() {
    this.isSideBarHidden = true;
    this.onResize();
  }

  public showSidebar() {
    this.isSideBarHidden = false;
    this.onResize();
  }

  public sliderMouseOver() {
    this.mapService.map.dragging.disable();
  }

  public sliderMouseOut() {
    this.mapService.map.dragging.enable();
  }

  public sliderChanged() {
    this.mapService.clearFlights();
    let selectedFlights = this.day.Flights.filter(x => x.isSelected);

    let showMarker = this.sliderMaxTime == this.sliderTime && selectedFlights.length == 1;
    let traceTime = this.sliderMaxTime == this.sliderTime ? null : this.sliderTime;
    let trackLength = selectedFlights.length > 1 ? 1000000 : null;
    selectedFlights.forEach((f, i) => this.mapService.addFlight(f, { color: f.color, trackEnd: traceTime, trackLength: trackLength, showMarker: showMarker }));
    this.sliderDisplayTime = this.getFormatedTime(new Date(this.sliderTime));
  }

  private getFormatedTime(time: Date): string {
    var options = { hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('de-DE', options).format(time);
  }


  changeDate(): void {
    let dialogRef = this.dialog.open(ChangeDateDialog, {
      width: '250px',
      data: { date: this.day.Date }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("dlg closed", result);
      if (result != null) {
        this.day.Date = result;
        this.apiService.updateDay(this.day).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        })
      }
    });
  }

  private resizeTimeOut: any = null;
  @HostListener('window:resize')
  onResize() {
    if (this.resizeTimeOut) {
      clearTimeout(this.resizeTimeOut);
    }
    this.resizeTimeOut = setTimeout(() => {
      this.mapService.invalidateSize();
    }, 200);
  }




}




declare var moment;

