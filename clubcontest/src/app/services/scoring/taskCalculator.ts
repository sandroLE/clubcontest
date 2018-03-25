import { GeoUtilService } from './../geoUtil.service';
import { MapService } from './../map.service';
import { ITask, ITaskPoint } from './../../models/task';
import { ILoggerPoint, IFlight, IFlightScoring } from './../../models/flight';
import * as L from 'leaflet';

declare var turf;

export abstract class TaskCalculator {


    constructor(protected mapService: MapService, protected geoUtil: GeoUtilService) {
    }

    public abstract getFlightScoring(flight: IFlight, task: ITask): IFlightScoring;
    public abstract calculateFlight(task:ITask, turnPoints: ILoggerPoint[]): IFlightScoring ;

    public static getTotalDistance(points: ILoggerPoint[]): number {
        let loggerPoints = [...points];
        let distance = 0;
        let prev: L.LatLng = null;
        while (loggerPoints.length > 0) {
            let popped = loggerPoints.pop();
            if (popped == null) {
                return distance;
            }
            let poppedLatLng = L.latLng(popped.Latitude, popped.Longitude);
            if (prev != null) {
                distance += prev.distanceTo(poppedLatLng);
            }
            prev = poppedLatLng;
        }
        return distance;
    }

    protected getStart(points: ILoggerPoint[], task: ITask): ILoggerPoint[] {
        var leafLetStartLine = this.geoUtil.createStartLine(task, this.mapService.map);
        var turfStartLine = turf.lineString([
            [leafLetStartLine.getLatLngs()[0].lat, leafLetStartLine.getLatLngs()[0].lng],
            [leafLetStartLine.getLatLngs()[1].lat, leafLetStartLine.getLatLngs()[1].lng],
        ]);

        var startSections: ILoggerPoint[] = [];
        for (var i = 0; i < points.length - 2; i++) {
            var loggerPoint = points[i];
            var loggerPointNext = points[i + 1];
            var flightSectionLatLngs = [[loggerPoint.Latitude, loggerPoint.Longitude], [loggerPointNext.Latitude, loggerPointNext.Longitude]];
            var flightSection = turf.lineString(flightSectionLatLngs);
            var intersection = turf.intersect(flightSection, turfStartLine);
            if (intersection) {
                var isSameDirection = this.isCorrectStartlineCrossingDirection(flightSectionLatLngs, task);
                if (isSameDirection) {
                    var startPoint = {
                        Latitude: intersection.geometry.coordinates[0],
                        Longitude: intersection.geometry.coordinates[1],
                        Time: loggerPoint.Time
                    };
                    startSections.push(startPoint);
                }
            }
        }
        return startSections;
    }



    protected getFinish(points: ILoggerPoint[], task: ITask): ILoggerPoint[] {
        let finishPoint = task.TaskPoints.find(x => x.Type == "Finish");
        return finishPoint.ObservationZone.Type == "Line" 
            ? this.getFinishOverLine(points, task, finishPoint) 
            : this.getFinishOverCylinder(points,finishPoint);
    }


    private getFinishOverCylinder(points: ILoggerPoint[], finishPoint:ITaskPoint): ILoggerPoint[] {               
        let finish = L.latLng(finishPoint.Latitude, finishPoint.Longitude);
        let finishSections = points.filter(x => finish.distanceTo(L.latLng(x.Latitude, x.Longitude)) <= finishPoint.ObservationZone.Radius);
        
        return finishSections;
    }


    private getFinishOverLine(points: ILoggerPoint[], task:ITask, finishPoint:ITaskPoint): ILoggerPoint[] {
        
        var leafLetFinishLine = this.geoUtil.createFinishLine(task, this.mapService.map);
        var turfFinishLine = turf.lineString([
            [leafLetFinishLine.getLatLngs()[0].lat, leafLetFinishLine.getLatLngs()[0].lng],
            [leafLetFinishLine.getLatLngs()[1].lat, leafLetFinishLine.getLatLngs()[1].lng],
        ]);

        var finishSections: ILoggerPoint[] = [];
        for (var i = 0; i < points.length - 2; i++) {
            var loggerPoint = points[i];
            var loggerPointNext = points[i + 1];
            var flightSectionLatLngs = [[loggerPoint.Latitude, loggerPoint.Longitude], [loggerPointNext.Latitude, loggerPointNext.Longitude]];
            var flightSection = turf.lineString(flightSectionLatLngs);
            var intersection = turf.intersect(flightSection, turfFinishLine);
            if (intersection) {
                var isSameDirection = this.isCorrectFinishLineCrossingDirection(flightSectionLatLngs, task);
                if (isSameDirection) {
                    var finish = {
                        Latitude: intersection.geometry.coordinates[0],
                        Longitude: intersection.geometry.coordinates[1],
                        Time: loggerPoint.Time
                    }
                    finishSections.push(finish);
                }
            }
        }
        return finishSections;
    }




    private isCorrectStartlineCrossingDirection(flight: number[][], task: ITask): boolean {
        var v1 = new Vector(task.TaskPoints[0].Latitude-task.TaskPoints[1].Latitude,task.TaskPoints[0].Longitude-task.TaskPoints[1].Longitude );
        var v2 = new Vector(flight[0][0]-flight[1][0], flight[0][1]- flight[1][1]);
        return v1.mult(v2) > 0;
    }

    private isCorrectFinishLineCrossingDirection(flight: number[][], task: ITask): boolean {
        var finishTP = task.TaskPoints[task.TaskPoints.length - 1];
        var beforeFinishTP = task.TaskPoints[task.TaskPoints.length - 2];
        var v1 = new Vector(finishTP.Latitude-beforeFinishTP.Latitude, finishTP.Longitude-beforeFinishTP.Longitude);
        var v2 = new Vector(flight[0][0]-flight[1][0], flight[0][1]- flight[1][1]);
        return v1.mult(v2) < 0;
    }
}


export class Vector{
    constructor(private a:number, private b:number){
    }

    public mult(v:Vector):number{
        return this.a*v.a + this.b * v.b;
    }
}