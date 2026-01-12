import { describe, it, expect, vi } from 'vitest';
import { firstValueFrom, take, toArray } from 'rxjs';
import { coarT$ } from './coar-t-observable';
import { CoarI18n } from './coar-i18n';
import { CoarI18nEvents } from './coar-i18n-events';
import { Subject } from 'rxjs';

describe('coarT$', () => {
  describe('without language change events', () => {
    it('should emit once with current translation', async () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Translated'),
      } as unknown as CoarI18n;

      const result$ = coarT$(
        mockI18n,
        null,
        'coar.button.save',
        undefined,
        'Save'
      );
      const value = await firstValueFrom(result$);

      expect(value).toBe('Translated');
      expect(mockI18n.tWithDefault).toHaveBeenCalledWith(
        'coar.button.save',
        'Save',
        undefined
      );
    });

    it('should use fallback when translation missing', async () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Fallback'),
      } as unknown as CoarI18n;

      const result$ = coarT$(
        mockI18n,
        null,
        'coar.unknown',
        undefined,
        'Fallback'
      );
      const value = await firstValueFrom(result$);

      expect(value).toBe('Fallback');
    });

    it('should complete after one emission', async () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Value'),
      } as unknown as CoarI18n;

      const result$ = coarT$(mockI18n, null, 'coar.key', undefined, 'Default');
      const values = await firstValueFrom(result$.pipe(take(5), toArray()));

      expect(values).toEqual(['Value']);
    });
  });

  describe('with language change events', () => {
    it('should emit on initial subscription', async () => {
      const langChange$ = new Subject<void>();
      const mockEvents: CoarI18nEvents = { languageChanged$: langChange$ };
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Initial'),
      } as unknown as CoarI18n;

      const result$ = coarT$(
        mockI18n,
        mockEvents,
        'coar.key',
        undefined,
        'Default'
      );
      const promise = firstValueFrom(result$);
      const value = await promise;

      expect(value).toBe('Initial');
    });

    it('should emit when language changes', async () => {
      const langChange$ = new Subject<void>();
      const mockEvents: CoarI18nEvents = { languageChanged$: langChange$ };
      let callCount = 0;
      const mockI18n = {
        tWithDefault: vi.fn(() => (callCount++ === 0 ? 'English' : 'German')),
      } as unknown as CoarI18n;

      const result$ = coarT$(mockI18n, mockEvents, 'coar.key');
      const values: string[] = [];

      const subscription = result$.subscribe((val) => values.push(val));

      // Wait for initial emission
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(values).toEqual(['English']);

      // Trigger language change
      langChange$.next();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(values).toEqual(['English', 'German']);

      subscription.unsubscribe();
    });

    it('should not emit duplicate values', async () => {
      const langChange$ = new Subject<void>();
      const mockEvents: CoarI18nEvents = { languageChanged$: langChange$ };
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Same Value'),
      } as unknown as CoarI18n;

      const result$ = coarT$(mockI18n, mockEvents, 'coar.key');
      const values: string[] = [];

      const subscription = result$.subscribe((val) => values.push(val));

      await new Promise((resolve) => setTimeout(resolve, 10));
      langChange$.next();
      await new Promise((resolve) => setTimeout(resolve, 10));
      langChange$.next();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only emit once despite multiple language changes
      expect(values).toEqual(['Same Value']);

      subscription.unsubscribe();
    });
  });

  describe('with params', () => {
    it('should pass params to i18n service', async () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Count: 5'),
      } as unknown as CoarI18n;

      const result$ = coarT$(
        mockI18n,
        null,
        'coar.items.count',
        { count: 5 },
        'Items'
      );
      const value = await firstValueFrom(result$);

      expect(value).toBe('Count: 5');
      expect(mockI18n.tWithDefault).toHaveBeenCalledWith(
        'coar.items.count',
        'Items',
        { count: 5 }
      );
    });
  });

  describe('default fallback', () => {
    it('should use empty string as default fallback', async () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => ''),
      } as unknown as CoarI18n;

      const result$ = coarT$(mockI18n, null, 'coar.missing');
      const value = await firstValueFrom(result$);

      expect(value).toBe('');
    });

    it('should allow custom fallback', async () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Custom'),
      } as unknown as CoarI18n;

      const result$ = coarT$(
        mockI18n,
        null,
        'coar.missing',
        undefined,
        'Custom'
      );
      const value = await firstValueFrom(result$);

      expect(value).toBe('Custom');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined events', async () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Value'),
      } as unknown as CoarI18n;

      const result$ = coarT$(
        mockI18n,
        undefined,
        'coar.key',
        undefined,
        'Default'
      );
      const value = await firstValueFrom(result$);

      expect(value).toBe('Value');
      expect(mockI18n.tWithDefault).toHaveBeenCalledWith(
        'coar.key',
        'Default',
        undefined
      );
    });

    it('should handle null events', async () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Value'),
      } as unknown as CoarI18n;

      const result$ = coarT$(mockI18n, null, 'coar.key');
      const value = await firstValueFrom(result$);

      expect(value).toBe('Value');
      expect(mockI18n.tWithDefault).toHaveBeenCalledWith('coar.key', '', undefined);
    });
  });
});
