# Label

Standalone label component for section titles, field groups, and custom form layouts.

> Tip: For standard form fields, prefer the built-in `label` input on the corresponding component (for example `coar-text-input`). Use `coar-label` for headings, grouping, or when you are not using a single “field” component.

## Basic

```html
<coar-label>Email address</coar-label>
```

## Sizes

Use `size` to match the size system used across the design system.

```html
<coar-label size="xs">Extra small</coar-label>
<coar-label size="sm">Small</coar-label>
<coar-label size="md">Medium (default)</coar-label>
<coar-label size="lg">Large</coar-label>
```

## Required Indicator

Use `required` to display an asterisk after the label text.

```html
<coar-label [required]="true">Email address</coar-label>
```

## Group Labels

Use `coar-label` to label groups of related controls (for example a set of radio buttons or checkboxes).

```html
<coar-label size="sm" [required]="true">Preferred contact method</coar-label>
<div class="radio-group">
  <label><input type="radio" name="contact" value="email" /> Email</label>
  <label><input type="radio" name="contact" value="phone" /> Phone</label>
</div>
```

## Association With Form Controls

`coar-label` exposes a `for` input which sets the `for` attribute on the host element.

```html
<coar-label for="email">Email address</coar-label>
<coar-text-input id="email" size="sm" />
```

If you need native browser label behavior (clicking the label focuses the control), prefer using the built-in `label` capability of the corresponding form component.
