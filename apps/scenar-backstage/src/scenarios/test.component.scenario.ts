import { Component, input } from '@angular/core';
import { defineScenario } from '@cocoar/scenar-abstractions';

export const testScenario = defineScenario<TestComponent>({
  id: 'test/sample',
  title: 'Test Sample',
});

@Component({
  standalone: true,
  template: `<div>Test: {{ message() }}</div>`,
})
export class TestComponent {
  message = input<string>('Hello from test?!');
}
