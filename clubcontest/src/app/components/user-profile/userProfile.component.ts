import { UserService } from './../../services/user.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './userProfile.component.html',
  styleUrls: ['./userProfile.component.css']
})
export class UserProfileComponent  {

  constructor(private userService:UserService, private _location:Location){
    this.userDisplayName = userService.currentUser.Name;
  }
  public userDisplayName = "max mustermann";

  saveSettings(){
    console.log("userProfile.component:saveSettings")
    this.userService.saveSettings({
      DisplayName: this.userDisplayName
    }).subscribe(() => {
      this._location.back();
    });
  }
}
