import '@angular/compiler';

import {
  APP_INITIALIZER,
  createEnvironmentInjector,
  ErrorHandler,
  type EnvironmentInjector,
} from '@angular/core';
import { Subject, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';

import { COAR_I18N_EVENTS, CoarI18n, type CoarI18nEvents } from '@cocoar/i18n';

import { provideCoarI18nUsingTransloco } from './provide-coar-i18n-using-transloco';

describe('provideCoarI18nUsingTransloco()', () => {
  it('registers an APP_INITIALIZER that preloads the active language', async () => {
    const langChanges$ = new Subject<string>();
    const events$ = new Subject<unknown>();

    const transloco = {
      getActiveLang: vi.fn(() => 'de'),
      load: vi.fn(() => of({})),
      translate: vi.fn((key: string) => key),
      langChanges$: langChanges$.asObservable(),
      events$: events$.asObservable(),
    } as unknown as TranslocoService;

    const injector = createEnvironmentInjector(
      [
        { provide: TranslocoService, useValue: transloco },
        { provide: ErrorHandler, useValue: { handleError: vi.fn() } },
        ...provideCoarI18nUsingTransloco(),
      ],
      null as unknown as EnvironmentInjector
    );

    const initializers = injector.get(APP_INITIALIZER) as Array<() => unknown>;
    expect(initializers.length).toBeGreaterThan(0);

    await Promise.all(initializers.map((fn) => fn()));
    expect(transloco.load).toHaveBeenCalledWith('de');
  });

  it('triggers Transloco.load() for the active language (once per lang)', () => {
    const langChanges$ = new Subject<string>();
    const events$ = new Subject<unknown>();

    const getActiveLang = vi.fn(() => 'de');

    const transloco = {
      getActiveLang,
      load: vi.fn(() => of({})),
      translate: vi.fn((key: string) => key),
      langChanges$: langChanges$.asObservable(),
      events$: events$.asObservable(),
    } as unknown as TranslocoService;

    const injector = createEnvironmentInjector(
      [
        { provide: TranslocoService, useValue: transloco },
        { provide: ErrorHandler, useValue: { handleError: vi.fn() } },
        ...provideCoarI18nUsingTransloco(),
      ],
      null as unknown as EnvironmentInjector
    );

    const i18n = injector.get(CoarI18n);

    i18n.t('app.title');
    expect(transloco.load).toHaveBeenCalledTimes(1);
    expect(transloco.load).toHaveBeenCalledWith('de');

    i18n.t('app.subtitle');
    expect(transloco.load).toHaveBeenCalledTimes(1);

    getActiveLang.mockReturnValue('en');
    i18n.t('app.title');
    expect(transloco.load).toHaveBeenCalledTimes(2);
    expect(transloco.load).toHaveBeenCalledWith('en');
  });

  it('emits COAR_I18N_EVENTS on translation load events', () => {
    const langChanges$ = new Subject<string>();
    const events$ = new Subject<{ type: string; [key: string]: unknown }>();

    const transloco = {
      getActiveLang: vi.fn(() => 'de'),
      load: vi.fn(() => of({})),
      translate: vi.fn((key: string) => key),
      langChanges$: langChanges$.asObservable(),
      events$: events$.asObservable(),
    } as unknown as TranslocoService;

    const injector = createEnvironmentInjector(
      [
        { provide: TranslocoService, useValue: transloco },
        { provide: ErrorHandler, useValue: { handleError: vi.fn() } },
        ...provideCoarI18nUsingTransloco(),
      ],
      null as unknown as EnvironmentInjector
    );

    const i18nEvents = injector.get(COAR_I18N_EVENTS) as CoarI18nEvents;

    const seen: unknown[] = [];
    const sub = i18nEvents.languageChanged$.subscribe((v) => seen.push(v));

    // Transloco emits an event after async translation loading completes.
    events$.next({
      type: 'translationLoadSuccess',
      wasFailure: false,
      payload: { scope: null, langName: 'de' },
    });

    // Transloco also emits an event on language change.
    langChanges$.next('en');

    expect(seen.length).toBe(2);

    sub.unsubscribe();
  });
});
