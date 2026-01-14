import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { COAR_OVERLAY_SPEC_RESOLVERS, type OverlaySpec } from '@cocoar/ui-overlay';
import {
  provideCoarLocalization,
  provideCoarI18nHttpSource,
  provideCoarL10nHttpSource,
} from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    // Core localization system (language management + L10n + i18n)
    provideCoarLocalization({
      defaultLanguage: 'en',
    }),
    // Optional: L10n HTTP source for business overrides (Intl is auto-included)
    provideCoarL10nHttpSource(), // Defaults to /locales/{lang}.json
    // Optional: i18n HTTP source for translations
    provideCoarI18nHttpSource(), // Defaults to /i18n/{lang}.json
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
