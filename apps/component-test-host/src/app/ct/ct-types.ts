import { EnvironmentProviders, Provider, Type } from '@angular/core';
import { CtInputParser } from './ct-parsers';

export type CtInputOverride = CtInputParser | false;
export type CtInputOverrides = Record<string, CtInputOverride>;

export interface CtStory<C = unknown> {
  id: string;
  providers?: Array<Provider | EnvironmentProviders>;
  /**
   * Optional overrides for auto-generated input parsers.
   * - Omitted: use auto-generated parser
   * - CtInputParser: override parser
   * - false: disallow this input
   */
  inputs?: CtInputOverrides;
}

export interface CtEntry {
  id: string;
  loadComponent: () => Promise<Type<unknown>>;
  providers?: Array<Provider | EnvironmentProviders>;
  inputs?: Record<string, CtInputParser>;
}

export type CtRegistry = Record<string, CtEntry>;
