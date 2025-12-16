import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoarMarkdownComponent } from '@cocoar/markdown-viewer';
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

import { ShowcaseMarkdownDocsService } from '../../shared/services/showcase-markdown-docs.service';

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CoarMarkdownComponent,
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
  private readonly markdownDocs = inject(ShowcaseMarkdownDocsService);

  activeTab = 'examples';

  protected readonly docsPath = '/docs/patterns/forms/overview.md';
  protected readonly docsState$ = this.markdownDocs.load(this.docsPath);

  loginLoading = signal(false);

  readonly loginForm = new FormGroup({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl<CoarCheckboxState>('unchecked', { nonNullable: true }),
  });

  readonly inlineForm = new FormGroup({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly registrationForm = new FormGroup({
    fullName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    confirmPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    acceptTerms: new FormControl<CoarCheckboxState>('unchecked', { nonNullable: true }),
    subscribeNewsletter: new FormControl<CoarCheckboxState>('unchecked', { nonNullable: true }),
  });

  readonly searchForm = new FormGroup({
    query: new FormControl<string>('', { nonNullable: true }),
  });

  simulateLogin() {
    this.loginLoading.set(true);
    setTimeout(() => {
      this.loginLoading.set(false);
    }, 2000);
  }

  onLoginSubmit(event: SubmitEvent): void {
    event.preventDefault();

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.simulateLogin();
  }

  codeExamples = {
    loginForm: `<form class="login-form" [formGroup]="loginForm" (submit)="onLoginSubmit($event)">
  <coar-text-input
    label="Email"
    placeholder="your@email.com"
    [required]="true"
    formControlName="email"
  />
  <coar-password-input
    label="Password"
    [required]="true"
    formControlName="password"
  />
  <coar-checkbox label="Remember me" formControlName="rememberMe" />
  <div class="form-actions">
    <coar-button variant="primary" type="submit" [loading]="loginLoading()" [disabled]="loginForm.invalid">
      Sign In
    </coar-button>
  </div>
</form>`,

    inlineForm: `<!-- Use matching sizes for input + button alignment -->
<form class="inline-form" [formGroup]="inlineForm">
  <coar-text-input placeholder="Enter your email" size="sm" formControlName="email" />
  <coar-button variant="primary" size="sm" type="button">Subscribe</coar-button>
</form>`,

    registrationForm: `<form class="registration-form" [formGroup]="registrationForm">
  <coar-text-input label="Full Name" placeholder="John Doe" [required]="true" formControlName="fullName" />
  <coar-text-input
    label="Email"
    placeholder="your@email.com"
    [required]="true"
    hint="We'll never share your email"
    formControlName="email"
  />
  <div class="two-columns">
    <coar-password-input
      label="Password"
      [required]="true"
      hint="Min. 8 characters"
      formControlName="password"
    />
    <coar-password-input label="Confirm Password" [required]="true" formControlName="confirmPassword" />
  </div>
  <coar-checkbox label="I accept the Terms of Service" [required]="true" formControlName="acceptTerms" />
  <coar-checkbox
    label="Subscribe to newsletter"
    hint="Get product updates and tips"
    formControlName="subscribeNewsletter"
  />
  <div class="form-actions">
    <coar-button variant="primary" iconEnd="caret-right" type="button">Create Account</coar-button>
    <coar-button variant="secondary" type="button">Cancel</coar-button>
  </div>
</form>`,

    searchForm: `<!-- Default md size (40px) for both -->
<form class="search-form" [formGroup]="searchForm">
  <coar-text-input placeholder="Search..." formControlName="query" />
  <coar-button variant="primary" type="button">Search</coar-button>
</form>`,
  };
}
