
import { IFlight } from './../models/flight';
import { Pipe, PipeTransform } from '@angular/core';



@Pipe({
  name: 'orderbyScore',
})
export class OrderByPipe  implements PipeTransform {
  
  transform(flights: IFlight[]): IFlight[] {
      return flights.sort( (a,b) => {
          return ((b.Score) || 0) - ((a.Score) || 0);
      })
  }
}