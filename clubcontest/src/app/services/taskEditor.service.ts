
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { CompetitionService } from './competition.service';
import { ITask, ITaskPoint } from '../models/task';
import * as L from 'leaflet';
import { MapService } from './map.service';



@Injectable()
export class TaskEditorService {
    constructor(private competition: CompetitionService, private mapService:MapService) {
        
    }

    snap(taskPoint: ITaskPoint): ITaskPoint {
        let waypoints = this.competition.getParsedWaypoints();
        if (waypoints.length > 0) {
            let nearestWP = waypoints[0];
            let minDist = null;

            for (let wp of waypoints) {
                let dist = L.latLng(taskPoint.Latitude, taskPoint.Longitude).distanceTo(L.latLng(wp.lat, wp.lng));
                if (minDist == null || dist < minDist) {
                    minDist = dist;
                    nearestWP = wp;
                }
            }

            taskPoint.Latitude = nearestWP.lat;
            taskPoint.Longitude = nearestWP.lng;
            taskPoint.Name = nearestWP.name;
        }
        return taskPoint;
    }
}
