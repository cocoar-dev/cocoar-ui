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

  describe('getCurrentLanguage', () => {
    it('should return the current language from CoarLocalizationService', () => {
      expect(context.getCurrentLanguage()).toBe('en');
    });

    it('should return updated language after change', async () => {
      await localeService.setLanguage('de');
      expect(context.getCurrentLanguage()).toBe('de');

      await localeService.setLanguage('fr');
      expect(context.getCurrentLanguage()).toBe('fr');
    });

    it('should support language codes with regions', async () => {
      await localeService.setLanguage('en-US');
      expect(context.getCurrentLanguage()).toBe('en-US');

      await localeService.setLanguage('de-AT');
      expect(context.getCurrentLanguage()).toBe('de-AT');
    });
  });

  describe('language$ observable', () => {
    it('should emit when language changes via CoarLocalizationService', async () => {
      const emittedValues: string[] = [];

      context.language$.subscribe((lang) => {
        emittedValues.push(lang);
      });

      await localeService.setLanguage('de');
      await localeService.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emittedValues).toEqual(['de', 'fr']);
    });

    it('should not emit when language does not change', async () => {
      const emittedValues: string[] = [];

      context.language$.subscribe((lang) => {
        emittedValues.push(lang);
      });

      await localeService.setLanguage('en'); // Same as current
      await localeService.setLanguage('de');
      await localeService.setLanguage('de'); // Same as current
      await localeService.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emittedValues).toEqual(['de', 'fr']);
    });

    it('should support multiple subscribers', async () => {
      const subscriber1Values: string[] = [];
      const subscriber2Values: string[] = [];

      context.language$.subscribe((lang) => {
        subscriber1Values.push(lang);
      });

      context.language$.subscribe((lang) => {
        subscriber2Values.push(lang);
      });

      await localeService.setLanguage('de');
      await localeService.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(subscriber1Values).toEqual(['de', 'fr']);
      expect(subscriber2Values).toEqual(['de', 'fr']);
    });

    it('should reflect same observable as CoarLocalizationService.languageChanged$', () => {
      expect(context.language$).toBe(localeService.languageChanged$);
    });
  });

  describe('integration with CoarLocalizationService', () => {
    it('should stay synchronized with CoarLocalizationService state', async () => {
      const contextValues: string[] = [];

      context.language$.subscribe((lang) => {
        contextValues.push(lang);
      });

      await localeService.setLanguage('de');
      expect(context.getCurrentLanguage()).toBe('de');

      await localeService.setLanguage('fr');
      expect(context.getCurrentLanguage()).toBe('fr');

      await localeService.setLanguage('en-US');
      expect(context.getCurrentLanguage()).toBe('en-US');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(contextValues).toEqual(['de', 'fr', 'en-US']);
    });

    it('should provide consistent state across multiple context instances', async () => {
      const context1 = TestBed.inject(CoarI18nContext);
      const context2 = TestBed.inject(CoarI18nContext);

      await localeService.setLanguage('de');

      expect(context1.getCurrentLanguage()).toBe('de');
      expect(context2.getCurrentLanguage()).toBe('de');
      expect(context.getCurrentLanguage()).toBe('de');
    });
  });
});
