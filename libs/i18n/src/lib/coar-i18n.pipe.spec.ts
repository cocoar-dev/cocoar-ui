import { ChangeDetectorRef, Injector, runInInjectionContext } from '@angular/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { CoarI18n } from './coar-i18n';
import { COAR_I18N_EVENTS, CoarI18nEvents } from './coar-i18n-events';
import { CoarI18nPipe } from './coar-i18n.pipe';

function createPipe(options?: {
  t?: (key: string, params?: Record<string, unknown>) => string;
  events?: CoarI18nEvents;
  markForCheck?: () => void;
}): {
  pipe: CoarI18nPipe;
  i18n: CoarI18n;
  markForCheck: ReturnType<typeof vi.fn>;
} {
  const markForCheck = vi.fn(options?.markForCheck);

  const i18n = {
    t: vi.fn(options?.t ?? ((key: string) => key)),
  } as unknown as CoarI18n;

  const providers = [
    { provide: CoarI18n, useValue: i18n },
    { provide: ChangeDetectorRef, useValue: { markForCheck } },
  ];

  if (options?.events) {
    providers.push({ provide: COAR_I18N_EVENTS, useValue: options.events });
  }

  const injector = Injector.create({ providers });

  const pipe = runInInjectionContext(injector, () => new CoarI18nPipe());

  return { pipe, i18n, markForCheck };
}

describe('CoarI18nPipe', () => {
  it('returns fallback when key is null/undefined', () => {
    const { pipe } = createPipe();

    expect(pipe.transform(undefined, 'Fallback')).toBe('Fallback');
    expect(pipe.transform(null, 'Fallback')).toBe('Fallback');
  });

  it('returns empty string when key is missing and no fallback is provided', () => {
    const { pipe } = createPipe();

    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(null)).toBe('');
  });

  it('translates a key without params', () => {
    const { pipe, i18n } = createPipe({ t: () => 'Translated' });

    const result = pipe.transform('coar.button.save');

    expect(result).toBe('Translated');
    expect(i18n.t as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('coar.button.save');
  });

  it('translates a key with params', () => {
    const { pipe, i18n } = createPipe({ t: () => 'Count: 5' });

    const result = pipe.transform('coar.items.count', { count: 5 });

    expect(result).toBe('Count: 5');
    expect(i18n.t as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledWith('coar.items.count', {
      count: 5,
    });
  });

  it('uses fallback when translation is missing (translation equals key)', () => {
    const { pipe } = createPipe({ t: (key) => key });

    expect(pipe.transform('coar.button.save', 'Save')).toBe('Save');
  });

  it('returns key when translation is missing and no fallback is provided', () => {
    const { pipe } = createPipe({ t: (key) => key });

    expect(pipe.transform('coar.button.save')).toBe('coar.button.save');
  });

  it('subscribes to language changes when COAR_I18N_EVENTS is provided', () => {
    const languageChanged$ = new Subject<void>();
    const events: CoarI18nEvents = { languageChanged$ };

    const { pipe, markForCheck } = createPipe({ events });

    expect(markForCheck).not.toHaveBeenCalled();

    languageChanged$.next();
    expect(markForCheck).toHaveBeenCalledTimes(1);

    pipe.ngOnDestroy();

    languageChanged$.next();
    expect(markForCheck).toHaveBeenCalledTimes(1);
  });

  it('does not require COAR_I18N_EVENTS', () => {
    const { pipe } = createPipe();

    expect(() => pipe.transform('coar.button.save', 'Save')).not.toThrow();
    pipe.ngOnDestroy();
  });
});
