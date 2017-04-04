import { CompetitionComponent } from './../components/competition/competition.component';
import { ICompetition } from './../models/competition';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { ApiService } from './../services/api.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-create-competition',
  templateUrl: './create-competition.component.html',
  styleUrls: ['./create-competition.component.css']
})
export class CreateCompetitionComponent implements OnInit {

  private alreadyExists = false;
  private isButtonDisabled = true;
  public _name = "";

  public get name() { return this._name; }
  public set name(value) {
    this._name = value;
    this.nameChanged(value);
  }

  private all = [];
  public filtered = [];
  constructor(private apiService: ApiService, private http: Http, private router: Router) { }

  ngOnInit() {
    this.getAll();
  }

  public getAll() {
    var url = this.apiService.apiBaseUrl  + "/Competition/GetAll";
    this.http.get(url).subscribe((x) => {
      this.all = x.json().sort((a, b) => b.Name - a.Name);
      this.filtered = this.all;
    });
  }

  public nameChanged(value: string) {
    /*  this.http.get("http://localhost:5000/Competition/NameExist?name=" + value).subscribe((x) => {
        this.alreadyExists = x.json().exist;
        this.isButtonDisabled = this.alreadyExists || !this.isValidName(value);
        
      });*/
    this.filtered = this.filterByName(this.all, value);
    this.isButtonDisabled = this.alreadyExists || !this.isValidName(value);

  }


  private isValidName(name: string): boolean {
    return name != null
      && name.length > 3
      && name.match(/^[0-9a-zA-Z]+$/) != null;


  }

  private create(): void {
    var headers = new Headers({
      'Content-Type': 'application/json',
    });

    let options = new RequestOptions({
      headers: headers
    });

    var url = this.apiService.apiBaseUrl + "/Competition/Create" ;
    this.http.post(url, { name: this.name }).subscribe((x: Response) => {
      this.router.navigate(["/Competition", this.name]);

    }, (error) => {
      if (error.status == 401) {
        window.location.href = "./Account/Login"
      }
      else {
          alert("whoooops, da ist etwas schief gelaufen. Bitte versuche es später noch einmal oder verwende einen anderen Namen!");
      }      
    });
  }

  filterByName(competitions: ICompetition[], name: string): ICompetition[] {

    if (!name || name == "") {
      return competitions;
    }

    var result = competitions.filter(x => { return x.Name.toLowerCase().indexOf(name.toLowerCase()) >= 0 });

    return result;
  }

  private open(name: string) {
    this.router.navigate(['/Competition', name]);
  }

}
