import { IUser } from './user';
import { ILoggerPoint } from './flight';
import 'leaflet';

export interface IFlight {
    Id: number;
    DayId: number;
    IgcFile: string;
    Points: ILoggerPoint[];
    UserId: number;
    User: IUser;

    TurnPoints?: string,
    turnPoints: ILoggerPoint[],
    Distance?: number;
    Duration?: number;
    Speed?: number;
    Finished?: boolean;  
    Score:number;
    GliderType:string;
    Handicap:number;
    PilotName:string;
    
    Layer: L.Layer;
    IsVisible: boolean;
    isExpanded:boolean;
    isLoading:boolean;
    isSelected:boolean;
    color:string;


}

export interface ILoggerPoint {
    Latitude: number,
    Longitude: number,
    Time?: Date;
}


export interface IFlightScoring {
    points: ILoggerPoint[],
    totalDistance: number;
    time: number;
    speed: number;
    finished: boolean;
}