import { type Provider } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

/**
 * Provides Angular's noop animation drivers for deterministic, fast unit tests.
 */
export function provideCoarNoopAnimations(): Provider[] {
  return provideNoopAnimations();
}
