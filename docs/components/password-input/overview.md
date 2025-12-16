# Password Input

`<coar-password-input>` is a form-ready password field with an eye icon toggle to show/hide the current value.

## When to use

- Password entry (login forms)
- Password update flows (current/new/confirm)

## Basic

```html
<coar-password-input
  label="Password"
  placeholder="Enter your password"
  [value]="password"
  (valueChange)="password = $event"
/>
```

## Autocomplete

For best password manager support, set `autocomplete` depending on context:

```html
<coar-password-input
  label="Current Password"
  autocomplete="current-password"
  [value]="currentPassword"
  (valueChange)="currentPassword = $event"
/>

<coar-password-input
  label="New Password"
  autocomplete="new-password"
  [value]="newPassword"
  (valueChange)="newPassword = $event"
/>
```

## Accessibility

- Uses `type="password"` by default, switches to `type="text"` when visible.
- Toggle button updates `aria-label` with visibility state.
- Error and hint messages are associated via `aria-describedby`.

## Forms

The component implements Angular Control Value Accessor, so it can be used with template-driven forms and reactive forms.
