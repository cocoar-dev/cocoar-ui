import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarLabelComponent } from './coar-label.component';

export const scenario = defineScenario<CoarLabelComponent>({
  id: 'label',
  title: 'Label',
});
