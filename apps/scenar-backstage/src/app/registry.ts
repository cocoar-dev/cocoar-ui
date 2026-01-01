import type { ScenarioDefinition } from '@cocoar/scenar-abstractions';
import { SCENARIO_REGISTRY } from './manual-registry';

export type BackstageScenarioRegistryIndex = {
  ids: readonly string[];
  loadScenarioById(id: string): Promise<ScenarioDefinition>;
};

export function loadScenarioRegistry(): BackstageScenarioRegistryIndex {
  const ids = Object.keys(SCENARIO_REGISTRY);

  return {
    ids,
    loadScenarioById: async (id) => {
      const scenario = SCENARIO_REGISTRY[id];
      if (!scenario) {
        throw new Error(`Scenario not found: ${id}`);
      }
      return scenario;
    },
  };
}
