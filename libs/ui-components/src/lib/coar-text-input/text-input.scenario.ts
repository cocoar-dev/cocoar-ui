import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarTextInputComponent } from './coar-text-input.component';

export const scenario = defineScenario<CoarTextInputComponent>({
  id: 'demo/text-input',
  title: 'Text Input',
});
