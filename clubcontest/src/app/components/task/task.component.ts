import { MapService } from './../../services/map.service';
import { UserService } from './../../services/user.service';
import { TaskScoringService } from './../../services/taskScoring.service';
import { GeoUtilService } from './../../services/geoUtil.service';
import { ApiService } from './../../services/api.service';
import { ITask, ITaskPoint } from './../../models/task';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {

  private title = "";
  private _task: ITask;
  private isEditorEnabled = false;
  private taskBackup: ITask = null;

  constructor(private apiService: ApiService
    , private taskScoring: TaskScoringService
    , private userService: UserService
    , private mapService: MapService
  ) { }


  @Input()
  public get task() { return this._task; }
  public set task(value: ITask) {
    if (value != this._task)
    {
      this._task = value;
      this.isEditorEnabled = false;
      this.taskBackup = null;
      this.title = this.getTaskTitle(this._task);
    }
  };

  @Input() dayId: number;
  @Output() taskCreated = new EventEmitter<ITask>()
  @Input() collapsed = false;

  ngOnInit() {
    this.mapService.getTaskEditEvents().subscribe(() => {
      this.title = this.getTaskTitle(this.task);
    })
  }

  private getTaskTitle(task: ITask): string {
    var distance = this.taskScoring.getTaskDistance(task);

    if (distance == 0) {
      return "";
    }

    var minTime = task.AatMinTime / 60 / 60;
    var title = `${distance}km`;
    if (task.Type == 'AAT'){
      title += ` AAT (${minTime}h)`;
    }
    else{
      title += " (Racing Task)";
    }
    return title;
  }

  private enableEditMode() {
    this.isEditorEnabled = true;
    this.taskBackup = this.createTaskBackup(this.task);
    this.mapService.showTask(this.task, true);    
  }

  private uploadTask(files: FileList) {
    var url = this.apiService.apiBaseUrl + "/Day/UploadTask?dayId=" + this.dayId
    this.apiService.uploadFile(files, url).subscribe((response) => {
      var task = response.json();
      this._task = task;
      this.taskCreated.next(task);
      this.mapService.showTask(task);
    }, (error) => { 
      if (error.status == 401) {
        window.location.href = "./Account/Login"
      }
      else {
        alert("whoooops, da ist etwas schief gelaufen!");
      }
    })
  }

  createTask(){
    let center = this.mapService.getCenter();
    this.apiService.createNewTask(this.dayId, center.lat, center.lng).subscribe((task) => { 
      this.task = task;
      this.taskCreated.next(task);
      this.enableEditMode();
    });
  }


  private taskTypeChanged() {
    var lastIndex = this.task.TaskPoints.length - 1;
    this.task.TaskPoints.forEach((p, index) => {      
      if (index > 0 && index < lastIndex)
        p.ObservationZone.Type = this.task.Type == "RT" ? "Keyhole" : "Cylinder";
        if (p.ObservationZone.Radius < 7000){
          p.ObservationZone.Radius = 7000;
        }
    });

    this.mapService.showTask(this.task, true);
    this.taskPropertyChanged();
  }

  private taskPropertyChanged() {
    this.title = this.getTaskTitle(this.task);
    
  }


  private cancel() {
    this.isEditorEnabled = false;
    this.task = this.taskBackup;
    this.mapService.showTask(this.task);
  }

  private save() {
    this.apiService.updateTask(this.dayId, this.task).subscribe((response) => {
      this.isEditorEnabled = false;
      this.mapService.showTask(this.task);
    }, (error) => { alert("task update error!"); console.log(error); });
  }

  private createTaskBackup(task: ITask): ITask {
    var backup: ITask = {
      TaskPoints: [...task.TaskPoints.map(x => this.createTaskPointBackup(x))],
      AatMinTime: task.AatMinTime,
      Type: task.Type
    }
    return backup
  }

  private createTaskPointBackup(taskpoint: ITaskPoint): ITaskPoint {
    var backup: ITaskPoint = {
      Index: taskpoint.Index,
      Latitude: taskpoint.Latitude,
      Longitude: taskpoint.Longitude,
      Name: taskpoint.Name,
      ObservationZone: {
        Length: taskpoint.ObservationZone.Length,
        Radius: taskpoint.ObservationZone.Radius,
        Type: taskpoint.ObservationZone.Type,
      },
      Type: taskpoint.Type
    }
    return backup;
  }


  onTaskPointChanged(){
    //this.mapService.clearTask();
    this.mapService.showTask(this.task, true);
  }
}
