import { TestBed } from '@angular/core/testing';
import { CoarI18nContext } from './coar-i18n-context';
import { CoarLocalizationService } from '../coar-localization.service';
import { CoarLocalizationDataStore } from '../l10n/localization-data-store';

describe('CoarI18nContext', () => {
  let context: CoarI18nContext;
  let localeService: CoarLocalizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoarLocalizationDataStore],
    });
    context = TestBed.inject(CoarI18nContext);
    localeService = TestBed.inject(CoarLocalizationService);
  });

  it('should be created', () => {
    expect(context).toBeTruthy();
  });

  describe('languageState', () => {
    it('should expose the current language from CoarLocalizationService', () => {
      expect(context.languageState.value).toBe('en');
    });

    it('should reflect updated language after change', async () => {
      await localeService.setLanguage('de');
      expect(context.languageState.value).toBe('de');

      await localeService.setLanguage('fr');
      expect(context.languageState.value).toBe('fr');
    });

    it('should support language codes with regions', async () => {
      await localeService.setLanguage('en-US');
      expect(context.languageState.value).toBe('en-US');

      await localeService.setLanguage('de-AT');
      expect(context.languageState.value).toBe('de-AT');
    });
  });

  describe('languageState.value$ observable', () => {
    it('should emit when language changes via CoarLocalizationService', async () => {
      const emittedValues: string[] = [];

      context.languageState.value$.subscribe((lang) => {
        emittedValues.push(lang);
      });

      await localeService.setLanguage('de');
      await localeService.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emittedValues).toEqual(['en', 'de', 'fr']);
    });

    it('should not emit when language does not change', async () => {
      const emittedValues: string[] = [];

      context.languageState.value$.subscribe((lang) => {
        emittedValues.push(lang);
      });

      await localeService.setLanguage('en'); // Same as current
      await localeService.setLanguage('de');
      await localeService.setLanguage('de'); // Same as current
      await localeService.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emittedValues).toEqual(['en', 'de', 'fr']);
    });

    it('should support multiple subscribers', async () => {
      const subscriber1Values: string[] = [];
      const subscriber2Values: string[] = [];

      context.languageState.value$.subscribe((lang) => {
        subscriber1Values.push(lang);
      });

      context.languageState.value$.subscribe((lang) => {
        subscriber2Values.push(lang);
      });

      await localeService.setLanguage('de');
      await localeService.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(subscriber1Values).toEqual(['en', 'de', 'fr']);
      expect(subscriber2Values).toEqual(['en', 'de', 'fr']);
    });

    it('should reflect same state as CoarLocalizationService.languageState', () => {
      expect(context.languageState).toBe(localeService.languageState);
    });
  });

  describe('integration with CoarLocalizationService', () => {
    it('should stay synchronized with CoarLocalizationService state', async () => {
      const contextValues: string[] = [];

      context.languageState.value$.subscribe((lang) => {
        contextValues.push(lang);
      });

      await localeService.setLanguage('de');
      expect(context.languageState.value).toBe('de');

      await localeService.setLanguage('fr');
      expect(context.languageState.value).toBe('fr');

      await localeService.setLanguage('en-US');
      expect(context.languageState.value).toBe('en-US');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(contextValues).toEqual(['en', 'de', 'fr', 'en-US']);
    });

    it('should provide consistent state across multiple context instances', async () => {
      const context1 = TestBed.inject(CoarI18nContext);
      const context2 = TestBed.inject(CoarI18nContext);

      await localeService.setLanguage('de');

      expect(context1.languageState.value).toBe('de');
      expect(context2.languageState.value).toBe('de');
      expect(context.languageState.value).toBe('de');
    });
  });
});
