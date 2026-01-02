import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { APP_ROUTES } from './app.routes';
import { SCENAR_BACKSTAGE_GLOBAL_PROVIDERS } from './scenar-backstage.global-providers';
import { ScenarErrorHandler } from './scenar-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: ScenarErrorHandler },
    ...SCENAR_BACKSTAGE_GLOBAL_PROVIDERS,
  ],
};
