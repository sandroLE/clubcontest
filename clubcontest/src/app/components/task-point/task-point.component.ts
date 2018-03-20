import { ITaskPoint } from './../../models/task';
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Color } from '../../Color';

@Component({
  selector: 'task-point',
  templateUrl: './task-point.component.html',
  styleUrls: ['./task-point.component.css'],
 // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskPointComponent implements OnInit {

  @Input() 
  public point: ITaskPoint = null;

  @Input()
  public index:number;

  constructor() { }

  color = "#F00";

  ngOnInit() {
  }

  ngOnChanges(){
    
    this.color = Color.get(this.index);

    if (this.point.Type == "Start"){
      this.color = Color.Start;
    }
    
    if (this.point.Type == "Finish"){
      this.color = Color.Finish;
    }

  }

}
