import { GeoUtilService } from './../geoUtil.service';
import { MapService } from './../map.service';
import { ITask } from './../../models/task';
import { ILoggerPoint, IFlight, IFlightScoring } from './../../models/flight';

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
        var finishTP = task.TaskPoints[task.TaskPoints.length - 1];
        var leafLetFinishLine = this.geoUtil.createFinishLine(task, this.mapService.map);
        var turfFinishLine = turf.lineString([
            [leafLetFinishLine.getLatLngs()[0].lat, leafLetFinishLine.getLatLngs()[0].lng],
            [leafLetFinishLine.getLatLngs()[1].lat, leafLetFinishLine.getLatLngs()[1].lng],
        ]);

        var startSections: ILoggerPoint[] = [];
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
                    startSections.push(finish);
                }
            }
        }
        return startSections;
    }


    private isCorrectStartlineCrossingDirection(flight: number[][], task: ITask): boolean {
        var bearingToNextWP = this.geoUtil.getBearing(
            task.TaskPoints[0].Latitude, task.TaskPoints[0].Longitude,
            task.TaskPoints[1].Latitude, task.TaskPoints[1].Longitude);
        var flightBearing = this.geoUtil.getBearing(
            flight[0][0], flight[0][1]
            , flight[1][0], flight[1][1]);
        var max = bearingToNextWP + 90;
        var min = bearingToNextWP - 90;
        var diff = Math.max(bearingToNextWP, flightBearing) - Math.min(bearingToNextWP, flightBearing);
        return min <= bearingToNextWP - diff && bearingToNextWP + diff <= max;
    }


    private isCorrectFinishLineCrossingDirection(flight: number[][], task: ITask): boolean {
        var finishTP = task.TaskPoints[task.TaskPoints.length - 1];
        var beforeFinishTP = task.TaskPoints[task.TaskPoints.length - 2];
        var finishLineBearing = this.geoUtil.getBearing(
            beforeFinishTP.Latitude, beforeFinishTP.Longitude,
            finishTP.Latitude, finishTP.Longitude);
        var flightBearing = this.geoUtil.getBearing(
            flight[0][0], flight[0][1],
            flight[1][0], flight[1][1]);
        var max = finishLineBearing + 90;
        var min = finishLineBearing - 90;
        var diff = Math.max(finishLineBearing, flightBearing) - Math.min(finishLineBearing, flightBearing);
        return min <= finishLineBearing - diff && finishLineBearing + diff <= max;
    }

}