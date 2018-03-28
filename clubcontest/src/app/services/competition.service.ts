
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ICompetition } from '../models/competition';
import { UserService } from './user.service';
import { MapService } from './map.service';



@Injectable()
export class CompetitionService {

    getParsedWaypoints(): { name: string, lat: number, lng: number }[] {
        return this.parsedWayPoints;
    }
    private competition: ICompetition;
    private parsedWayPoints: { name: string, lat: number, lng: number }[] = [];

    constructor(private http: Http
        , private apiServie: ApiService
        , public userService: UserService
    , private mapService:MapService) {
    }

    public getCompetition(competitionName: string) {
        var url = this.apiServie.apiBaseUrl + `/Competition/Get?name=${competitionName}`
        return this.http.get(url).map(x => {
            this.competition = x.json();
            this.parsedWayPoints = this.parseWaypoints(this.competition.Waypoints);
            this.mapService.parsedWayPoints = this.parsedWayPoints;
            return this.competition;
        });
    }


    private parseWaypoints(text: string): { name: string, lat: number, lng: number }[] {
        try {
            var result: { name: string, lat: number, lng: number }[] = [];

            if (text == null) {
                return result;
            }

            var lines = text.split(/\r?\n/);
            lines.forEach(line => {
                var wp = this.parseLine(line);
                if (wp != null) {
                    result.push(wp);
                }
            })
            return result;
        }
        catch (exception) {
            if (this.userService.currentUser.isAdmin) {
                alert("Wegpunkte konnten nicht geparst werden. Bitte Format prüfen")
            }
            return [];
        }
    }

    private parseLine(text: string): { name: string, lat: number, lng: number } {
        try {
            if (text.indexOf('"') < 0) {
                return null;
            }
            var words = text.split(',');
            var name = words[0].replace(/"/g, "");
            var latWord = words[3];
            var lngWord = words[4];
            var lat = (+latWord.substr(0, 2)) + (parseFloat(latWord.substr(2, 6)) / 60);
            var lng = (+lngWord.substr(0, 3)) + (parseFloat(lngWord.substr(3, 6)) / 60);

            if (Number.isNaN(lat) || Number.isNaN(lng)) {
                return null;
            }
            return { name, lat, lng };
        }
        catch (exception) {
            return null;
        }
    }

}
