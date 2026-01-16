import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { of, map } from 'rxjs';
import { CoarI18nService } from './coar-i18n.service';
import { CoarTranslationStore } from './coar-translation-store';
import { COAR_TRANSLATION_LOADERS, CoarTranslationLoader } from './coar-translation-loader';
import { CoarIntlTranslationLoader } from './coar-intl-translation-loader';
import { CoarLocalizationService } from '../coar-localization.service';
import { CoarLocalizationDataStore } from '../l10n/localization-data-store';

describe('CoarI18nService (multi-loader)', () => {
  describe('with Intl loader only', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          CoarLocalizationService,
          CoarLocalizationDataStore,
          CoarTranslationStore,
          CoarI18nService,
          {
            provide: COAR_TRANSLATION_LOADERS,
            multi: true,
            useClass: CoarIntlTranslationLoader,
          },
        ],
      });
    });

    it('should load Intl translations automatically', async () => {
      const localeService = TestBed.inject(CoarLocalizationService);
      const i18nService = TestBed.inject(CoarI18nService);

      await localeService.setLanguage('en');

      // Wait for async loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      const today = i18nService.t('common.today');
      expect(today).toBe('today');
    });
  });

  describe('with multiple loaders (Intl + custom)', () => {
    class MockHttpLoader extends CoarTranslationLoader {
      override loadTranslations() {
        // HTTP loader overrides "common.today"
        return of({
          'common.today': 'Now', // Override
          'app.title': 'My App', // Additional key
        });
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          CoarLocalizationService,
          CoarLocalizationDataStore,
          CoarTranslationStore,
          CoarI18nService,
          {
            provide: COAR_TRANSLATION_LOADERS,
            multi: true,
            useClass: CoarIntlTranslationLoader,
          },
          {
            provide: COAR_TRANSLATION_LOADERS,
            multi: true,
            useClass: MockHttpLoader,
          },
        ],
      });
    });

    it('should merge translations from all loaders', async () => {
      const localeService = TestBed.inject(CoarLocalizationService);
      const i18nService = TestBed.inject(CoarI18nService);

      await localeService.setLanguage('en');

      // Wait for async loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Intl default (not overridden)
      const yesterday = i18nService.t('common.yesterday');
      expect(yesterday).toBe('yesterday');

      // HTTP override
      const today = i18nService.t('common.today');
      expect(today).toBe('Now');

      // HTTP-only key
      const title = i18nService.t('app.title');
      expect(title).toBe('My App');
    });

    it('should allow HTTP to override Intl defaults', async () => {
      const localeService = TestBed.inject(CoarLocalizationService);
      TestBed.inject(CoarI18nService); // Trigger constructor + auto-loading
      const store = TestBed.inject(CoarTranslationStore);

      await localeService.setLanguage('en');
      await new Promise((resolve) => setTimeout(resolve, 100));

      const translations = store.getTranslations('en');
      expect(translations).toBeDefined();

      // HTTP loader should override Intl loader
      expect(translations?.get('common.today')).toBe('Now');

      // Intl loader keys should still be present
      expect(translations?.get('common.yesterday')).toBe('yesterday');
      expect(translations?.get('common.month.1')).toBe('January');
    });
  });

  describe('loader error handling', () => {
    class FailingLoader extends CoarTranslationLoader {
      override loadTranslations() {
        return of(null).pipe(
          map(() => {
            throw new Error('Network error');
          })
        );
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          CoarLocalizationService,
          CoarLocalizationDataStore,
          CoarTranslationStore,
          CoarI18nService,
          {
            provide: COAR_TRANSLATION_LOADERS,
            multi: true,
            useClass: CoarIntlTranslationLoader,
          },
          {
            provide: COAR_TRANSLATION_LOADERS,
            multi: true,
            useClass: FailingLoader,
          },
        ],
      });
    });

    it('should continue loading if one loader fails', async () => {
      const localeService = TestBed.inject(CoarLocalizationService);
      const i18nService = TestBed.inject(CoarI18nService);

      await localeService.setLanguage('en');
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Intl loader should still work
      const today = i18nService.t('common.today');
      expect(today).toBe('today');
    });
  });
});
