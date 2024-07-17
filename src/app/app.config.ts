import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment.development';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom([
        HttpClientModule,
    ]),
    provideServiceWorker('ngsw-worker.js', {
        enabled: environment.ServiceWorker.enable,
        registrationStrategy: 'registerWhenStable:30000'
    })
],
};
