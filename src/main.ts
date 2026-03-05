import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
});
