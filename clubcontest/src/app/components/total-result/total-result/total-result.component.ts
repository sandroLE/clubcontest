import { IUser } from './../../../models/user';
import { TaskScoringService } from './../../../services/taskScoring.service';
import { IDay } from './../../../models/day';
import { ICompetition } from './../../../models/competition';
import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-total-result',
  templateUrl: './total-result.component.html',
  styleUrls: ['./total-result.component.css']
})
export class TotalResultComponent implements OnInit {

  @Input() competition: ICompetition;
  private totals;

  constructor(
    private scoring: TaskScoringService) {

  }


  ngOnInit() {
  }

  ngOnChanges() {

    var total: {[userId:number]: { user:IUser, total:number, days: { day:IDay, score:number }[]  }} = {};

    this.competition.Days.forEach(day => {
      var daily = this.getDailyResult(day);

      daily.forEach(d => {
        if (!total[d.user.Id]){
          total[d.user.Id] = { user:d.user, total:0, days:[] }
        }
        total[d.user.Id].total += d.scores;
        total[d.user.Id].days.push({ day:day, score:d.scores });
      })      

      
    });

    var totalResults = [];

    for (var i in total){
      var t = total[i];
      this.competition.Days.forEach(day => {
        if (t.days.filter(d => d.day.Id == day.Id).length == 0){
            t.days.push({ day:day, score:0})
        }
      });
      totalResults.push(t);
    }

    totalResults = totalResults.sort((a,b) => { return b.total - a.total });
    this.totals = totalResults;
    
    
  }


  private getDailyResult(d: IDay) : { scores:number, user:IUser  }[] {
    
    this.scoring.setFlightScrores(d.Flights);    
    return d.Flights.map(f => {  
      return { scores: f.Score, user:f.User }
    });    
  }
}
