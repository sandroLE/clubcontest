
import { IFlight } from './../models/flight';
import { Pipe, PipeTransform } from '@angular/core';



@Pipe({
  name: 'orderbyScore',
})
export class OrderByPipe  implements PipeTransform {
  
  transform(flights: IFlight[]): IFlight[] {
    return FlightSorter.sort(flights);
  }
} 

export class FlightSorter{
  static sort(flights: IFlight[]): IFlight[] {
    return flights.sort( (a,b) => {
        var result = ((b.Score) || 0) - ((a.Score) || 0);
        if (result != 0){
          return result;
        }
        return b.Id - a.Id;
    })
}
}