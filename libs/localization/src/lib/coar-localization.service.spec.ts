import { TestBed } from '@angular/core/testing';
import { CoarLocalizationService } from './coar-localization.service';
import { effect } from '@angular/core';
import { CoarLocalizationDataStore } from './l10n/localization-data-store';

describe('CoarLocalizationService', () => {
  let service: CoarLocalizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoarLocalizationDataStore],
    });
    service = TestBed.inject(CoarLocalizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentLanguage', () => {
    it('should return default language "en"', () => {
      expect(service.getCurrentLanguage()).toBe('en');
    });

    it('should return the language that was set', async () => {
      await service.setLanguage('de');
      expect(service.getCurrentLanguage()).toBe('de');
    });
  });

  describe('setLanguage', () => {
    it('should update the current language', async () => {
      await service.setLanguage('de');
      expect(service.getCurrentLanguage()).toBe('de');

      await service.setLanguage('fr');
      expect(service.getCurrentLanguage()).toBe('fr');
    });

    it('should not update if language is the same', async () => {
      await service.setLanguage('en');
      expect(service.getCurrentLanguage()).toBe('en');
    });

    it('should accept language codes with region', async () => {
      await service.setLanguage('en-US');
      expect(service.getCurrentLanguage()).toBe('en-US');

      await service.setLanguage('de-AT');
      expect(service.getCurrentLanguage()).toBe('de-AT');
    });
  });

  describe('language signal', () => {
    it('should return current language', () => {
      expect(service.language()).toBe('en');
    });

    it('should update when language changes', async () => {
      await service.setLanguage('de');
      expect(service.language()).toBe('de');

      await service.setLanguage('fr');
      expect(service.language()).toBe('fr');
    });

    it('should be readable in effects', async () => {
      const values: string[] = [];

      TestBed.runInInjectionContext(() => {
        effect(() => {
          values.push(service.language());
        });
      });

      // Give effect time to run initially
      await new Promise((resolve) => setTimeout(resolve, 0));

      await service.setLanguage('de');
      await new Promise((resolve) => setTimeout(resolve, 0));

      await service.setLanguage('fr');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(values).toEqual(['en', 'de', 'fr']);
    });

    it('should not emit if language does not change', async () => {
      const values: string[] = [];

      TestBed.runInInjectionContext(() => {
        effect(() => {
          values.push(service.language());
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      await service.setLanguage('en'); // Same as current
      await new Promise((resolve) => setTimeout(resolve, 0));

      await service.setLanguage('de');
      await new Promise((resolve) => setTimeout(resolve, 0));

      await service.setLanguage('de'); // Same as current
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(values).toEqual(['en', 'de']);
    });
  });

  describe('languageChanged$ observable', () => {
    it('should emit when language changes', async () => {
      const emittedValues: string[] = [];

      service.languageChanged$.subscribe((lang) => {
        emittedValues.push(lang);
      });

      await service.setLanguage('de');
      await service.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emittedValues).toEqual(['de', 'fr']);
    });

    it('should not emit if language does not change', async () => {
      const emittedValues: string[] = [];

      service.languageChanged$.subscribe((lang) => {
        emittedValues.push(lang);
      });

      await service.setLanguage('en'); // Same as current
      await service.setLanguage('de');
      await service.setLanguage('de'); // Same as current
      await service.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emittedValues).toEqual(['de', 'fr']);
    });

    it('should support multiple subscribers', async () => {
      const subscriber1Values: string[] = [];
      const subscriber2Values: string[] = [];

      service.languageChanged$.subscribe((lang) => {
        subscriber1Values.push(lang);
      });

      service.languageChanged$.subscribe((lang) => {
        subscriber2Values.push(lang);
      });

      await service.setLanguage('de');
      await service.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(subscriber1Values).toEqual(['de', 'fr']);
      expect(subscriber2Values).toEqual(['de', 'fr']);
    });
  });

  describe('integration: signal and observable consistency', () => {
    it('should keep signal and observable in sync', async () => {
      const observableValues: string[] = [];
      const signalValues: string[] = [];

      service.languageChanged$.subscribe((lang) => {
        observableValues.push(lang);
      });

      TestBed.runInInjectionContext(() => {
        effect(() => {
          signalValues.push(service.language());
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      await service.setLanguage('de');
      await new Promise((resolve) => setTimeout(resolve, 0));

      await service.setLanguage('fr');
      await new Promise((resolve) => setTimeout(resolve, 0));

      await service.setLanguage('en-US');
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Signal includes initial value
      expect(signalValues).toEqual(['en', 'de', 'fr', 'en-US']);
      // Observable only emits on changes
      expect(observableValues).toEqual(['de', 'fr', 'en-US']);
    });
  });
});
