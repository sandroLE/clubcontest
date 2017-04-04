import { RacingTaskCalculator } from './scoring/racingTaskCalculator';
import { TaskCalculator } from './scoring/taskCalculator';
import { AatCalculator } from './scoring/aatCalculator';
import { ILoggerPoint, IFlight, IFlightScoring } from './../models/flight';
import { GeoUtilService } from './geoUtil.service';
import { MapService } from './map.service';
import { ITask, ITaskPoint } from './../models/task';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';


//var gju = require('geojson-utils');

@Injectable()
export class TaskScoringService {

  private calculators: {[taskType:string]: TaskCalculator} = {};

  constructor(private mapService: MapService, private geoUtil: GeoUtilService) {
    this.calculators["RT"] =  new RacingTaskCalculator(this.mapService, this.geoUtil);
    this.calculators["AAT"] =  new AatCalculator(this.mapService, this.geoUtil);
  }


  public getFlightScoring(flight: IFlight, task: ITask): IFlightScoring {
    var scoring = this.calculators[task.Type].getFlightScoring(flight, task);   
    return scoring;
  }

  public calculateFlight(task:ITask, turnPoints: ILoggerPoint[]): IFlightScoring {
    return this.calculators[task.Type].calculateFlight(task, turnPoints);
  }


  public setFlightScrores(flights: IFlight[]) {
    var flights = [...flights];
    flights
      .sort((a, b) => ((b.Speed / b.Handicap) || 0) - ((a.Speed / a.Handicap) || 0))
      .reverse()
      .forEach((x, i) => {
        x.Score = x.Finished ? i + 1 : 1;
      });
  }


  public getTaskDistance(task: ITask): number {
    if (task == null) {
      return 0;
    }
    var d = Math.floor(TaskCalculator.getTotalDistance(task.TaskPoints) / 1000);
    return d;
  }


  public getNullScoring(): IFlightScoring {
    return {
      points: [],
      totalDistance: 0,
      time: 0,
      speed: 0,
      finished: false
    };
  }
}
