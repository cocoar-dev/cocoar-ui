# Login form skeleton

This is the recommended baseline using Coar inputs with Angular Reactive Forms.

## Example (Reactive Forms + Coar inputs)

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CoarButtonComponent,
  CoarCardComponent,
  CoarPasswordInputComponent,
  CoarTextInputComponent,
} from '@cocoar/ui-components';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CoarCardComponent,
    CoarButtonComponent,
    CoarTextInputComponent,
    CoarPasswordInputComponent,
  ],
  template: `
    <coar-card>
      <form [formGroup]="form" (submit)="onSubmit($event)">
        <coar-text-input
          label="Email"
          placeholder="you@example.com"
          autocomplete="username"
          formControlName="email"
        />

        <coar-password-input
          label="Password"
          autocomplete="current-password"
          formControlName="password"
        />

        <coar-button type="submit" [disabled]="form.invalid">Login</coar-button>
      </form>
    </coar-card>
  `,
})
export class LoginFormSkeletonComponent {
  readonly form = new FormGroup({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  });

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (this.form.invalid) return;
    // TODO: call auth service
  }
}
```

Notes:
- Add tokens in global styles: `@import '@cocoar/ui-tokens/css/all.css';`
