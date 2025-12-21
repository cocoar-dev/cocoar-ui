import { EnvironmentProviders, Provider, Type } from '@angular/core';
import { ScenarioInputParser } from './scenario-parsers';

export type ScenarioInputOverride = ScenarioInputParser | false;
export type ScenarioInputOverrides = Record<string, ScenarioInputOverride>;

export interface ScenarioDefinition<C = unknown> {
  id: string;
  providers?: Array<Provider | EnvironmentProviders>;
  /**
   * Optional overrides for auto-generated input parsers.
   * - Omitted: use auto-generated parser
   * - ScenarioInputParser: override parser
   * - false: disallow this input
   */
  inputs?: ScenarioInputOverrides;
}

export interface ScenarioEntry {
  id: string;
  loadComponent: () => Promise<Type<unknown>>;
  providers?: Array<Provider | EnvironmentProviders>;
  inputs?: Record<string, ScenarioInputParser>;
}

export type ScenarioRegistry = Record<string, ScenarioEntry>;
