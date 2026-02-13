import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarBadgeComponent } from './coar-badge.component';

export const scenario = defineScenario<CoarBadgeComponent>({
  id: 'badge',
  title: 'Badge',
  description: 'Badge with default settings',
  inputs: {
    content: '5',
  },
});
