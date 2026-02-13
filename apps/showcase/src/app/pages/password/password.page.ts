import { Component, signal } from '@angular/core';

import {
  CoarPasswordInputComponent,
  CoarCodeBlockComponent,
  CoarCardComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [
    CoarPasswordInputComponent,
    CoarCodeBlockComponent,
    CoarCardComponent,
  ],
  templateUrl: './password.page.html',
  styleUrl: './password.page.css',
})
export class PasswordPage {
  importCode = `import { CoarPasswordInputComponent } from '@cocoar/ui/components';`;

  // Demo values
  basicValue = signal('');
  withValuePassword = signal('SecurePass123!');
  requiredPassword = signal('');
  errorPassword = signal('weak');

  // Change password form
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  codeExamples = {
    basic: `<coar-password-input
  label="Password"
  placeholder="Enter your password"
  [value]="basicValue()"
  (valueChange)="basicValue.set($event)"
/>`,

    required: `<coar-password-input
  label="Password"
  placeholder="Password is required"
  [required]="true"
  hint="This field is required"
  [value]="requiredPassword()"
  (valueChange)="requiredPassword.set($event)"
/>`,

    error: `<coar-password-input
  label="Password"
  [value]="errorPassword()"
  (valueChange)="errorPassword.set($event)"
  error="Password must be at least 8 characters"
/>`,

    states: `<!-- Disabled -->
<coar-password-input label="Password" [disabled]="true" value="DisabledPassword" />

<!-- Readonly -->
<coar-password-input label="Password" [readonly]="true" value="ReadonlyPassword" />`,

    sizes: `<!-- Available sizes: xs, s, m, l -->
<coar-password-input size="xs" placeholder="24px height" />
<coar-password-input size="s" placeholder="32px height" />
<coar-password-input size="m" placeholder="40px height" />
<coar-password-input size="l" placeholder="48px height" />`,

    changePassword: `<coar-password-input
  label="Current Password"
  placeholder="Enter current password"
  [required]="true"
  autocomplete="current-password"
  [value]="currentPassword()"
  (valueChange)="currentPassword.set($event)"
/>

<coar-password-input
  label="New Password"
  placeholder="Enter new password"
  [required]="true"
  hint="Min. 8 characters with uppercase, lowercase, and numbers"
  autocomplete="new-password"
  [value]="newPassword()"
  (valueChange)="newPassword.set($event)"
/>

<coar-password-input
  label="Confirm New Password"
  placeholder="Re-enter new password"
  [required]="true"
  autocomplete="new-password"
  [value]="confirmPassword()"
  (valueChange)="confirmPassword.set($event)"
/>`,
  };
}
