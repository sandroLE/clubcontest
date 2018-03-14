import { MapService } from './map.service';
import { ITask } from './../models/task';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import * as L from 'leaflet';

declare var turf;

@Injectable()
export class GeoUtilService {

  constructor() {

  }

  public createStartLine(task: ITask, map: L.Map): L.Polyline {
    var bearingToNextWP = turf.bearing(
      turf.point([task.TaskPoints[0].Latitude, task.TaskPoints[0].Longitude])
      , turf.point([task.TaskPoints[1].Latitude, task.TaskPoints[1].Longitude])
    )

    var l1 = L.latLng(task.TaskPoints[0].Latitude, task.TaskPoints[0].Longitude);
    var l2 = L.latLng(task.TaskPoints[1].Latitude, task.TaskPoints[1].Longitude);
    
    var LGeometryUtil: any = (<any>L).GeometryUtil;
    var leftPoint: L.LatLng = LGeometryUtil.rotatePoint(map, l2, -90, l1);
    var rightPoint: L.LatLng = LGeometryUtil.rotatePoint(map, l2, +90, l1);
    
    var lb = LGeometryUtil.bearing(l1, leftPoint);
    var rb = LGeometryUtil.bearing(l1, rightPoint);
    
    var l = LGeometryUtil.destination(l1,lb, task.TaskPoints[0].ObservationZone.Length/2);
    var r = LGeometryUtil.destination(l1,rb, task.TaskPoints[0].ObservationZone.Length/2);
    return L.polyline([l, r]);
  }


  public createFinishLine(task: ITask, map: L.Map): L.Polyline {

    var lastTP = task.TaskPoints[task.TaskPoints.length-1];
    var beforeLastTP = task.TaskPoints[task.TaskPoints.length-2];

    var bearingToNextWP = turf.bearing(
      turf.point([lastTP.Latitude, lastTP.Longitude])
      , turf.point([beforeLastTP.Latitude, beforeLastTP.Longitude])
    )

    var l1 = L.latLng(lastTP.Latitude, lastTP.Longitude);
    var l2 = L.latLng(beforeLastTP.Latitude, beforeLastTP.Longitude);
    
    var LGeometryUtil: any = (<any>L).GeometryUtil;
    var leftPoint: L.LatLng = LGeometryUtil.rotatePoint(map, l2, -90, l1);
    var rightPoint: L.LatLng = LGeometryUtil.rotatePoint(map, l2, +90, l1);
    
    var lb = LGeometryUtil.bearing(l1, leftPoint);
    var rb = LGeometryUtil.bearing(l1, rightPoint);
    
    var l = LGeometryUtil.destination(l1,lb, lastTP.ObservationZone.Length / 2);
    var r = LGeometryUtil.destination(l1,rb, lastTP.ObservationZone.Length / 2);
    return L.polyline([l, r]);
  }


  public radians(n) {
    return n * (Math.PI / 180);
  }
  private degrees(n) {
    return n * (180 / Math.PI);
  }

  public getBearing(startLat, startLong, endLat, endLong) {
    startLat = this.radians(startLat);
    startLong = this.radians(startLong);
    endLat = this.radians(endLat);
    endLong = this.radians(endLong);

    var dLong = endLong - startLong;

    var dPhi = Math.log(Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0));
    if (Math.abs(dLong) > Math.PI) {
      if (dLong > 0.0)
        dLong = -(2.0 * Math.PI - dLong);
      else
        dLong = (2.0 * Math.PI + dLong);
    }

    return (this.degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
  }

  destination(startLat: number, startLon: number, brng, dist) {
    dist = dist / 6371;  // convert dist to angular distance in radians
    brng = this.radians(brng);

    var lon1 = this.radians(startLat);
    var lat1 = this.radians(startLon);

    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
      Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));
    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) * Math.cos(lat1),
      Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2));
    lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180..+180º

    return {
      'type': 'Point',
      'coordinates': [this.degrees(lon2), this.degrees(lat2)]
    };
  }



}
