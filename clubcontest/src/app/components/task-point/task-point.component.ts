import { ITaskPoint } from './../../models/task';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'task-point',
  templateUrl: './task-point.component.html',
  styleUrls: ['./task-point.component.css']
})
export class TaskPointComponent implements OnInit {

  @Input() 
  private point: ITaskPoint = null;

  constructor() { }

  ngOnInit() {
  }

}
