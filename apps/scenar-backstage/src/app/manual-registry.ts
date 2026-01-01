import type { ScenarioDefinition } from '@cocoar/scenar-abstractions';
import { helloBasic } from '../scenarios/hello-demo.scenario';

/**
 * Manual scenario registry.
 *
 * Import your scenarios here and add them to the registry map.
 *
 * IMPORTANT: For lazy-loading to work, keep components in separate files:
 * - button.component.ts (component implementation)
 * - button.scenario.ts (scenario definition with dynamic import)
 *
 * Example scenario definition:
 *
 * import { defineScenario } from '@cocoar/scenar-abstractions';
 * import type { ButtonComponent } from './button.component';
 *
 * export const buttonPrimary = defineScenario<ButtonComponent>({
 *   id: 'components/button/primary',
 *   title: 'Components / Button / Primary',
 *   component: async () => (await import('./button.component')).ButtonComponent,
 *   inputs: { variant: 'primary' },
 * });
 */
export const SCENARIO_REGISTRY: Record<string, ScenarioDefinition> = {
  [helloBasic.id]: helloBasic,
};
