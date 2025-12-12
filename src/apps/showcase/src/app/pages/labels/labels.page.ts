import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarLabelComponent,
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarTableComponent,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-labels',
  standalone: true,
  imports: [
    CommonModule,
    CoarLabelComponent,
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarTableComponent,
  ],
  templateUrl: './labels.page.html',
  styleUrl: './labels.page.css',
})
export class LabelsPage {
  activeTab = 'examples';

  // API properties
  apiProperties = [
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Size of the label. Should match the associated form element size.',
    },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description: 'Shows a required indicator (*) after the label text.',
    },
    {
      name: 'for',
      type: 'string',
      default: 'undefined',
      description: 'The ID of the form element this label is associated with.',
    },
  ];

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
