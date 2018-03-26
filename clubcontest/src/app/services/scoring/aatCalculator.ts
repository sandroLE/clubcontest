import { TaskCalculator } from './taskCalculator';
import { TaskScoringService } from './../taskScoring.service';
import { GeoUtilService } from './../geoUtil.service';
import { MapService } from './../map.service';
import { ITask, ITaskPoint } from './../../models/task';
import { IFlight, IFlightScoring, ILoggerPoint } from './../../models/flight';
import * as L from 'leaflet';

declare var turf;

export class AatCalculator extends TaskCalculator {

    constructor(mapService: MapService, geoUtil: GeoUtilService) {
        super(mapService, geoUtil);
    }




    public getFlightScoring(flight: IFlight, task: ITask): IFlightScoring {
        var starts = this.getStart(flight.Points, task);
        var finishs = this.getFinish(flight.Points, task)
        var turnpoints = [...task.TaskPoints];
        let scorings: IFlightScoring[] = [];

        for (let start of starts) {
            var validFinishs = finishs
                .filter(x => start.Time.getTime() < x.Time.getTime())
                .sort((a, b) => a.Time.getTime() - b.Time.getTime());

            let earliestFinish: ILoggerPoint;
            for (let finish of validFinishs) {
                if (earliestFinish == null) {
                    var bestTurnPoints: ILoggerPoint[] = [];
                    for (let i = 1; i < task.TaskPoints.length - 1; i++) {
                        let tp = this.findBestTurnPoint(flight.Points, task, start, finish, i);
                        if (tp == null || tp.Time > finish.Time || tp.Time < start.Time) {
                            tp = null;
                        }
                        bestTurnPoints.push(tp);
                    }

                    if (bestTurnPoints.every(x => x != null)) {
                        let points = [start, ...bestTurnPoints, earliestFinish || finish];
                        var result = this.calculateFlight(task, points);
                        scorings.push(result);
                        earliestFinish = finish;                        
                    }
                }
            }
        }


        return scorings.sort((a, b) => { return a.speed - b.speed }).pop();
    }




    private findBestTurnPoint(points: ILoggerPoint[], task: ITask, start: ILoggerPoint, finish: ILoggerPoint, index: number): ILoggerPoint {

        var prev: ILoggerPoint
            = index == 1
                ? start
                : {
                    Latitude: task.TaskPoints[index - 1].Latitude,
                    Longitude: task.TaskPoints[index - 1].Longitude,
                    Time: null
                }

        var next
            = index >= task.TaskPoints.length - 2
                ? finish
                : {
                    Latitude: task.TaskPoints[index + 1].Latitude,
                    Longitude: task.TaskPoints[index + 1].Longitude,
                    Time: null
                }


        var allInObservationZone = this.getAllInObservationZone(task.TaskPoints[index], points);
        var allInTime = allInObservationZone.filter((p) => {
            return p.Time > prev.Time || start.Time && p.Time < finish.Time;
        });

        var maxDistance = 0;
        var maxDistanceIndex = -1;

        var turfPrevPoint = turf.point([prev.Latitude, prev.Longitude]);
        var turfNext = turf.point([next.Latitude, next.Longitude]);

        var max: ILoggerPoint = null;
        allInTime.forEach((p) => {
            var turfPoint = turf.point([p.Latitude, p.Longitude]);
            var distance = turf.distance(turfPrevPoint, turfPoint, "meters") + turf.distance(turfPoint, turfNext, "meters");
            if (distance > maxDistance) {
                maxDistance = distance;
                max = p;
            }
        });
        return max;
    }


    private getAllInObservationZone(taskPoint: ITaskPoint, points: ILoggerPoint[]): ILoggerPoint[] {
        var turfTP = turf.point([taskPoint.Latitude, taskPoint.Longitude]);
        var matching = points.filter(p => {
            var turfPoint = turf.point([p.Latitude, p.Longitude]);
            var distance = L.latLng(taskPoint.Latitude, taskPoint.Longitude).distanceTo(L.latLng(p.Latitude, p.Longitude));
            var isInObservationZone = distance < taskPoint.ObservationZone.Radius;
            return isInObservationZone;
        });
        return matching;
    }


    public calculateFlight(task: ITask, turnPoints: ILoggerPoint[]): IFlightScoring {

        if (turnPoints.some(x => x == null)) {
            return { points: turnPoints, totalDistance: 0, time: 0, speed: 0, finished: false };
        }
        var start = turnPoints[0];
        var finish = turnPoints[turnPoints.length - 1];
        let totalDistance = TaskCalculator.getTotalDistance(turnPoints)/*m*/ / 1000/*km*/;
        let time = Math.max(
            (finish.Time.getTime() - start.Time.getTime())/*msec*/ / 1000/*sec*/ / 60/*min*/ / 60/*h*/
            , task.AatMinTime / 60 / 60
        );
        let speed = totalDistance / time;
        let finished = turnPoints.every(x => x != null);
        return { points: turnPoints, totalDistance, time, speed, finished };
    }



}