import { CoarI18n } from './coar-i18n';

/**
 * Convenience helper for translating with a default value in TypeScript code.
 *
 * Uses the same missing-translation semantics as the coarI18n pipe.
 * This is a thin wrapper around i18n.tWithDefault().
 *
 * @param i18n - The CoarI18n service instance
 * @param key - The translation key
 * @param fallback - The fallback text to use if translation is missing
 * @param params - Optional interpolation parameters
 * @returns The translated string or the fallback
 *
 * @example
 * ```ts
 * import { inject } from '@angular/core';
 * import { COAR_I18N, coarTWithDefault } from '@cocoar/i18n';
 *
 * export class MyComponent {
 *   private readonly i18n = inject(COAR_I18N);
 *
 *   label = coarTWithDefault(this.i18n, 'coar.button.save', 'Save');
 *   count = coarTWithDefault(this.i18n, 'coar.items.count', 'Items: {count}', { count: 5 });
 * }
 * ```
 */
export function coarTWithDefault(
  i18n: CoarI18n,
  key: string,
  fallback: string,
  params?: Record<string, unknown>
): string {
  return i18n.tWithDefault(key, fallback, params);
}
