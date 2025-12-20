import { describe, expect, it } from 'vitest';

import { createCoarLocaleServiceStub } from './locale-testing';

describe('createCoarLocaleServiceStub', () => {
  it('returns defaults when no overrides provided', () => {
    const service = createCoarLocaleServiceStub();

    expect(service.getDefaultLocale()).toBe('en-US');
    expect(service.getNumberFormat()).toEqual({ decimal: '.', thousand: ',' });
    expect(service.getDateFormat()).toEqual({ pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 });
  });

  it('supports custom locales via registerLocale', () => {
    const service = createCoarLocaleServiceStub({ defaultLocale: 'en-US' });

    service.registerLocale('custom', {
      number: { decimal: ',', thousand: '.' },
    });

    expect(service.getNumberFormat('custom')).toEqual({ decimal: ',', thousand: '.' });
    expect(service.getNumberFormat('en-US')).toEqual({ decimal: '.', thousand: ',' });
  });
});
