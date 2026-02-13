import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarButtonComponent } from './coar-button.component';

export const scenario = defineScenario<CoarButtonComponent>({
  id: 'button',
  title: 'Button',
  description: 'Button with default settings',
});
