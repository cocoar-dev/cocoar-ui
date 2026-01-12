import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { CoarI18n } from './coar-i18n';
import { COAR_I18N_PROVIDER, CoarI18nProvider } from './coar-i18n-provider';

describe('CoarI18n', () => {
  let service: CoarI18n;
  let mockProvider: CoarI18nProvider;

  beforeEach(() => {
    mockProvider = {
      t: vi.fn((key: string) => key), // returns key unchanged by default
    };

    const injector = Injector.create({
      providers: [{ provide: COAR_I18N_PROVIDER, useValue: mockProvider }],
    });

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
  });

  describe('tWithDefault() method', () => {
    it('should return translation when available (not equal to key)', () => {
      mockProvider.t = vi.fn(() => 'Translated Text');
      const result = service.tWithDefault('coar.button.save', 'Save');
      expect(result).toBe('Translated Text');
    });

    it('should use fallback when translation equals key', () => {
      mockProvider.t = vi.fn((key) => key); // returns key = missing
      const result = service.tWithDefault('coar.button.save', 'Save');
      expect(result).toBe('Save');
    });

    it('should use fallback when translation is null', () => {
      mockProvider.t = vi.fn(() => null as unknown as string);
      const result = service.tWithDefault('coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should use fallback when translation is undefined', () => {
      mockProvider.t = vi.fn(() => undefined as unknown as string);
      const result = service.tWithDefault('coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should use fallback when translation is empty string', () => {
      mockProvider.t = vi.fn(() => '');
      const result = service.tWithDefault('coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should interpolate fallback with params', () => {
      mockProvider.t = vi.fn((key) => key); // returns key = missing
      const result = service.tWithDefault('coar.greeting', 'Hello {name}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should pass params to provider when translation found', () => {
      mockProvider.t = vi.fn(() => 'Welcome, Alice');
      const result = service.tWithDefault('coar.greeting', 'Hello {name}', { name: 'Alice' });
      expect(result).toBe('Welcome, Alice');
      expect(mockProvider.t).toHaveBeenCalledWith('coar.greeting', { name: 'Alice' });
    });
  });
});
