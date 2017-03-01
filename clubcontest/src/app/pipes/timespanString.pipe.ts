import { IFlight } from './../models/flight';
import { Pipe, PipeTransform } from '@angular/core';



@Pipe({
  name: 'timespanString',
})
export class TimespanStringPipe  implements PipeTransform {
  
  transform(n:number): string {    
     var hours = Math.floor(n);
     var minutes = Math.floor((n % 1) * 60);
     return this.pad(hours, "00") + ":" + this.pad(minutes, "00");
  }

  private pad(n:number, pad = "0000"):string{
    var str = "" + n
    return pad.substring(0, pad.length - str.length) + str
  }
}