import { Component, signal } from '@angular/core';

import {
  CoarPasswordInputComponent,
  CoarCodeBlockComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarDividerComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [
    CoarPasswordInputComponent,
    CoarCodeBlockComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarDividerComponent
],
  templateUrl: './password.page.html',
  styleUrl: './password.page.css',
})
export class PasswordPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/CoarPasswordInputComponent/overview.md';
  protected readonly apiPath = '/docs/libs/ui-components/CoarPasswordInputComponent/api.md';

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
