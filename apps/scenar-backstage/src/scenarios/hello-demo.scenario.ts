import { defineScenario } from '@cocoar/scenar-abstractions';
import type { HelloDemoComponent } from './hello-demo.component';

export const helloBasic = defineScenario<HelloDemoComponent>({
  id: 'test/hello',
  title: 'Test / Hello',
  component: async () =>
    (await import('./hello-demo.component')).HelloDemoComponent,
  inputs: { name: 'Scenar' },
});
