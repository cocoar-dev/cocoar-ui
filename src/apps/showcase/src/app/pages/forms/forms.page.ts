import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarTextInputComponent,
  CoarPasswordInputComponent,
  CoarButtonComponent,
  CoarCardComponent,
  CoarNoteComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarCodeBlockComponent,
  CoarCheckboxComponent,
  CoarCheckboxState,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [
    CommonModule,
    CoarTextInputComponent,
    CoarPasswordInputComponent,
    CoarButtonComponent,
    CoarCardComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarCodeBlockComponent,
    CoarCheckboxComponent,
  ],
  templateUrl: './forms.page.html',
  styleUrl: './forms.page.css',
})
export class FormsPage {
  activeTab = 'examples';

  // Login form
  loginEmail = signal('');
  loginPassword = signal('');
  loginLoading = signal(false);
  rememberMe = signal<CoarCheckboxState | undefined>(undefined);

  // Registration form
  regName = signal('');
  regEmail = signal('');
  regPassword = signal('');
  regConfirmPassword = signal('');
  acceptTerms = signal<CoarCheckboxState | undefined>(undefined);
  subscribeNewsletter = signal<CoarCheckboxState | undefined>(undefined);

  // Inline form
  inlineEmail = signal('');

  // Search form
  searchQuery = signal('');

  simulateLogin() {
    this.loginLoading.set(true);
    setTimeout(() => {
      this.loginLoading.set(false);
    }, 2000);
  }

  codeExamples = {
    loginForm: `<div class="login-form">
  <coar-input
    label="Email"
    placeholder="your@email.com"
    [required]="true"
    [(value)]="email"
  />
  <coar-password-input
    label="Password"
    [required]="true"
    [(value)]="password"
  />
  <coar-checkbox
    label="Remember me"
    [checked]="rememberMe()"
    (checkedChange)="rememberMe.set($event)"
  />
  <div class="form-actions">
    <coar-button
      variant="primary"
      [loading]="isLoading()"
      (clicked)="login()"
    >
      Sign In
    </coar-button>
  </div>
</div>`,

    inlineForm: `<!-- Use matching sizes for input + button alignment -->
<div class="inline-form">
  <coar-input
    placeholder="Enter your email"
    size="sm"
    [(value)]="email"
  />
  <coar-button variant="primary" size="sm">
    Subscribe
  </coar-button>
</div>`,

    registrationForm: `<div class="registration-form">
  <coar-input
    label="Full Name"
    placeholder="John Doe"
    [required]="true"
  />
  <coar-input
    label="Email"
    placeholder="your@email.com"
    [required]="true"
    hint="We'll never share your email"
  />
  <div class="two-columns">
    <coar-password-input
      label="Password"
      [required]="true"
      hint="Min. 8 characters"
    />
    <coar-password-input
      label="Confirm Password"
      [required]="true"
    />
  </div>
  <coar-checkbox
    label="I accept the Terms of Service"
    [required]="true"
    [checked]="acceptTerms()"
    (checkedChange)="acceptTerms.set($event)"
  />
  <coar-checkbox
    label="Subscribe to newsletter"
    hint="Get product updates and tips"
    [checked]="newsletter()"
    (checkedChange)="newsletter.set($event)"
  />
  <div class="form-actions">
    <coar-button variant="primary" iconEnd="caret-right">
      Create Account
    </coar-button>
    <coar-button variant="secondary">Cancel</coar-button>
  </div>
</div>`,

    searchForm: `<!-- Default md size (40px) for both -->
<div class="search-form">
  <coar-text-input placeholder="Search..." />
  <coar-button variant="primary">Search</coar-button>
</div>`,
  };
}
