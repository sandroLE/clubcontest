import { ITask } from './../models/task';
import { ICompetition } from './../models/competition';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';

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
    var headers = new Headers({
      'Content-Type': 'multipart/form-data',
    });

    let options = new RequestOptions({
      headers: headers
    })

    return this.http.post(url, data, headers);
  }

  public updateTask(dayId:number, task:ITask){
    var url = this.apiBaseUrl + "/Day/UpdateTask";
    return this.http.post(url, {dayId:dayId, task: task});
  }

  public updateCompetition(competition: ICompetition): Observable<ICompetition> {
    var url = this.apiBaseUrl + "/Competition/UpdateAdminUsers";
    return this.http.post(url, competition).map(x => x.json());
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
