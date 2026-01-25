import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarCardComponent } from './coar-card.component';

export const scenario = defineScenario<CoarCardComponent>({
  id: 'card',
  title: 'Card',
  description: 'Card container with default settings',
});
