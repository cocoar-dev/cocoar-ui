import type { EnvironmentProviders, Provider } from '@angular/core';

/**
 * Consumers can register application-wide providers for Scenar Backstage here.
 *
 * This is intentionally empty by default so Backstage doesn't make assumptions.
 * Typical examples include HttpClient + interceptors, app-wide tokens, or mock backends.
 */
export const SCENAR_BACKSTAGE_GLOBAL_PROVIDERS: Array<Provider | EnvironmentProviders> = [];
