import { TimespanStringPipe } from './../pipes/timespanString.pipe';
import { Observable, } from 'rxjs/Observable';
import { ApiService } from './api.service';
import { IFlight, IFlightScoring } from './../models/flight';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/publish'
import 'rxjs/Rx';

@Injectable()
export class FlightService {

    private flightObservables: { [id: number]: Observable<IFlight> } = {};

    constructor(private http: Http, private apiService: ApiService) {
    }

    public getFlight(id: number): Observable<IFlight> {

        if (!this.flightObservables[id]) {
            var url = this.apiService.apiBaseUrl + "/Flight/Get?id=" + id
            this.flightObservables[id] = this.http.get(url)
                .map(x => this.fix(x.json()))
                .publishReplay(1)
                .refCount()
        }
        return this.flightObservables[id];
    }

    public uploadFlight(files: FileList, dayId): Observable<IFlight> {
        var url = this.apiService.apiBaseUrl + "/Flight/Upload?dayId=" + dayId
        return this.apiService.uploadFile(files, url).map(x => this.fix(x.json()));
    }

    public fix(flight: IFlight) {
        if (flight.Points){
            flight.Points.forEach(p => { p.Time = new Date(p.Time); });      
        }
        flight.isSelected = false;
        flight.turnPoints = JSON.parse(flight.TurnPoints, (key, value) => { 
            if (key == "Time"){
                return new Date(value);
            }
            return value;
        });
        return flight;
    }

    public updateFlightScoring(f: IFlight, scoring: IFlightScoring): Observable<IFlight> {
        f.Finished = false;
        if (scoring != null) {
            f.Speed = scoring.speed;
            f.Distance = scoring.totalDistance;
            f.Duration = scoring.time;
            f.turnPoints = scoring.points;
            f.TurnPoints = JSON.stringify(f.turnPoints);
            f.Finished = scoring.finished;            
        }
        return this.updateFlight(f);
    }

    public updateFlight(f: IFlight): Observable<IFlight> {
        var headers = new Headers({
            'Content-Type': 'application/json',
        });

        let options = new RequestOptions({
            headers: headers
        });

        var url = this.apiService.apiBaseUrl + "/Flight/Update";
        return this.http.post(url,
            {
                id: f.Id,
                speed: f.Speed,
                distance: f.Distance,
                duration: f.Duration,
                finished: f.Finished,
                turnPoints: JSON.stringify(f.turnPoints),
                gliderType: f.GliderType,
                handicap: f.Handicap > 0 ? f.Handicap : 1,
                pilotName:f.PilotName
            }, options).map(x => this.fix(x.json()));
    }

    public deleteFlight(id: number):Observable<Response> {

        var headers = new Headers({
            'Content-Type': 'application/json',
        });

        let options = new RequestOptions({
            headers: headers
        });

        var url = this.apiService.apiBaseUrl + "/Flight/Delete?id=" + id;
        return this.http.delete(url, options);
        
        
    }



}
