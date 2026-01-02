import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarNumberInputComponent } from './coar-number-input.component';

export const scenario = defineScenario<CoarNumberInputComponent>({
  id: 'demo/number-input',
  title: 'Number Input',
});
