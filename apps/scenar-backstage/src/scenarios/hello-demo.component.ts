import { Component, input } from '@angular/core';

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
