import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { COAR_OVERLAY_SPEC_RESOLVERS, type OverlaySpec } from '@cocoar/ui-overlay';
import { provideCoarIconBuiltInSourceAs } from '@cocoar/ui-components';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideCoarIconBuiltInSourceAs('coar'),
    {
      provide: COAR_OVERLAY_SPEC_RESOLVERS,
      multi: true,
      useValue: (spec: OverlaySpec<unknown>) => {
        // Showcase example: default menu overlays to close-on-scroll if not explicitly configured.
        if (spec.scroll) return spec;
        if (spec.a11y?.role !== 'menu') return spec;
        return { ...spec, scroll: { strategy: 'close' } };
      },
    },
  ],
};
