import { ICompetition } from './../../models/competition';
import { UserService } from './../../services/user.service';
import { ApiService } from './../../services/api.service';
import { FlightService } from './../../services/flight.service';
import { TaskScoringService } from './../../services/taskScoring.service';
import { MapService } from './../../services/map.service';
import { GeoUtilService } from './../../services/geoUtil.service';
import { ITask, ITaskPoint } from './../../models/task';
import { IFlight } from './../../models/flight';
import { IDay } from './../../models/day';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'leaflet-geometryutil';

@Component({
  selector: 'app-competition-settings',
  templateUrl: './competition-settings.component.html',
  styleUrls: ['./competition-settings.component.css']
})
export class CompetitionSettingsComponent {

  @Input() public competition: ICompetition = null;
  private allowedUsers: "everyone" |"byMail" = "everyone" ;

  constructor(private api:ApiService, public userService: UserService){

  }

  ngOnChange(){
    this.allowedUsers = this.competition.AdminUsers === "" ? "everyone" : "byMail"
  }

  public save(){
     this.api.updateCompetition(this.competition).subscribe(x => {
       alert("Einstellungen wurden erfolgreich gespeichert");
     }, (error) => {
       console.error("Es ist ein Fehler beim Speichern aufgetreten",error);
       alert("Es ist ein Fehler beim Speichern aufgetreten");
     });
  }

}
