import { InjectionToken } from '@angular/core';
import { CoarTimeZoneProvider } from './coar-timezone-provider';

/**
 * Injection token for custom timezone providers (multi-provider).
 *
 * Providers are resolved in array order (first to last).
 * First non-null value wins.
 *
 * Browser provider is always present as guaranteed baseline (automatically added).
 *
 * @internal
 */
export const COAR_TIMEZONE_PROVIDERS = new InjectionToken<CoarTimeZoneProvider[]>(
  'COAR_TIMEZONE_PROVIDERS'
);
