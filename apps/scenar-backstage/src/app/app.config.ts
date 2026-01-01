import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';

import { SCENAR_BACKSTAGE_GLOBAL_PROVIDERS } from './scenar-backstage.global-providers';
import { ScenarErrorHandler } from './scenar-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: ScenarErrorHandler },
    ...SCENAR_BACKSTAGE_GLOBAL_PROVIDERS,
  ],
};
