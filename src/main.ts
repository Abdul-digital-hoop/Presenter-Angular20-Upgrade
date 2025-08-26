import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

declare const Office: any;
declare const _initializeOfficeObjects: boolean;
declare const _IntegrationMediumOffice: boolean;

if (environment.production) {
  enableProdMode();
}

const isOfficeIntegration = localStorage.getItem("integration_medium") && 
                          (window as any)._IntegrationMediumOffice;

if (isOfficeIntegration) {
  var intervalId = setInterval(function () {
    if ((window as any)._initializeOfficeObjects) {
      initializeoffice();
      clearInterval(intervalId);
    }
  }, 2000);
} else {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
}

function initializeoffice() {
  Office.initialize = function () { 
    const platform = platformBrowserDynamic();
    platform.bootstrapModule(AppModule);
  };
}
