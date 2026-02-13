import { Component } from '@angular/core';

import {
  CoarLabelComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarNoteComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-labels',
  standalone: true,
  imports: [
    CoarLabelComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarNoteComponent,
  ],
  templateUrl: './labels.page.html',
  styleUrl: './labels.page.css',
})
export class LabelsPage {
  importCode = `import { CoarLabelComponent } from '@cocoar/ui/components';`;

  // Code examples
  codeExamples = {
    sections: `<coar-label size="lg">Account Information</coar-label>
<p>Personal details and preferences for your account.</p>

<coar-label size="md">Contact Details</coar-label>
<p>How we can reach you.</p>

<coar-label size="sm">Notification Settings</coar-label>
<p>Configure your email preferences.</p>`,

    sizes: `<coar-label size="xs">Extra Small Label</coar-label>
<coar-label size="sm">Small Label</coar-label>
<coar-label size="md">Medium Label</coar-label>
<coar-label size="lg">Large Label</coar-label>`,

    required: `<coar-label [required]="true">Required Section</coar-label>
<coar-label>Optional Section</coar-label>`,

    fieldGroup: `<coar-label size="sm" [required]="true">Preferred Contact Method</coar-label>
<div class="radio-group">
  <label>
    <input type="radio" name="contact" value="email" />
    Email
  </label>
  <label>
    <input type="radio" name="contact" value="phone" />
    Phone
  </label>
</div>`,
  };
}
