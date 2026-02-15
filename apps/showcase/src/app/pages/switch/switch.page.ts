import { Component, signal } from '@angular/core';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarSwitchComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [
    CoarSwitchComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
  ],
  templateUrl: './switch.page.html',
  styleUrl: './switch.page.css',
})
export class SwitchPage {
  importCode = `import { CoarSwitchComponent } from '@cocoar/ui/components';`;

  basicChecked = signal(false);
  notificationsChecked = signal(true);
  darkModeChecked = signal(false);

  codeExamples = {
    basic: `<coar-switch
  label="Enable feature"
  [(checked)]="enabled"
/>`,

    checked: `<coar-switch
  label="Notifications"
  [checked]="true"
/>`,

    disabled: `<coar-switch label="Disabled off" [disabled]="true" />
<coar-switch label="Disabled on" [disabled]="true" [checked]="true" />`,

    readonly: `<coar-switch label="Readonly off" [readonly]="true" />
<coar-switch label="Readonly on" [readonly]="true" [checked]="true" />`,

    sizes: `<coar-switch size="s" label="Small" />
<coar-switch size="m" label="Medium (default)" />
<coar-switch size="l" label="Large" />`,

    labelPosition: `<coar-switch label="Label after (default)" labelPosition="after" />
<coar-switch label="Label before" labelPosition="before" />`,
  };
}
