import { UserService } from './../../services/user.service';
import { ApiService } from './../../services/api.service';
import { FlightService } from './../../services/flight.service';
import { TaskScoringService } from './../../services/taskScoring.service';
import { MapService } from './../../services/map.service';
import { GeoUtilService } from './../../services/geoUtil.service';
import { ITask, ITaskPoint } from './../../models/task';
import { IFlight, ILoggerPoint } from './../../models/flight';
import { IDay } from './../../models/day';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'leaflet-geometryutil';

@Component({
  selector: 'app-competition-day',
  templateUrl: './competition-day.component.html',
  styleUrls: ['./competition-day.component.css']
})
export class CompetitionDayComponent {

  private day: IDay = null;
  private isMapVisible = true;
  private isInProgress = false;
  private selectedFlightIds: number[] = [];
  private loadingFlights: number[] = [];
  private expandedFlight: number = null;

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
    , private userService: UserService) { }

  ngOnChanges() {
    this.mapService.clearMap();

    if (this.dayId > 0) {
      this.loadDay(this.dayId);
    }
  }

  ngAfterViewInit() {
    this.mapService.createMap('mapid');

  }

  onTaskUploaded() {
    this.loadDay(this.day.Id);
  }


  private deleteDay() {
    var url = this.apiService.apiBaseUrl + "/Day/Delete?id=" + this.day.Id;
    this.http.delete(url).subscribe(() => {
      this.deleted.emit();
    });
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
          this.day.Flights.forEach(f => this.flightService.fix(f));//TODO: move to service or find better solution
          this.setScores();
          this.mapService.showTask(this.day.XcSoarTask);
        }

      })
  }




  private setScores() {
    this.scoring.setFlightScrores(this.day.Flights)
    console.log("dayComponent::setScores");
  }

  private uploadFlight(files: FileList) {
    this.isInProgress = true
    this.flightService.uploadFlight(files, this.day.Id).subscribe((uploadedFlight) => {

      if (uploadedFlight.Finished == null) {

        let scoring = this.scoring.getFlightScoring(uploadedFlight, this.day.XcSoarTask);
        this.flightService.updateFlightScoring(uploadedFlight, scoring).subscribe((updatedFlight) => {
          this.day.Flights = [...this.day.Flights, updatedFlight];
          this.selectedFlightIds = [];


          this.expandFlight(updatedFlight);
        });
      }
    });
  }


  private toggleSelect(flight: IFlight) {
    console.log("toggleSelect");
    if (this.selectedFlightIds.indexOf(flight.Id) < 0) {
      this.selectFlight(flight);
    }
    else {
      this.deselectFlight(flight);
    }
  }

  private deselectFlight(flight: IFlight) {
    console.log("deselectFlight");        
    this.selectedFlightIds = this.removeFromArray(this.selectedFlightIds, flight.Id);
    this.mapService.clearFlights();
      this.day.Flights
        .filter(x => x.Id != flight.Id && this.selectedFlightIds.indexOf(x.Id) >= 0)
        .forEach(f => this.mapService.addFlight(f));
  }

  private selectFlight(flight: IFlight): Observable<IFlight> {
    console.log("selectFlight");    
    this.loadingFlights.push(flight.Id);
    this.selectedFlightIds.push(flight.Id);
    var obs = this.flightService.getFlight(flight.Id);

    obs.subscribe(loadedFlight => {
      console.log("DayComponent::selectFlight::loaded");
      
      this.isInProgress = false;
      this.loadingFlights = this.loadingFlights.filter(x => x != loadedFlight.Id);      
      this.mapService.addFlight(loadedFlight);      
      this.replace(loadedFlight);

      this.mapService.clearFlights();
      this.day.Flights
        .filter(x => this.selectedFlightIds.indexOf(x.Id) >= 0)
        .forEach(f => this.mapService.addFlight(f));
    });
    return obs;
  }


  private replace(newFlight: IFlight) {
    var f = this.day.Flights.filter(x => x.Id == newFlight.Id)[0];
    newFlight.Score = f.Score;
    var index = this.day.Flights.indexOf(f);
    this.day.Flights[index] = newFlight;
    this.day.Flights = [...this.day.Flights];
  }

  private collapseFlight(flight: IFlight) {
    console.log("DayComponent::collapseFlight");
    this.expandedFlight = null;
  }

  private expandFlight(flight: IFlight) {
    console.log("DayComponent::flightExpanded");   
    this.selectedFlightIds = [];
    this.selectFlight(flight).subscribe(() => {      
      this.expandedFlight = flight.Id;
    });  
  }

  private onTurnpointsChanged(flight: IFlight): void {
    this.mapService.clearFlights();
    this.mapService.addFlight(flight, true)
  }

  private applyFlightUpdates(flight: IFlight): void {
    this.flightService.updateFlight(flight).subscribe(() => {
      this.loadDay(this.dayId);
    });

  }

  private deleteFlight(flight: IFlight) {
    this.flightService.deleteFlight(flight.Id).subscribe(() => {
      this.loadDay(this.dayId);
    });
  }

  private addToArray(array: number[], value: number) {
    if (array.indexOf(value) < 0) {
      array.push(value);
    }
  }

  private removeFromArray(array: number[], value: number) {
    if (array.indexOf(value) >= 0) {
      array = array.filter(x => x != value);
      console.log("CompetitionDayComponent::removeFromArray:", array);
      return [...array];
    }
    return array;
  }
}
