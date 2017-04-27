import { IDay } from './day';
export interface ICompetition{
    Id:number;
    Name:string;
    Creator:string;
    CreatorId:number;
    Days: IDay[];
    AdminUsers:string;
    Waypoints:string;

    
}