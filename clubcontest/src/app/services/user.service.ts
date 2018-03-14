import { ApiService } from './api.service';
import { IUser, IUserSettings } from './../models/user';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class UserService {


  constructor(private api:ApiService) { 
    this.currentUser.Id = (<any>window).userId;
    this.currentUser.Name = (<any>window).userName;
    this.currentUser.isLoggedIn = this.currentUser.Id > 0;
  }

  public isAdmin(competitionId:number):Observable<boolean>{
    //return this.api.get<boolean>("/User/IsAdmin?competitionId=" + competitionId);
    return Observable.of(true);;
  }

  public saveSettings(userSettings:IUserSettings):Observable<any>{
    var obs = this.api.post("/User/SaveSettings", userSettings);
    obs.subscribe(() => {
      this.currentUser.Name = userSettings.DisplayName;      
    });
    return obs;
  }

  public currentUser:IUser = { 
    Id:1, 
    Name:"tester", 
    isLoggedIn: false, 
    isAdmin:true
  };

}
