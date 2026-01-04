import { type Provider } from '@angular/core';
import { CORE_ICONS } from './core-icons';
import { provideCoarIconMapSource } from './coar-icon-registry';

export function provideCoarIconBuiltInSourceAs(key: string): Provider {
  return provideCoarIconMapSource({ key, icons: CORE_ICONS });
}
