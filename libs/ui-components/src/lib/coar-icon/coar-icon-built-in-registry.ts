import { type Provider } from '@angular/core';
import { CORE_ICONS } from './core-icons';
import { provideCoarIconMapSource } from './coar-icon-registry';

export const COAR_BUILTIN_ICON_SOURCE_KEY = 'coar-builtin' as const;

/**
 * Overrides (and/or adds) built-in icons while keeping the built-in set as a base.
 *
 * This registers a map source under the fixed key `coar-builtin`, so it replaces the
 * built-in fallback source inside `CoarIconService`.
 */
export function provideCoarIconBuiltInOverrides(
  overrides: Readonly<Record<string, string>>
): Provider {
  return provideCoarIconMapSource({
    key: COAR_BUILTIN_ICON_SOURCE_KEY,
    icons: {
      ...CORE_ICONS,
      ...overrides,
    },
  });
}
