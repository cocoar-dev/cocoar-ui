import { Component, input } from '@angular/core';
import { defineScenario } from '@cocoar/scenar-abstractions';

import { CoarPopoverComponent } from './coar-popover.component';

export const scenario = defineScenario<CoarPopoverPlaywrightComponent>({
  id: 'popover',
  title: 'Popover',
  inputs: {
    triggerLabel: 'Open',
    content: 'Hello from popover',
    disabled: false,
    openOnHover: false,
    openOnClick: true,
    interactive: true,
  },
});

@Component({
  selector: 'coar-popover-playwright-scenario',
  standalone: true,
  imports: [CoarPopoverComponent],
  template: `
    <coar-popover
      [disabled]="disabled()"
      [openOnHover]="openOnHover()"
      [openOnClick]="openOnClick()"
      [interactive]="interactive()"
    >
      <button data-testid="coar-popover-trigger" type="button" coarPopoverTrigger>
        {{ triggerLabel() }}
      </button>

      <div data-testid="coar-popover-content" coarPopoverContent>{{ content() }}</div>
    </coar-popover>
  `,
})
export class CoarPopoverPlaywrightComponent {
  triggerLabel = input<string>('Open');
  content = input<string>('Hello from popover');

  disabled = input<boolean>(false);
  openOnHover = input<boolean>(false);
  openOnClick = input<boolean>(true);
  interactive = input<boolean>(true);
}
