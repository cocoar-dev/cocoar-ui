# Form Patterns

Form patterns and layouts demonstrating how input components work together.

## Use Reactive Forms

Prefer Angular Reactive Forms (`FormGroup`, `FormControl`) for consistency and validation.

## Size Alignment

Input sizes match button sizes for consistent form layouts.

- Use the same `size` for inputs, checkboxes, and buttons when they sit on the same row.
- Default `m` size is a safe choice for most forms.

### Height reference

| Size | Typical use | Height |
| --- | --- | --- |
| `xs` | Inline actions | 27px |
| `s` | Compact UI | 32px |
| `m` | Default | 40px |
| `l` | Prominent actions | 48px |

## Best Practices

- Always use the same size for inputs and buttons in inline forms.
- Use `s` for compact UI like toolbars or dense tables.
- Use `m` (default) for most forms and dialogs.
- Use `l` for prominent forms (login/hero sections).
- Required fields: use the component’s `required` input so the UI and accessibility metadata are correct.

## Example Patterns

### Login form

```html
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <coar-text-input label="Email" formControlName="email" />
  <coar-password-input label="Password" formControlName="password" />
  <coar-button type="submit" variant="primary" [disabled]="loginForm.invalid" [loading]="submitting">
    Sign in
  </coar-button>
</form>
```

- Use `type="submit"` on the primary action button.
- Disable and/or set `loading` while submitting to prevent double submits.

### Inline single-field form

```html
<form class="inline-form" (ngSubmit)="onSearch()">
  <coar-text-input size="s" placeholder="Search..." formControlName="query" />
  <coar-button size="s" variant="primary" type="submit">Search</coar-button>
</form>
```

- Keep both input and button at `size="s"` (or the same size you choose).
- Use `fullWidth` buttons only when the layout calls for it.

## See Also

- [Login Form Skeleton](../../docs/recipes/login-form-skeleton.md) — Copy-paste login form recipe
- [Forms Status](../../docs/recipes/forms-status.md) — CVA support and form control guidance
