import { MapService } from './../../services/map.service';
import { ApiService } from './../../services/api.service';
import { UserService } from './../../services/user.service';
import { ICompetition } from './../../models/competition';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Http, Headers } from '@angular/http';
import { Component, OnInit } from '@angular/core';
import { CompetitionService } from '../../services/competition.service';

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.css']
})
export class CompetitionComponent implements OnInit {

  public competition: ICompetition = null;
  public selectedDayId = 0;
  public showTotals = false;
  public showSettings = false;

  private userName = "";
  constructor(
    private http: Http
    , private router: Router
    , private route: ActivatedRoute
    , public userService: UserService
    , private apiServie: ApiService
    , private mapService: MapService
    , private competitionService: CompetitionService
    ) {

  }


  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      var competitionName = params['name'];
      this.competitionService.getCompetition(competitionName)
        .subscribe((x) => {
          this.competition = x;

          this.showTotals = false;
          this.showSettings = false;
          this.selectedDayId = -1;

          if (this.competition == null) {
            this.router.navigate(["/"]);
          }

          this.userService.isAdmin(this.competition.Id).subscribe(isAdmin => {
            this.userService.currentUser.isAdmin = isAdmin;
          }, (error) => { console.log("isadmin - error", error); });

          if (params['dayId'] == "total" || this.competition.Days.length == 0) {
            this.showTotals = true;
          }
          else if (params['dayId'] == "settings") {
            this.showSettings = true;
          }
          else {
            this.selectedDayId = +params['dayId'];
            if (!this.selectedDayId && this.competition.Days.length > 0) {
              var lastDayId = this.competition.Days.map(x => x.Id).sort((a, b) => a - b).reverse()[0];
              this.selectedDayId = lastDayId;
            }
          }
        });

    });

  }

  createNewDay() {
    var date = new Date();
    var headers = new Headers();
    headers.append("Content-Type", "application/json")

    var url = this.apiServie.apiBaseUrl + "/Day/New"
    this.http.post(url, { competitionId: this.competition.Id, date: date }, { headers: headers })
      .subscribe((x) => {
        var day = x.json();
        this.competition.Days = [...[day], ...this.competition.Days];

        this.router.navigate(["Competition/", this.competition.Name, day.Id]);
      });
  }

  public selectDay(id: number) {
    this.router.navigate(["Competition/", this.competition.Name, id]);
  }

  public showTotalResult() {
    this.router.navigate(["Competition/", this.competition.Name, "total"]);
  }

  public onDayDeleted() {
    this.router.navigate(["Competition/", this.competition.Name]);
  }

  public login() {
    window.location.href = "./Account/Login";
  }

  public logout() {
    window.location.href = "./Account/Logout";
  }
  public showProfile() {
    this.router.navigate(["Account/Settings"]);
  }

  public showCompetitionSettings() {
    this.router.navigate(["Competition/", this.competition.Name, "settings"]);
  }

  
 
}
