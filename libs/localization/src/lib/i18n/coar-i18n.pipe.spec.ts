import { ChangeDetectorRef, Injector, runInInjectionContext } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { CoarI18n } from './coar-i18n';
import { CoarI18nPipe } from './coar-i18n.pipe';

function createPipe(options?: {
  t$?: (key: string, params?: Record<string, unknown>, fallback?: string) => Observable<string>;
  markForCheck?: () => void;
}): {
  pipe: CoarI18nPipe;
  i18n: CoarI18n;
  markForCheck: ReturnType<typeof vi.fn>;
} {
  const markForCheck = vi.fn(options?.markForCheck);

  const i18n = {
    t$: vi.fn(options?.t$ ?? ((key: string) => of(key))),
  } as unknown as CoarI18n;

  const providers = [
    { provide: CoarI18n, useValue: i18n },
    { provide: ChangeDetectorRef, useValue: { markForCheck } },
  ];

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
    const { pipe, i18n } = createPipe({ t$: () => of('Translated') });

    const result = pipe.transform('coar.button.save');

    expect(result).toBe('Translated');
    expect(i18n.t$ as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'coar.button.save',
      undefined,
      undefined
    );
  });

  it('translates a key with params', () => {
    const { pipe, i18n } = createPipe({ t$: () => of('Count: 5') });

    const result = pipe.transform('coar.items.count', { count: 5 });

    expect(result).toBe('Count: 5');
    expect(i18n.t$ as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'coar.items.count',
      { count: 5 },
      undefined
    );
  });

  it('passes fallback to CoarI18n.t$ when provided', () => {
    const { pipe, i18n } = createPipe({ t$: () => of('Save') });

    expect(pipe.transform('coar.button.save', 'Save')).toBe('Save');
    expect(i18n.t$ as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'coar.button.save',
      undefined,
      'Save'
    );
  });

  it('passes params + fallback to CoarI18n.t$ when both are provided', () => {
    const { pipe, i18n } = createPipe({ t$: () => of('You have 3 items') });

    expect(pipe.transform('coar.items.count', { count: 3 }, 'Fallback')).toBe('You have 3 items');
    expect(i18n.t$ as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
      'coar.items.count',
      { count: 3 },
      'Fallback'
    );
  });

  it('does not re-subscribe when inputs are unchanged', () => {
    const { pipe, i18n } = createPipe({ t$: () => of('Translated') });

    expect(pipe.transform('coar.button.save')).toBe('Translated');
    expect(pipe.transform('coar.button.save')).toBe('Translated');

    expect(i18n.t$ as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(1);
  });

  it('marks for check when a new translated value arrives', () => {
    const translated$ = new Subject<string>();
    const { pipe, markForCheck } = createPipe({ t$: () => translated$ });

    // Initial render wires up the subscription.
    pipe.transform('coar.button.save');

    expect(markForCheck).toHaveBeenCalledTimes(1); // initial BehaviorSubject emission

    translated$.next('Hello');
    expect(markForCheck).toHaveBeenCalledTimes(2);

    pipe.ngOnDestroy();
    translated$.next('Hallo');
    expect(markForCheck).toHaveBeenCalledTimes(2);
  });
});
