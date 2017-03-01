import { FlightService } from './services/flight.service';
import { ApiService } from './services/api.service';
import { Component } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[ApiService, FlightService]
})
export class AppComponent {
}
