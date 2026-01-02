import { ChangeDetectionStrategy, Component, InjectionToken, inject } from '@angular/core';

import { defineScenario } from '@cocoar/scenar-abstractions';

const SCENAR_PROVIDERS_PROBE_TOKEN = new InjectionToken<string>('SCENAR_PROVIDERS_PROBE_TOKEN');

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p data-testid="probe">{{ value }}</p>',
})
export class ScenarioProvidersProbeComponent {
  protected readonly value = inject(SCENAR_PROVIDERS_PROBE_TOKEN);
}

export const withProviders = defineScenario<ScenarioProvidersProbeComponent>({
  id: 'providers/probe',
  title: 'Scenario Providers Probe',
  providers: [{ provide: SCENAR_PROVIDERS_PROBE_TOKEN, useValue: 'ok' }],
});

export const withoutProviders = defineScenario<ScenarioProvidersProbeComponent>({
  id: 'providers/probe/no-providers',
  title: 'Scenario Providers Probe (No Providers)',
});
