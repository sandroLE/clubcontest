import 'rxjs/add/operator/takeUntil';
import { UserService } from './../../../services/user.service';
import { MapService } from './../../../services/map.service';
import { TaskScoringService } from './../../../services/taskScoring.service';
import { GeoUtilService } from './../../../services/geoUtil.service';
import { ITask, ITaskPoint, IObservationZone } from './../../../models/task';
import { IFlight, ILoggerPoint } from './../../../models/flight';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.css']
})



export class FlightComponent {

  private turnpoints: ILoggerPoint[] = [];

  private _isExpanded = false;
  @Output()
  private expand = new EventEmitter<void>();

  @Output()
  private collapse = new EventEmitter<void>();

  @Input()
  public set isExpanded(value: boolean) { this._isExpanded = value; }
  public get isExpanded() { return this._isExpanded; }

  @Output()
  private delete = new EventEmitter<void>();
  @Output()
  private turnpointsChanged = new EventEmitter<IFlight>();


  private selectedGlider: string;

  @Output() private changed = new EventEmitter<IFlight>();

  @Input() task: ITask;

  constructor(private geoUtil: GeoUtilService, private scoring: TaskScoringService, private map: MapService, public userService: UserService) {

  }

  ngOnInit() {
    this.gliderTypes = this.gliderTypes.sort((a, b) => { return a.name == b.name ? 0 : a.name < b.name ? -1 : 1; })
  }

  private _flight: IFlight
  @Input()
  get flight(): IFlight { return this._flight; }
  set flight(value: IFlight) { this._flight = value; this.onFlightChanged(); }

  @Input() selected = false;
  @Output() clicked = new EventEmitter<void>();
  @Input() isLoading = false;




  toggleExpand($event: MouseEvent) {
    console.log("FlightComponent::expand clicked")
    $event.stopPropagation();
    $event.preventDefault();

    if (this.isExpanded) {
      this.collapse.emit();
    }
    else {
      this.expand.emit();
    }
  }

  public onClick() {
    this.clicked.emit();
  }

  private save() {
    this.flight.GliderType = this.selectedGlider;
    this.flight.Handicap = this.getHandicap(this.flight.GliderType);
    this.changed.emit(this.flight);
  }

  private getHandicap(gliderType): number {
    let selectedItem = this.gliderTypes.filter(x => x.name == gliderType);
    if (selectedItem && selectedItem.length > 0) {
      return selectedItem[0].index;
    }
    return 1;
  }

  private onFlightChanged() {
    if (!this.flight.GliderType) {
      this.flight.GliderType = this.gliderTypes[0].name;
    }
    this.selectedGlider = this.flight.GliderType;
    this.turnpoints = this.flight.turnPoints;
  }

  private onDeleteButtonClicked() {
    this.delete.emit();
  }

  private recalculate() {
    var scoring = this.scoring.getFlightScoring(this.flight, this.task);
    console.log(scoring);
    if (scoring && scoring.points.every(x => x != null)) {
      this.flight.Speed = scoring.speed;
      this.flight.Distance = scoring.totalDistance;
      this.flight.Finished = scoring.finished;
      this.flight.Duration = scoring.time;
      this.flight.turnPoints = scoring.points;
    }
    else {
      this.flight.Speed = 0;
      this.flight.Distance = 0;
      this.flight.Finished = false;
      this.flight.Duration = 0;
      this.flight.turnPoints = [];
    }
    this.turnpoints = this.flight.turnPoints;
    this.turnpointsChanged.emit(this.flight);

  }


  private editTurnpointLocation(index: number) {

    this.map
      .almostOverMove(this.flight)
      .takeUntil(this.map.almostOverClick())
      .map((e: any) => e.latlng)
      .subscribe((location) => {

        var found = this.flight.Points.filter((x) => {

          var latDiff = Math.abs(x.Latitude - location.lat);
          var lngDiff = Math.abs(x.Longitude - location.lng);
          return latDiff < 0.0002 && lngDiff < 0.0002;
        });

        found.sort((a, b) => {
          return ((b.Latitude - location.lat) + (b.Longitude - location.lng)) - ((a.Latitude - location.lat) + (a.Longitude - location.lng));
        })

        if (found.length > 0) {
          var prevTP = index > 0 ? this.flight.turnPoints[index - 1] : null;
          var nextTP = index < this.flight.turnPoints.length - 1 ? this.flight.turnPoints[index + 1] : null;
          if (prevTP && prevTP.Time > found[0].Time) {
            return;
          }
          if (nextTP && nextTP.Time < found[0].Time) {
            return;
          }
          this.flight.turnPoints[index] = { Latitude: found[0].Latitude, Longitude: found[0].Longitude, Time: found[0].Time };
          if (this.flight.turnPoints[index].Time == null){
            throw "turnpoint without time!!";
          }
          this.map.setAlmostOverMarker(L.latLng(found[0].Latitude, found[0].Longitude));
          var flightScoring = this.scoring.calculateFlight(this.task, this.flight.turnPoints);
          this.flight.Speed = flightScoring.speed;
          this.flight.Distance = flightScoring.totalDistance;
          this.flight.Duration = flightScoring.time;
          this.flight.Finished = flightScoring.finished;
        }

      }
      , () => alert("error")
      , () => {
        console.log("FlightComponent::almostOverMove::completed")
        this.turnpointsChanged.emit(this.flight);
      });
  }

  private gliderTypes = [
    { name: "Eta", index: 1.25 },
    { name: "NimEta", index: 1.25 },
    { name: "EB 29", index: 1.25 },
    { name: "ASH 30", index: 1.24 },
    { name: "Nimbus 4 4M / 4T", index: 1.24 },
    { name: "ASW 22BL / BLE", index: 1.24 },
    { name: "EB 28", index: 1.24 },
    { name: "ASH 25 / E / M ≥ 26m", index: 1.23 },
    { name: "ASH 25 EB 28", index: 1.23 },
    { name: "ASW 22 B / BE", index: 1.23 },
    { name: "Nimbus 4D / M / T", index: 1.23 },
    { name: "Antares 23m", index: 1.23 },
    { name: "Quintus", index: 1.23 },
    { name: "ASH 25 / E / M", index: 1.22 },
    { name: "JS1-C 21m", index: 1.22 },
    { name: "LAK 20T 26m", index: 1.22 },
    { name: "Nimbus 3 / M / T 25,5m", index: 1.22 },
    { name: "AS 22-2", index: 1.21 },
    { name: "ASH 31 / Mi 21m", index: 1.21 },
    { name: "ASW 22 / E 24m", index: 1.21 },
    { name: "Nimbus 3 / T 24,5m", index: 1.21 },
    { name: "Antares 20m", index: 1.20 },
    { name: "LAK 20T 23m", index: 1.20 },
    { name: "LF 20 20m", index: 1.20 },
    { name: "Nimbus 3D / M / T", index: 1.20 },
    { name: "ASW 22 22m", index: 1.19 },
    { name: "Nimbus 3 22,9m", index: 1.19 },
    { name: "Glasflügel 604/24m", index: 1.18 },
    { name: "LS 5", index: 1.18 },
    { name: "SB 10", index: 1.18 },
    { name: "ASW 17", index: 1.15 },
    { name: "Glasflügel 604", index: 1.14 },
    { name: "Kestrel 22m", index: 1.14 },
    { name: "LAK 12", index: 1.14 },
    { name: "Nimbus 2 / b / c / M", index: 1.14 },
    { name: "Jantar 2 / b", index: 1.13 },
    { name: "Jantar 19m", index: 1.12 },
    { name: "Kestrel 19m", index: 1.12 },
    { name: "ASW 12", index: 1.10 },
    { name: "DG 500+505 / M 22m", index: 1.10 },
    { name: "Stemme S 10 / VT", index: 1.10 },
    { name: "B 13", index: 1.09 },
    { name: "Mü 27", index: 1.06 },
    { name: "ASG 29 18m", index: 1.19 },
    { name: "JS 1 Revelation 18m", index: 1.19 },
    { name: "Ventus 2cxa 18m", index: 1.19 },
    { name: "Antares 18S / T", index: 1.18 },
    { name: "ASH 31 Mi 18m", index: 1.18 },
    { name: "DG-800/808 18m", index: 1.18 },
    { name: "HPH 304 / S Shark", index: 1.18 },
    { name: "LF20 18m", index: 1.18 },
    { name: "LS 10 18m", index: 1.18 },
    { name: "SB 14", index: 1.18 },
    { name: "Ventus 2c / M / T 18m", index: 1.18 },
    { name: "ASH 26 / E", index: 1.17 },
    { name: "LAK 17 18m", index: 1.17 },
    { name: "LS 6 18m", index: 1.17 },
    { name: "LS 9", index: 1.17 },
    { name: "DG-600 / M 18m", index: 1.16 },
    { name: "LS 6 17,5m", index: 1.16 },
    { name: "Ventus / bT / cM / cT 17,6m", index: 1.15 },
    { name: "ASW 28 / E 18m", index: 1.14 },
    { name: "Discus 2 / T 18m", index: 1.14 },
    { name: "LAK 19 18m", index: 1.14 },
    { name: "LS 8 / T 18m", index: 1.14 },
    { name: "DG-600 / M 17m", index: 1.13 },
    { name: "Ventus / bT 16,6m", index: 1.13 },
    { name: "ASW 20 16,6m", index: 1.12 },
    { name: "Glasflügel 304 17m", index: 1.12 },
    { name: "Glasflügel 304CZ 17,4 m", index: 1.12 },
    { name: "ASW 20 Top 16,6m", index: 1.10 },
    { name: "Kestrel 17m", index: 1.10 },
    { name: "DG-200 17m", index: 1.09 },
    { name: "DG-400 17m", index: 1.09 },
    { name: "LS 3 17m", index: 1.09 },
    { name: "Mosquito 17m", index: 1.09 },
    { name: "BS 1", index: 1.08 },
    { name: "D 36", index: 1.08 },
    { name: "Diamant 18m", index: 1.08 },
    { name: "Mü 26", index: 1.02 },
    { name: "Cobra 17m", index: 1.00 },
    { name: "Std. Libelle 17m", index: 1.00 },
    { name: "Diana 2", index: 1.14 },
    { name: "Ventus 2 / ax", index: 1.14 },
    { name: "Ventus 2 cM / cT 15m", index: 1.14 },
    { name: "ASG 29 15m", index: 1.14 },
    { name: "ASW 27 15m", index: 1.14 },
    { name: "DG-800/808 15m", index: 1.13 },
    { name: "LAK 17 15m", index: 1.13 },
    { name: "LS 10 15m", index: 1.13 },
    { name: "SZD 56 Diana", index: 1.12 },
    { name: "LS 6", index: 1.11 },
    { name: "ASW 20", index: 1.10 },
    { name: "G-600 / M", index: 1.10 },
    { name: "lasflügel 304 / CZ", index: 1.10 },
    { name: "Ventus 1", index: 1.10 },
    { name: "Ventus b / bT / cM 15m", index: 1.10 },
    { name: "ASW 20 Top", index: 1.08 },
    { name: "SB 11", index: 1.08 },
    { name: "fs 32", index: 1.08 },
    { name: "DG- 200", index: 1.07 },
    { name: "DG-400", index: 1.07 },
    { name: "LS 3 / a", index: 1.07 },
    { name: "Mini Nimbus", index: 1.07 },
    { name: "Mosquito", index: 1.07 },
    { name: "D 40", index: 1.06 },
    { name: "Speed Astir II", index: 1.05 },
    { name: "Pik 20 D / E", index: 1.04 },
    { name: "Pik 20 B", index: 1.02 },
    { name: "H 301", index: 1.00 },
    { name: "LS 2", index: 1.00 },
    { name: "ASW 28", index: 1.08 },
    { name: "Discus 2 / a / T", index: 1.08 },
    { name: "LAK 19 15m", index: 1.08 },
    { name: "LS 8", index: 1.08 },
    { name: "AK 8", index: 1.07 },
    { name: "ASW 24 / E", index: 1.07 },
    { name: "Discus / bM / bT", index: 1.07 },
    { name: "Genesis", index: 1.07 },
    { name: "LS 7 WL", index: 1.07 },
    { name: "LS 7", index: 1.06 },
    { name: "SZD 55", index: 1.06 },
    { name: "DG-300 WL", index: 1.05 },
    { name: "DG 303", index: 1.05 },
    { name: "LS 4 WL", index: 1.05 },
    { name: "AFH 24", index: 1.04 },
    { name: "DG-300", index: 1.04 },
    { name: "Glasflügel 304C", index: 1.04 },
    { name: "LS 4", index: 1.04 },
    { name: "Falkon", index: 1.03 },
    { name: "LS 3 Std.", index: 1.03 },
    { name: "SB 12", index: 1.03 },
    { name: "AK 5", index: 1.02 },
    { name: "Cirrus B 18,34m", index: 1.02 },
    { name: "DG-300 ohne EZ", index: 1.02 },
    { name: "Pegase", index: 1.02 },
    { name: "Hornet WL", index: 1.01 },
    { name: "SZD 59 WL", index: 1.01 },
    { name: "ASW 19", index: 1.00 },
    { name: "Cirrus / VTC 17,74m", index: 1.00 },
    { name: "D 37", index: 1.00 },
    { name: "Delphin I", index: 1.00 },
    { name: "DG 100", index: 1.00 },
    { name: "Elfe 17m", index: 1.00 },
    { name: "Hornet", index: 1.00 },
    { name: "LS 1 e / f", index: 1.00 },
    { name: "Phöbus B 3 / C", index: 1.00 },
    { name: "SB 7 Std. Astir", index: 1.00 },
    { name: "Std. Cirrus 16m", index: 1.00 },
    { name: "Std. Cirrus WL", index: 1.00 },
    { name: "Std. Jantar", index: 1.00 },
    { name: "SZD 59", index: 1.00 },
    { name: "Std. Cirrus", index: .99 },
    { name: "Apis 2 / M 15m / MCs", index: .98 },
    { name: "ASW 19 Club", index: .98 },
    { name: "Bee", index: .98 },
    { name: "Cobra 15", index: .98 },
    { name: "DG-100 Club", index: .98 },
    { name: "LS 1-0 / c / d", index: .98 },
    { name: "Pajno V1/2", index: .98 },
    { name: "Std. Cirrus Top", index: .98 },
    { name: "Std. Libelle", index: .98 },
    { name: "ASW 15", index: .97 },
    { name: "D 38", index: .97 },
    { name: "Astir CS / 77", index: .96 },
    { name: "Club Libelle", index: .96 },
    { name: "Elfe S3 / S4", index: .96 },
    { name: "IS 29 D", index: .96 },
    { name: "LS 1-0 ohne EZ", index: .96 },
    { name: "Mistral C", index: .96 },
    { name: "Phöbus B", index: .96 },
    { name: "Salto 15,5m", index: .96 },
    { name: "SHK", index: .96 },
    { name: "VSO-10", index: .96 },
    { name: "Mü 22b", index: .95 },
    { name: "Astir CS Top", index: .94 },
    { name: "Elfe ohne EZ", index: .94 },
    { name: "Phöbus A", index: .94 },
    { name: "Silent 2", index: .94 },
    { name: "TST-10 Atlas / M", index: .94 },
    { name: "VSO-10 C", index: .94 },
    { name: "Apis WR", index: .93 },
    { name: "Astir CS Jeans", index: .93 },
    { name: "Carat", index: .93 },
    { name: "ASK 23", index: .92 },
    { name: "fs 25", index: .92 },
    { name: "Kiwi", index: .92 },
    { name: "Phönix", index: .92 },
    { name: "G 102 Club Astir", index: .91 },
    { name: "Std. Austria SH1", index: .90 },
    { name: "SZD 51 Junior", index: .90 },
    { name: "Zugvogel IIIb", index: .90 },
    { name: "ASK 18", index: .88 },
    { name: "Foka", index: .88 },
    { name: "Geier", index: .88 },
    { name: "H 101 Salto", index: .88 },
    { name: "PIK 16 Vasama", index: .88 },
    { name: "Pilatus B4 mit EZ", index: .88 },
    { name: "SB 5 e", index: .88 },
    { name: "SF 27 B", index: .88 },
    { name: "Std. Austria SH", index: .88 },
    { name: "Zugvogel III a", index: .88 },
    { name: "Greif II", index: .86 },
    { name: "M-25", index: .86 },
    { name: "Pilatus B4 ohne EZ", index: .86 },
    { name: "SB 5 a / b / c", index: .86 },
    { name: "SF 27 A / MA", index: .86 },
    { name: "SF 30", index: .86 },
    { name: "SIE 3", index: .86 },
    { name: "Solo L 33", index: .86 },
    { name: "Std. Austria", index: .86 },
    { name: "SZD 30 Pirat", index: .86 },
    { name: "VT-16 Orlic", index: .86 },
    { name: "VT-116 Orlic 2", index: .86 },
    { name: "Zugvogel I / II / IV", index: .86 },
    { name: "Ka 6 E", index: .85 },
    { name: "Ka 10", index: .85 },
    { name: "PW 5", index: .85 },
    { name: "Alpin / T", index: .84 },
    { name: "H 30", index: .84 },
    { name: "Lambada UFM-15", index: .84 },
    { name: "Silent AE-1 / pure", index: .84 },
    { name: "Silent Club / pure", index: .84 },
    { name: "SF 26", index: .83 },
    { name: "ASK 14", index: .82 },
    { name: "Ka 6", index: .82 },
    { name: "Lambada UFM-13", index: .82 },
    { name: "SZD 22 Mucha Std.", index: .82 },
    { name: "Sagitta", index: .82 },
    { name: "SFS 31", index: .82 },
    { name: "LOM 57/1", index: .82 },
    { name: "Duo Banjo", index: .80 },
    { name: "Mucha", index: .80 },
    { name: "LCF II", index: .80 },
    { name: "Weihe 50", index: .80 },
    { name: "L-Spatz", index: .78 },
    { name: "Lunak LF 107", index: .78 },
    { name: "Swift S-1", index: .77 },
    { name: "Banjo", index: .76 },
    { name: "Ka 8", index: .76 },
    { name: "Minimoa", index: .76 },
    { name: "AV 36", index: .74 },
    { name: "RF 4", index: .74 },
    { name: "Spatz 13m", index: .74 },
    { name: "Piccolo", index: .68 },
    { name: "Rhönsperber", index: .62 },
    { name: "Rhönbussard", index: .60 },
    { name: "Grunau Baby", index: .54 },
    { name: "Ka 1 / 3 / 4", index: .54 },
    { name: "Doppelsitzer Klasse", index: 1.14 },
    { name: "Arcus / E / M / T", index: 1.14 },
    { name: "ASG 32", index: 1.14 },
    { name: "LS 11", index: 1.11 },
    { name: "Duo Discus XL", index: 1.11 },
    { name: "DG-1000 20m", index: 1.10 },
    { name: "Duo Discus / T", index: 1.10 },
    { name: "fs 33", index: 1.09 },
    { name: "Calif A 21 / -SJ", index: 1.08 },
    { name: "Janus C / CM / CT mit EZ", index: 1.08 },
    { name: "B 12", index: 1.06 },
    { name: "DG-1000 18m", index: 1.06 },
    { name: "Janus C / CM / CT ohne EZ", index: 1.06 },
    { name: "DG-500 / M 20m", index: 1.04 },
    { name: "DG-505 / M 20m", index: 1.04 },
    { name: "DG-505 M Orion 20m", index: 1.04 },
    { name: "Janus 18,2m", index: 1.02 },
    { name: "DG-500/505 Trainer mit EZ", index: 1.00 },
    { name: "DG- 505 6 Orion", index: 1.00 },
    { name: "fs 31", index: .99 },
    { name: "Taurus", index: .99 },
    { name: "Twin III 20m", index: .99 },
    { name: "AFH 22", index: .98 },
    { name: "DG-500/505 Trainer ohne EZ", index: .98 },
    { name: "Silence E 75", index: .98 },
    { name: "Twin III", index: .97 },
    { name: "G 103 Twin III / SL", index: .95 },
    { name: "Twin Astir mit EZ", index: .94 },
    { name: "ASK 21 / Mi", index: .92 },
    { name: "G 103 Twin II", index: .92 },
    { name: "Twin Astir Trainer ohne EZ", index: .92 },
    { name: "SF 34 mit EZ", index: .87 },
    { name: "PW 6", index: .86 },
    { name: "SF 34 ohne EZ", index: .86 },
    { name: "SZD 50 Puchacz", index: .80 },
    { name: "IS 28 B2", index: .84 },
    { name: "Bergfalke IV", index: .80 },
    { name: "Condor IV", index: .80 },
    { name: "Kranich III", index: .80 },
    { name: "L23 Super Blanik 18,2 m", index: .80 },
    { name: "ASK 13", index: .79 },
    { name: "Ka 2 B", index: .78 },
    { name: "Ka 7", index: .78 },
    { name: "L13 Blanik", index: .78 },
    { name: "L23 Super Blanik", index: .78 },
    { name: "Pipistrel Sinus", index: .78 },
    { name: "RF 10", index: .78 },
    { name: "RF 5 B", index: .78 },
    { name: "SF 28A", index: .78 },
    { name: "ASK 16", index: .76 },
    { name: "Bergfalke III", index: .76 },
    { name: "Bocian", index: .76 },
    { name: "IS 28 M", index: .76 },
    { name: "Ka 2", index: .76 },
    { name: "Kranich II", index: .76 },
    { name: "SZD-45 A", index: .76 },
    { name: "Puchatek", index: .75 },
    { name: "Bergfalke II", index: .74 },
    { name: "RF 5", index: .74 },
    { name: "SF-25 E", index: .74 },
    { name: "G 109B", index: .72 },
    { name: "MDM-1 Fox", index: .72 },
    { name: "Taifun 17E", index: .70 },
    { name: "Dimona", index: .68 },
    { name: "G109", index: .68 },
    { name: "H-36 Dimona", index: .68 },
    { name: "HK-36 Super Dimona", index: .68 },
    { name: "Samburo AVo68-R", index: .67 },
    { name: "SF-25C (2000)", index: .67 },
    { name: "SF-25C-S Falke 76", index: .67 },
    { name: "SF 25B Falke", index: .65 },
    { name: "Rhönlerche", index: .54 },
    { name: "Specht", index: .54 },


  ]
}

