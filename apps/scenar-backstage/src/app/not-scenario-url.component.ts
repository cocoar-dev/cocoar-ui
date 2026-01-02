import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'scenar-not-scenario-url',
  template: `
    <main class="scenar-stage">
      <h1>Scenario not found</h1>
      <p>Not a scenario URL.</p>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .scenar-stage {
        min-height: 100vh;
        width: 100%;
        padding: var(--coar-spacing-l);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarNotScenarioUrlComponent {}
