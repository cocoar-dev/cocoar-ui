import { TestBed } from '@angular/core/testing';
import { CoarLocaleService, COAR_LOCALE_SERVICE, ICoarLocaleService } from './locale.service';

describe('CoarLocaleService', () => {
  let service: CoarLocaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoarLocaleService],
    });

    service = TestBed.inject(CoarLocaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNumberFormat', () => {
    it('should return US format by default', () => {
      const format = service.getNumberFormat();
      expect(format.decimal).toBe('.');
      expect(format.thousand).toBe(',');
    });

    it('should return format for specific locale', () => {
      // German uses comma for decimal, period for thousand
      const format = service.getNumberFormat('de-DE');
      expect(format.decimal).toBe(',');
      expect(format.thousand).toBe('.');
    });

    it('should return format for Austrian locale', () => {
      const format = service.getNumberFormat('de-AT');
      // Austrian uses same format as German
      expect(format.decimal).toBe(',');
    });

    it('should return format for French locale', () => {
      const format = service.getNumberFormat('fr-FR');
      expect(format.decimal).toBe(',');
      // French uses narrow no-break space for thousands
      expect(format.thousand).toBeTruthy();
    });

    it('should handle unknown locale gracefully', () => {
      // Should fall back to default
      const format = service.getNumberFormat('invalid-locale-xyz');
      expect(format.decimal).toBeTruthy();
      expect(format.thousand).toBeDefined();
    });
  });

  describe('setDefaultLocale', () => {
    it('should change the default locale', () => {
      service.setDefaultLocale('de-DE');

      const format = service.getNumberFormat();
      expect(format.decimal).toBe(',');
      expect(format.thousand).toBe('.');
    });

    it('should affect subsequent calls without explicit locale', () => {
      // Initially US format
      let format = service.getNumberFormat();
      expect(format.decimal).toBe('.');

      // Change default
      service.setDefaultLocale('de-AT');

      // Now should use Austrian format
      format = service.getNumberFormat();
      expect(format.decimal).toBe(',');
    });
  });

  describe('registerLocale', () => {
    it('should register a custom locale', () => {
      service.registerLocale('custom-finance', {
        number: {
          decimal: ',',
          thousand: ' ', // Space as thousand separator
        },
      });

      const format = service.getNumberFormat('custom-finance');
      expect(format.decimal).toBe(',');
      expect(format.thousand).toBe(' ');
    });

    it('should use registered locale over Intl defaults', () => {
      // Override US format
      service.registerLocale('en-US', {
        number: {
          decimal: '|',
          thousand: '~',
        },
      });

      const format = service.getNumberFormat('en-US');
      expect(format.decimal).toBe('|');
      expect(format.thousand).toBe('~');
    });

    it('should allow partial config and use defaults for missing values', () => {
      service.registerLocale('partial-locale', {
        // Only provide number config, date should be filled from defaults
      });

      const format = service.getNumberFormat('partial-locale');
      expect(format.decimal).toBeTruthy();
      expect(format.thousand).toBeDefined();
    });
  });
});

describe('COAR_LOCALE_SERVICE injection token', () => {
  it('should provide CoarLocaleService by default', () => {
    TestBed.configureTestingModule({});

    const service = TestBed.inject(COAR_LOCALE_SERVICE);
    expect(service).toBeTruthy();
    expect(service.getNumberFormat).toBeDefined();
  });

  it('should allow custom implementation', () => {
    const customService: ICoarLocaleService = {
      getNumberFormat: () => ({ decimal: '~', thousand: '#' }),
      setDefaultLocale: () => {},
      registerLocale: () => {},
    };

    TestBed.configureTestingModule({
      providers: [{ provide: COAR_LOCALE_SERVICE, useValue: customService }],
    });

    const service = TestBed.inject(COAR_LOCALE_SERVICE);
    const format = service.getNumberFormat();
    expect(format.decimal).toBe('~');
    expect(format.thousand).toBe('#');
  });
});
