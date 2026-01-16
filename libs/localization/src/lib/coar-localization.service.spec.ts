import { TestBed } from '@angular/core/testing';
import { CoarLocalizationService } from './coar-localization.service';
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

  describe('languageState.value', () => {
    it('should return default language "en"', () => {
      expect(service.languageState.value).toBe('en');
    });

    it('should return the language that was set', async () => {
      await service.setLanguage('de');
      expect(service.languageState.value).toBe('de');
    });
  });

  describe('setLanguage', () => {
    it('should update the current language', async () => {
      await service.setLanguage('de');
      expect(service.languageState.value).toBe('de');

      await service.setLanguage('fr');
      expect(service.languageState.value).toBe('fr');
    });

    it('should not update if language is the same', async () => {
      await service.setLanguage('en');
      expect(service.languageState.value).toBe('en');
    });

    it('should accept language codes with region', async () => {
      await service.setLanguage('en-US');
      expect(service.languageState.value).toBe('en-US');

      await service.setLanguage('de-AT');
      expect(service.languageState.value).toBe('de-AT');
    });
  });

  describe('languageState.value$ observable', () => {
    it('should emit when language changes', async () => {
      const emittedValues: string[] = [];

      service.languageState.value$.subscribe((lang) => {
        emittedValues.push(lang);
      });

      await service.setLanguage('de');
      await service.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emittedValues).toEqual(['en', 'de', 'fr']);
    });

    it('should not emit if language does not change', async () => {
      const emittedValues: string[] = [];

      service.languageState.value$.subscribe((lang) => {
        emittedValues.push(lang);
      });

      await service.setLanguage('en'); // Same as current
      await service.setLanguage('de');
      await service.setLanguage('de'); // Same as current
      await service.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emittedValues).toEqual(['en', 'de', 'fr']);
    });

    it('should support multiple subscribers', async () => {
      const subscriber1Values: string[] = [];
      const subscriber2Values: string[] = [];

      service.languageState.value$.subscribe((lang) => {
        subscriber1Values.push(lang);
      });

      service.languageState.value$.subscribe((lang) => {
        subscriber2Values.push(lang);
      });

      await service.setLanguage('de');
      await service.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(subscriber1Values).toEqual(['en', 'de', 'fr']);
      expect(subscriber2Values).toEqual(['en', 'de', 'fr']);
    });
  });
});
