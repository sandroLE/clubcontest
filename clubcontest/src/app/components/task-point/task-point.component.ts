import { ITaskPoint } from './../../models/task';
import { Component, OnInit, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { Color } from '../../Color';

@Component({
  selector: 'task-point',
  templateUrl: './task-point.component.html',
  styleUrls: ['./task-point.component.scss'],
 // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskPointComponent implements OnInit {

  @Input()
  public disabled = true;

  @Input() 
  public point: ITaskPoint = null;

  @Input()
  public index:number;

  @Output() change = new EventEmitter<ITaskPoint>();

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


  somethingHasChanged(){
    console.log("something has changed");
    this.change.next(this.point);
  }


  set length(value:number){
    this.point.ObservationZone.Length = value;
    this.somethingHasChanged();
  }
  get length(){
    return this.point.ObservationZone.Length;
  }

  set radius(value:number){
    this.point.ObservationZone.Radius = value;
    this.somethingHasChanged();
  }
  get radius(){
    return this.point.ObservationZone.Radius;
  }
}
