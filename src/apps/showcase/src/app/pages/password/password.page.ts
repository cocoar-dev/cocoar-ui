import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarPasswordInputComponent,
  CoarCodeBlockComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarDividerComponent,
  CoarTableComponent,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [
    CommonModule,
    CoarPasswordInputComponent,
    CoarCodeBlockComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarDividerComponent,
    CoarTableComponent,
  ],
  templateUrl: './password.page.html',
  styleUrl: './password.page.css',
})
export class PasswordPage {
  activeTab = 'examples';

  // Demo values
  basicValue = signal('');
  withValuePassword = signal('SecurePass123!');
  requiredPassword = signal('');
  errorPassword = signal('weak');

  // Change password form
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  // API properties
  apiProperties = [
    {
      name: 'label',
      type: 'string',
      default: "''",
      description: 'Label text displayed above the input',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Placeholder text when empty',
    },
    { name: 'value', type: 'string', default: "''", description: 'Current input value' },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Input size: sm (32px), md (40px), lg (48px)',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Makes input read-only' },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description: 'Marks as required, shows asterisk',
    },
    { name: 'error', type: 'string', default: "''", description: 'Error message to display' },
    { name: 'hint', type: 'string', default: "''", description: 'Hint text displayed below input' },
    {
      name: 'autocomplete',
      type: 'string',
      default: "'off'",
      description: 'Autocomplete attribute (current-password, new-password)',
    },
  ];

  apiOutputs = [
    { name: 'valueChange', type: 'string', description: 'Emitted when value changes' },
    { name: 'focused', type: 'FocusEvent', description: 'Emitted when input gains focus' },
    { name: 'blurred', type: 'FocusEvent', description: 'Emitted when input loses focus' },
  ];

  codeExamples = {
    basic: `<coar-password-input
  label="Password"
  placeholder="Enter your password"
  [(value)]="password"
/>`,

    required: `<coar-password-input
  label="Password"
  placeholder="Password is required"
  [required]="true"
  hint="This field is required"
  [(value)]="password"
/>`,

    error: `<coar-password-input
  label="Password"
  [(value)]="password"
  error="Password must be at least 8 characters"
/>`,

    states: `<!-- Disabled -->
<coar-password-input
  label="Password"
  [disabled]="true"
  value="DisabledPassword"
/>

<!-- Readonly -->
<coar-password-input
  label="Password"
  [readonly]="true"
  value="ReadonlyPassword"
/>`,

    sizes: `<!-- Small - 32px height -->
<coar-password-input size="sm" placeholder="Compact password" />

<!-- Medium (default) - 40px height -->
<coar-password-input size="md" placeholder="Standard password" />

<!-- Large - 48px height -->
<coar-password-input size="lg" placeholder="Prominent password" />`,

    changePassword: `<coar-password-input
  label="Current Password"
  placeholder="Enter current password"
  [required]="true"
  autocomplete="current-password"
  [(value)]="currentPassword"
/>

<coar-password-input
  label="New Password"
  placeholder="Enter new password"
  [required]="true"
  hint="Min. 8 characters with uppercase, lowercase, and numbers"
  autocomplete="new-password"
  [(value)]="newPassword"
/>

<coar-password-input
  label="Confirm New Password"
  placeholder="Re-enter new password"
  [required]="true"
  autocomplete="new-password"
  [(value)]="confirmPassword"
/>`,
  };
}
