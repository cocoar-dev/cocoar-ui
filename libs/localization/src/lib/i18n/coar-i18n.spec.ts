import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { CoarI18n } from './coar-i18n';
import { COAR_I18N_PROVIDER, CoarI18nProvider } from './coar-i18n-provider';
import { CoarLocalizationService } from '../coar-localization.service';
import { CoarLocalizationDataStore } from '../l10n/localization-data-store';

describe('CoarI18n', () => {
  let service: CoarI18n;
  let mockProvider: CoarI18nProvider;
  let localeService: CoarLocalizationService;

  beforeEach(() => {
    mockProvider = {
      t: vi.fn((key: string) => key), // returns key unchanged by default
    };

    const injector = Injector.create({
      providers: [
        { provide: COAR_I18N_PROVIDER, useValue: mockProvider },
        CoarLocalizationService,
        CoarLocalizationDataStore,
      ],
    });

    localeService = injector.get(CoarLocalizationService);
    service = runInInjectionContext(injector, () => new CoarI18n());
  });

  describe('t() method', () => {
    it('should delegate to provider', () => {
      mockProvider.t = vi.fn(() => 'Translated');
      const result = service.t('coar.button.save');
      expect(result).toBe('Translated');
      expect(mockProvider.t).toHaveBeenCalledWith('coar.button.save', undefined);
    });

    it('should pass params to provider', () => {
      mockProvider.t = vi.fn(() => 'Count: 5');
      const result = service.t('coar.items.count', { count: 5 });
      expect(result).toBe('Count: 5');
      expect(mockProvider.t).toHaveBeenCalledWith('coar.items.count', { count: 5 });
    });

    it('should call provider with params when using fallback + params overload', () => {
      mockProvider.t = vi.fn(() => 'Welcome, Alice');
      const result = service.t('coar.greeting', 'Hello {name}', { name: 'Alice' });
      expect(result).toBe('Welcome, Alice');
      expect(mockProvider.t).toHaveBeenCalledWith('coar.greeting', { name: 'Alice' });
    });
  });

  describe('fallback semantics', () => {
    it('should return translation when available (not equal to key)', () => {
      mockProvider.t = vi.fn(() => 'Translated Text');
      const result = service.t('coar.button.save', 'Save');
      expect(result).toBe('Translated Text');
    });

    it('should use fallback when translation equals key', () => {
      mockProvider.t = vi.fn((key) => key); // returns key = missing
      const result = service.t('coar.button.save', 'Save');
      expect(result).toBe('Save');
    });

    it('should use fallback when translation is null', () => {
      mockProvider.t = vi.fn(() => null as unknown as string);
      const result = service.t('coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should use fallback when translation is undefined', () => {
      mockProvider.t = vi.fn(() => undefined as unknown as string);
      const result = service.t('coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should use fallback when translation is empty string', () => {
      mockProvider.t = vi.fn(() => '');
      const result = service.t('coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should interpolate fallback with params', () => {
      mockProvider.t = vi.fn((key) => key); // returns key = missing
      const result = service.t('coar.greeting', 'Hello {name}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should pass params to provider when translation found', () => {
      mockProvider.t = vi.fn(() => 'Welcome, Alice');
      const result = service.t('coar.greeting', 'Hello {name}', { name: 'Alice' });
      expect(result).toBe('Welcome, Alice');
      expect(mockProvider.t).toHaveBeenCalledWith('coar.greeting', { name: 'Alice' });
    });
  });

  describe('t$() method', () => {
    it('emits values on language changes via CoarLocalizationService', async () => {
      let callCount = 0;
      mockProvider.t = vi.fn(() => (callCount++ === 0 ? 'English' : 'German'));

      const values: string[] = [];
      const sub = service.t$('coar.key').subscribe((v) => values.push(v));

      // Initial emission
      expect(values).toEqual(['English']);

      // Change language
      await localeService.setLanguage('de');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(values).toEqual(['English', 'German']);

      sub.unsubscribe();
    });

    it('does not emit duplicates', async () => {
      mockProvider.t = vi.fn(() => 'Same');

      const values: string[] = [];
      const sub = service.t$('coar.key').subscribe((v) => values.push(v));

      await localeService.setLanguage('de');
      await localeService.setLanguage('fr');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(values).toEqual(['Same']);

      sub.unsubscribe();
    });

    it('uses fallback when translation is missing', async () => {
      mockProvider.t = vi.fn((key) => key); // returns key = missing

      const result$ = service.t$('coar.missing', undefined, 'Fallback');
      const value = await firstValueFrom(result$.pipe(take(1)));

      expect(value).toBe('Fallback');
    });
  });

  describe('tSignal() method', () => {
    it('returns a Signal with the current translated value', () => {
      mockProvider.t = vi.fn(() => 'Translated');

      const injector = Injector.create({
        providers: [
          { provide: COAR_I18N_PROVIDER, useValue: mockProvider },
          CoarLocalizationService,
          CoarLocalizationDataStore,
        ],
      });

      const result = runInInjectionContext(injector, () => {
        const svc = new CoarI18n();
        const sig = svc.tSignal('coar.button.save', undefined, 'Save');
        return sig();
      });

      expect(result).toBe('Translated');
    });

    it('updates when language changes via CoarLocalizationService', async () => {
      let language: 'en' | 'de' = 'en';
      mockProvider.t = vi.fn(() => (language === 'en' ? 'English' : 'German'));

      const injector = Injector.create({
        providers: [
          { provide: COAR_I18N_PROVIDER, useValue: mockProvider },
          CoarLocalizationService,
          CoarLocalizationDataStore,
        ],
      });

      const sig = runInInjectionContext(injector, () => new CoarI18n().tSignal('coar.key'));
      const locale = injector.get(CoarLocalizationService);

      expect(sig()).toBe('English');

      language = 'de';
      await locale.setLanguage('de');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(sig()).toBe('German');
    });

    it('uses the fallback when translation is missing', () => {
      mockProvider.t = vi.fn((key: string) => key); // missing translation

      const injector = Injector.create({
        providers: [
          { provide: COAR_I18N_PROVIDER, useValue: mockProvider },
          CoarLocalizationService,
          CoarLocalizationDataStore,
        ],
      });

      const value = runInInjectionContext(injector, () => {
        const svc = new CoarI18n();
        return svc.tSignal('coar.missing', undefined, 'Fallback')();
      });

      expect(value).toBe('Fallback');
    });
  });
});
