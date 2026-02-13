# Checkbox

Checkboxes allow users to make one or more selections.

`CoarCheckboxComponent` supports **three visual states**:

- checked (`true`)
- unchecked (`false`)
- indeterminate (via separate `[indeterminate]` input)

Additionally, the component supports a **pristine state** via `checked = undefined` (useful when you want to distinguish "not interacted yet" from an explicit unchecked).

## Basic usage

```html
<coar-checkbox
  label="I agree"
  [checked]="accepted()"
  (checkedChange)="accepted.set($event)"
/>
```

## State model

- `checked` input accepts `boolean | undefined`.
- `checkedChange` emits `boolean` (true/false).
- `indeterminate` is a separate boolean input for the visual indeterminate state.

## Indeterminate ("select all") pattern

Indeterminate is usually computed from child selections and set via a separate input.

```ts
parentChecked = computed(() => selected().length === allItems.length);
parentIndeterminate = computed(() => {
  const count = selected().length;
  return count > 0 && count < allItems.length;
});
```

```html
<coar-checkbox
  label="Select all"
  [checked]="parentChecked()"
  [indeterminate]="parentIndeterminate()"
  (checkedChange)="toggleAll($event)"
/>
```

## Validation + messaging

- `required` shows an asterisk next to the label.
- `error` displays an error message and styles the checkbox accordingly.
- `hint` displays helper text when no `error` is set.

## Readonly vs disabled

- `readonly`: focusable, looks normal, but changes are prevented.
- `disabled`: not focusable, styled as disabled.

## Accessibility

- Uses a native `<input type="checkbox">` for correct semantics.
- Indeterminate state is exposed via `aria-checked="mixed"`.
- Error/hint text is connected via `aria-describedby`.
