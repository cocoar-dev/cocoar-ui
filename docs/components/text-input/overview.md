# Text Input

`<coar-text-input>` is a form-ready text field for single-line and multi-line input.

## When to use

- Single-line text input (names, email, search)
- Multi-line text input using `rows` (notes, descriptions)
- Inputs that need `prefix` / `suffix` affordances

## Basic

```html
<coar-text-input
  label="Username"
  placeholder="Enter your username"
  hint="Choose a unique username"
  [value]="username"
  (valueChange)="username = $event"
/>
```

## Multiline

If `rows` is greater than `1`, the component renders a textarea.

```html
<coar-text-input
  label="Bio"
  [rows]="4"
  placeholder="Tell us about yourself…"
  [value]="bio"
  (valueChange)="bio = $event"
/>
```

## Forms

The component implements Angular Control Value Accessor, so it can be used with template-driven forms and reactive forms.
