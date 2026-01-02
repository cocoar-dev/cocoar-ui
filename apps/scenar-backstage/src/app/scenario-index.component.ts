import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { loadScenarioRegistry } from './registry';

@Component({
  standalone: true,
  selector: 'scenar-scenario-index',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarScenarioIndexComponent {
  private readonly router = inject(Router);

  constructor() {
    const registry = loadScenarioRegistry();
    const firstId = registry.ids[0] ?? null;

    if (!firstId) {
      // No scenarios registered; keep the URL at /__scenario.
      return;
    }

    void this.router.navigate(['/__scenario', ...firstId.split('/')], { replaceUrl: true });
  }
}
