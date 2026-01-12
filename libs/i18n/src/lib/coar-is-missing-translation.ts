/**
 * Determines if a translation result should be considered "missing".
 *
 * A translation is considered missing if it is:
 * - null or undefined
 * - an empty string (after trim)
 * - exactly equal to the requested key
 *
 * This provides unified missing-key semantics across different i18n engines.
 *
 * @param key - The translation key that was requested
 * @param result - The result returned by the i18n service
 * @returns true if the translation is missing, false otherwise
 *
 * @example
 * ```ts
 * coarIsMissingTranslation('coar.button.save', null) // true
 * coarIsMissingTranslation('coar.button.save', '') // true
 * coarIsMissingTranslation('coar.button.save', 'coar.button.save') // true
 * coarIsMissingTranslation('coar.button.save', 'Save') // false
 * ```
 */
export function coarIsMissingTranslation(
  key: string,
  result: string | null | undefined
): boolean {
  if (result == null) {
    return true;
  }

  const trimmed = result.trim();

  if (!trimmed) {
    return true;
  }

  return trimmed === key;
}
