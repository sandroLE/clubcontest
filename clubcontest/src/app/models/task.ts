
export interface ITask{
    TaskPoints: ITaskPoint[];
    Type:"AAT" | "RT";
    AatMinTime?: number; 
}

export interface ITaskPoint{
    Index:number;
    Latitude:number;
    Longitude:number;
    Name:string;
    ObservationZone: IObservationZone;
    Type: "Start" | "Area" | "Finish" | "Turn"
}

export interface IObservationZone{
    Length:number;
    Radius:number;
    Type:"Line" | "Cylinder" | "Keyhole";
}