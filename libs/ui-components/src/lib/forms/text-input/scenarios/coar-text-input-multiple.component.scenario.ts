import { ChangeDetectionStrategy, Component } from '@angular/core';
import { defineScenario } from '@cocoar/scenar-abstractions';

import { CoarTextInputComponent } from '../coar-text-input.component';

export const scenario = defineScenario<CoarTextInputMultipleComponent>({
  id: 'input/text/multiple',
  title: 'Text Input (Multiple)',
});

@Component({
  selector: 'coar-text-input-multiple-scenario',
  standalone: true,
  imports: [CoarTextInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <coar-text-input id="first" label="First" placeholder="First"></coar-text-input>
    <coar-text-input id="second" label="Second" placeholder="Second"></coar-text-input>
  `,
})
export class CoarTextInputMultipleComponent {}
