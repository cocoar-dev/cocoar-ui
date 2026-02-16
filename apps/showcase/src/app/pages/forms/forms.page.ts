import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CoarTextInputComponent,
  CoarPasswordInputComponent,
  CoarButtonComponent,
  CoarCardComponent,
  CoarNoteComponent,
  CoarCodeBlockComponent,
  CoarCheckboxComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CoarTextInputComponent,
    CoarPasswordInputComponent,
    CoarButtonComponent,
    CoarCardComponent,
    CoarNoteComponent,
    CoarCodeBlockComponent,
    CoarCheckboxComponent,
  ],
  templateUrl: './forms.page.html',
  styleUrl: './forms.page.css',
})
export class FormsPage {
  loginLoading = signal(false);

  readonly loginForm = new FormGroup({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl<boolean>(false, { nonNullable: true }),
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
    acceptTerms: new FormControl<boolean>(false, { nonNullable: true }),
    subscribeNewsletter: new FormControl<boolean>(false, { nonNullable: true }),
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
    loginForm: `<form [formGroup]="loginForm" (submit)="onLoginSubmit($event)">
  <coar-text-input label="Email" placeholder="your@email.com" [required]="true" formControlName="email" />
  <coar-password-input label="Password" [required]="true" formControlName="password" />
  <coar-checkbox label="Remember me" formControlName="rememberMe" />
  <coar-button variant="primary" type="submit" [loading]="loginLoading()" [disabled]="loginForm.invalid">
    Sign In
  </coar-button>
</form>`,

    inlineForm: `<!-- Use matching sizes for input + button alignment -->
<form class="inline-form" [formGroup]="inlineForm">
  <coar-text-input placeholder="Enter your email" size="s" formControlName="email" />
  <coar-button variant="primary" size="s" type="button">Subscribe</coar-button>
</form>`,

    registrationForm: `<form [formGroup]="registrationForm">
  <coar-text-input label="Full Name" [required]="true" formControlName="fullName" />
  <coar-text-input label="Email" [required]="true" hint="We'll never share your email" formControlName="email" />
  <div class="two-columns">
    <coar-password-input label="Password" [required]="true" formControlName="password" />
    <coar-password-input label="Confirm Password" [required]="true" formControlName="confirmPassword" />
  </div>
  <coar-checkbox label="I accept the Terms of Service" [required]="true" formControlName="acceptTerms" />
  <coar-button variant="primary" type="submit">Create Account</coar-button>
</form>`,

    searchForm: `<form class="search-form" [formGroup]="searchForm">
  <coar-text-input placeholder="Search..." formControlName="query" />
  <coar-button variant="primary" type="button">Search</coar-button>
</form>`,

    reactiveFormsExample: `import { FormControl, FormGroup, Validators } from '@angular/forms';

// Define your form structure with validators
readonly myForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  rememberMe: new FormControl(false),
});

// Access form values
onSubmit() {
  if (this.myForm.invalid) {
    this.myForm.markAllAsTouched();
    return;
  }

  const values = this.myForm.getRawValue();
  // Send values to your backend or state layer
}`,

    validationErrorsExample: `<!-- Display validation errors using the error input -->
<coar-text-input
  label="Email"
  placeholder="your@email.com"
  [required]="true"
  formControlName="email"
  [error]="getEmailError()"
/>

<!-- Component code -->
getEmailError(): string {
  const control = this.myForm.get('email');
  if (!control || !control.invalid || !control.touched) {
    return '';
  }

  if (control.hasError('required')) {
    return 'Email is required';
  }
  if (control.hasError('email')) {
    return 'Please enter a valid email address';
  }
  return '';
}`,
  };
}
