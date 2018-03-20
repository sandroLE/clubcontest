import {MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatMenuModule, MatSelectModule, MatProgressBarModule, MatInputModule, MatAutocompleteModule, MatCheckboxModule, MatRadioModule, MatSidenavModule} from '@angular/material';
import { UserProfileComponent } from './components/user-profile/userProfile.component';
import { CoordinatePipe } from './pipes/coordinate.pipe';
import { CompetitionSettingsComponent } from './components/competition-settings/competition-settings.component';

import { UserService } from './services/user.service';
import { TimespanStringPipe } from './pipes/timespanString.pipe';
import { RoundPipe } from './pipes/round.pipe';
import { OrderByPipe } from './pipes/orderby.pipe';
import { FlightService } from './services/flight.service';
import { TaskScoringService } from './services/taskScoring.service';
import { MapService } from './services/map.service';
import { GeoUtilService } from './services/geoUtil.service';
import { ApiService } from './services/api.service';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { CreateCompetitionComponent } from './create-competition/create-competition.component';
import { CompetitionComponent } from './components/competition/competition.component';
import { CompetitionDayComponent } from './components/competition-day/competition-day.component';
import { FlightComponent } from './components/flight/flight/flight.component';
import { TaskComponent } from './components/task/task.component';
import { TotalResultComponent } from './components/total-result/total-result/total-result.component';
import { TaskPointComponent } from './components/task-point/task-point.component';

const appRoutes: Routes = [
  { path: '', component: CreateCompetitionComponent },    
  { path: 'Competition/New', component: CreateCompetitionComponent },  
  { path: 'Competition/:name', component: CompetitionComponent },
  { path: 'Competition/:name/:dayId', component: CompetitionComponent },
  { path: 'Account/Settings', component: UserProfileComponent }  
]

@NgModule({
  declarations: [
    AppComponent,
    CreateCompetitionComponent,
    CompetitionComponent,
    CompetitionDayComponent,
    FlightComponent,
    TaskComponent,
    OrderByPipe, RoundPipe, TimespanStringPipe,CoordinatePipe
    , TotalResultComponent,
    CompetitionSettingsComponent,
    TaskPointComponent, UserProfileComponent
    
    
  ],
  imports: [   
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    FormsModule,ReactiveFormsModule,
    HttpModule,  
    BrowserAnimationsModule,
    MatMenuModule,MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSelectModule, MatProgressBarModule, MatInputModule, MatAutocompleteModule, MatCheckboxModule, MatRadioModule
    ,MatSidenavModule
  ],
  exports:[],
  providers: [MapService, GeoUtilService, TaskScoringService, FlightService, ApiService, UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
