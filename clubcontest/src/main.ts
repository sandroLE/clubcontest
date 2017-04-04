import './polyfills.ts';
import 'leaflet-geometryutil';
import 'leaflet-almostover';
import 'leaflet-semicircle';
import 'leaflet.editable';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);