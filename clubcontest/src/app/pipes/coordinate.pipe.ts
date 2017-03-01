import { IFlight } from './../models/flight';
import { Pipe, PipeTransform } from '@angular/core';



@Pipe({
  name: 'coord',
})
export class CoordinatePipe  implements PipeTransform {
  
  transform(n:number, preFix:string): string {
      var deg = Math.floor(n);      
      var min = (n % 1) * 60;
      var sec = (min % 1) * 60

      var minAbs = Math.floor(min);
      var secAbs = Math.floor(sec);

      return `${preFix}${deg}°${minAbs}'${secAbs}`;
  }
}