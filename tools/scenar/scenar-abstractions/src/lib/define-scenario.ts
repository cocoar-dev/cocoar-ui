import type { ScenarioDefinition } from './scenario-definition';

/**
 * Define a scenario with type safety.
 *
 * @example
 * ```typescript
 * export const buttonPrimary = defineScenario<ButtonComponent>({
 *   id: 'button/primary',
 *   title: 'Button / Primary',
 *   component: async () => (await import('./button.component')).ButtonComponent,
 *   inputs: { label: 'Click me' }
 * });
 * ```
 */
export function defineScenario<TComponent = any>(
  definition: Omit<ScenarioDefinition<TComponent>, 'component'> & { component?: ScenarioDefinition<TComponent>['component'] },
): ScenarioDefinition<TComponent> {
  return definition as ScenarioDefinition<TComponent>;
}
