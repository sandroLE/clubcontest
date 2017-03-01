import { ITask } from './task';
import { IFlight } from './flight';
export interface IDay{
    Id:number;
    CompetitionId:number;
    Date:string;
    Flights: IFlight[];
    UserId:number;
    Task:string;
    TaskFileFormat:string;
    XcSoarTask:ITask;
}