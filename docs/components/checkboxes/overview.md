# Checkbox

Checkboxes allow users to make one or more selections.

`CoarCheckboxComponent` supports **three visual states**:

- `checked`
- `unchecked`
- `indeterminate`

Additionally, the component supports a **pristine state** via `checked = undefined` (useful when you want to distinguish “not interacted yet” from an explicit `unchecked`).

## Basic usage

```html
<coar-checkbox
  label="I agree"
  [checked]="state()"
  (checkedChange)="state.set($event)"
/>
```

## State model

Type: `CoarCheckboxState = 'checked' | 'unchecked' | 'indeterminate'`

- `checked` input accepts `CoarCheckboxState | undefined`.
- `checkedChange` emits **only** `'checked' | 'unchecked'`.
  - This matches the native checkbox interaction: a user click toggles the checkbox on/off.
  - `indeterminate` is a *display state* you set from outside (commonly for “Select all” parents).

## Indeterminate ("select all") pattern

Indeterminate is usually computed from child selections.

```ts
parentState = computed<CoarCheckboxState>(() => {
  const count = selected().length;
  if (count === 0) return 'unchecked';
  if (count === allItems.length) return 'checked';
  return 'indeterminate';
});
```

```html
<coar-checkbox
  label="Select all"
  [checked]="parentState()"
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
