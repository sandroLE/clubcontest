export interface IUser{
    Id:number;
    Name: string;
    isLoggedIn:boolean;
    isAdmin:boolean;
}

export interface IUserSettings{
    DisplayName:string;
}