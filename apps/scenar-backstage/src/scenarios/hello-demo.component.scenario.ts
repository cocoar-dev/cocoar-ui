import { Component, input } from '@angular/core';

import { defineScenario } from '@cocoar/scenar-abstractions';

export const helloBasic = defineScenario<HelloDemoComponent>({
  id: 'test/hello',
  title: 'Test / Hello',
});

export const helloAdvanced = defineScenario<HelloDemoComponent>({
  id: 'demo/hello',
  title: 'Test / Hello',
});

@Component({
  standalone: true,
  template: `
    <div style="padding: 2rem; font-family: system-ui;">
      <h1>Hello {{ name() }}!</h1>
      <p>
        This is a test scenario to verify the simplified Backstage app works.
      </p>
    </div>
  `,
})
export class HelloDemoComponent {
  name = input<string>('World');
}
