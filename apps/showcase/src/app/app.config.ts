import {
  ApplicationConfig,
  Injectable,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { COAR_OVERLAY_SPEC_RESOLVERS, type OverlaySpec } from '@cocoar/ui-overlay';
import { provideTransloco, type TranslocoLoader, type Translation } from '@jsverse/transloco';
import { provideCoarI18nUsingTransloco } from '@cocoar/i18n-transloco';

@Injectable({ providedIn: 'root' })
class ShowcaseTranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/i18n/${lang}.json`);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'de'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: false,
        missingHandler: {
          logMissingKey: true,
        },
      },
      loader: ShowcaseTranslocoHttpLoader,
    }),
    ...provideCoarI18nUsingTransloco(),
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
