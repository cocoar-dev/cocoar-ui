import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarCodeBlockComponent } from './coar-code-block.component';

export const scenario = defineScenario<CoarCodeBlockComponent>({
  id: 'code-block',
  title: 'Code Block',
  description: 'Code block with syntax highlighting',
  inputs: {
    code: 'console.log("Hello, world!");',
  },
});
