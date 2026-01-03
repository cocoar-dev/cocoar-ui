import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarCheckboxComponent } from './coar-checkbox.component';

export const scenario = defineScenario<CoarCheckboxComponent>({
  id: 'checkbox',
  title: 'Checkbox',
  description: 'Checkbox with default settings',
});
