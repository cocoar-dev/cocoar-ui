# Login form skeleton (today)

This is a safe baseline until Coar inputs implement `ControlValueAccessor`.

## Example (native inputs + Coar layout)

```ts
import { Component, signal } from '@angular/core';
import { CoarButtonComponent, CoarCardComponent } from '@cocoar/ui-components';

@Component({
  standalone: true,
  imports: [CoarCardComponent, CoarButtonComponent],
  template: `
    <coar-card>
      <form (submit)="onSubmit($event)">
        <label>
          Email
          <input
            type="email"
            [value]="email()"
            (input)="email.set(($any($event.target).value))"
            autocomplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            [value]="password()"
            (input)="password.set(($any($event.target).value))"
            autocomplete="current-password"
            required
          />
        </label>

        <coar-button type="submit">Login</coar-button>
      </form>
    </coar-card>
  `,
})
export class LoginFormSkeletonComponent {
  readonly email = signal('');
  readonly password = signal('');

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    // TODO: call auth service
  }
}
```

Notes:
- This intentionally avoids `formControlName` until Coar inputs support CVA.
- Add tokens in global styles: `@import '@cocoar/ui-tokens/css/all.css';`
