import { TaskCalculator } from './taskCalculator';
import { TaskScoringService } from './../taskScoring.service';
import { GeoUtilService } from './../geoUtil.service';
import { MapService } from './../map.service';
import { ITask, ITaskPoint } from './../../models/task';
import { IFlight, IFlightScoring, ILoggerPoint } from './../../models/flight';
import * as L from 'leaflet';

declare var turf;

export class RacingTaskCalculator extends TaskCalculator {

    constructor(mapService: MapService, geoUtil: GeoUtilService) {
        super(mapService, geoUtil);
    }

    public getFlightScoring(flight: IFlight, task: ITask): IFlightScoring {

        var starts = this.getStart(flight.Points, task);
        var finishs = this.getFinish(flight.Points, task)        
        let scorings: IFlightScoring[] = [];
        starts.forEach(start => {
            finishs.forEach(finish => {

                var turnPoints: ILoggerPoint[] = [];
                task.TaskPoints.forEach((taskPoint, i) => {
                    if (i == 0) return; //skip start;
                    if (i >= task.TaskPoints.length - 1) return //skip finish

                    let tp = this.findAnyTurnPoint(flight.Points, task, start, finish, i);

                    if (tp == null) {      
                        turnPoints.push(null);
                        return;
                    }

                    if (tp.Time > finish.Time || tp.Time < start.Time) {                       
                        turnPoints.push(null); 
                        return;
                    }
                    turnPoints.push(tp);                    
                    return;
                });

                let points = [start, ...turnPoints, finish];               
                var result = this.calculateFlight(task, points);
                scorings.push(result);    
            });
        });

        return scorings.filter(x => x.finished).sort((a, b) => { return a.speed - b.speed }).pop();
    }


    private findAnyTurnPoint(points: ILoggerPoint[], task: ITask, start: ILoggerPoint, finish: ILoggerPoint, index: number): ILoggerPoint {        
        var turn = this.getBestInSector(this.mapService.map, task, index, points);
        return turn;
    }

    private getBestInSector(map: L.Map, task: ITask, index: number, points: ILoggerPoint[]): ILoggerPoint {
        //sector direction
        var prev = task.TaskPoints[index - 1];
        var tp = task.TaskPoints[index];
        var next = task.TaskPoints[index + 1];
        var prevTp = new Victor(tp.Latitude - prev.Latitude, tp.Longitude - prev.Longitude);
        var tpNext = new Victor(tp.Latitude - next.Latitude, tp.Longitude - next.Longitude);
        prevTp.normalize();
        tpNext.normalize();
        var vector = prevTp.add(tpNext);
        var direction = vector.angleDeg();
        //sector borders
        var LGeometryUtil: any = (<any>L).GeometryUtil;
        var t1 = L.latLng(task.TaskPoints[index].Latitude, task.TaskPoints[index].Longitude);
        var t2 = LGeometryUtil.destination(t1, direction, 100000);
        var leftPoint: L.LatLng = LGeometryUtil.rotatePoint(map, t2, -45, t1);
        var rightPoint: L.LatLng = LGeometryUtil.rotatePoint(map, t2, +45, t1);
        var sec = L.polygon([leftPoint, rightPoint, L.latLng(tp.Latitude, tp.Longitude), leftPoint]);
        var result = points.find((p) => {
            return turf.inside(
                turf.point([p.Latitude, p.Longitude]),
                turf.polygon([[
                    [leftPoint.lat, leftPoint.lng]
                    , [rightPoint.lat, rightPoint.lng]
                    , [tp.Latitude, tp.Longitude]
                    , [leftPoint.lat, leftPoint.lng]]])
            );
        });
        return result;
    }

    public calculateFlight(task: ITask, turnPoints: ILoggerPoint[]): IFlightScoring {
        var start = turnPoints[0];
        var finish = turnPoints[turnPoints.length - 1];
        if (finish.Time == null){
            throw "finish has no time!";
        }
        let totalDistance = TaskCalculator.getTotalDistance(task.TaskPoints)/*m*/ / 1000/*km*/;
        let time = (finish.Time.getTime() - start.Time.getTime())/*msec*/ / 1000/*sec*/ / 60/*min*/ / 60/*h*/;
        let speed = totalDistance / time;
        let finished = turnPoints.every(x => x != null);
        return { points: turnPoints, totalDistance, time, speed, finished };
    }
}

declare var Victor;