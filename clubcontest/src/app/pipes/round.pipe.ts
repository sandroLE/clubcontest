import { IFlight } from './../models/flight';
import { Pipe, PipeTransform } from '@angular/core';



@Pipe({
  name: 'rnd',
})
export class RoundPipe  implements PipeTransform {
  
  transform(n:number): number {
      return Math.round(n * 100) / 100
  }
}