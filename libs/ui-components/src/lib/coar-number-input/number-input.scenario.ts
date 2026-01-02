import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarNumberInputComponent } from './coar-number-input.component';

export const scenario = defineScenario<CoarNumberInputComponent>({
  id: 'input/number',
  title: 'Number Input',
});
