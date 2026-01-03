import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarTagComponent } from './coar-tag.component';

export const scenario = defineScenario<CoarTagComponent>({
  id: 'tag',
  title: 'Tag',
  description: 'Tag with default settings',
});
