import { ITask } from './../models/task';
import { ICompetition } from './../models/competition';

import 'rxjs/Rx'
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ApiService {

  constructor(private http: Http) {
    this.apiBaseUrl = (<any>window).apiBaseUrl || ".";
  }



  public uploadFile(files: FileList, url: string): Observable<Response> {
    var data = new FormData();
    for (var i = 0; i < files.length; i++) {
      data.append(files[i].name, files[i]);
    }
    var headers = new Headers();
    //headers.append("Content-Type", 'multipart/form-data');      
    return this.http.post(url, data,  { headers: headers });
  }

  public createNewTask(dayId:number,  lat:number, lng:number): Observable<ITask> {
    var url = this.apiBaseUrl + "/Day/CreateTask";
    return this.http.post(url, {dayId, "lat": lat, "lng": lng }).map(x => x.json());
    
  }

  public updateTask(dayId:number, task:ITask){
    var url = this.apiBaseUrl + "/Day/UpdateTask";
    return this.http.post(url, {dayId:dayId, task: task});
  }

  public updateCompetition(competition: ICompetition): Observable<ICompetition> {
    var url = this.apiBaseUrl + "/Competition/UpdateAdminUsers";
    return this.http.post(url, competition).map(x => x.json());
  }

  public post(url: string, data:any): Observable<any> {
    var url = this.apiBaseUrl + url;    
    return this.http.post(url, data);
  }

  public get<T>(url: string): Observable<T> {
    url = this.apiBaseUrl + url;
    return this.http.get(url)
      .map(x => <T>x.json());
  }

  public Delete(url: string): Observable<Response> {
    var url = this.apiBaseUrl + url
    return this.http.delete(url);
  }

  public apiBaseUrl = ".";

}
