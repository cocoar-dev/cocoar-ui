# Checkbox API

Import from `@cocoar/ui-components`.

## Types

### `CoarCheckboxState`

`'checked' | 'unchecked' | 'indeterminate'`

### `CoarCheckboxSize`

`'xs' | 'sm' | 'md' | 'lg'`

## Component

### `CoarCheckboxComponent`

Selector: `coar-checkbox`

#### Inputs

- `label: string` — label text displayed next to the checkbox.
- `checked: CoarCheckboxState | undefined` — current state; `undefined` represents pristine.
- `disabled: boolean` — disables the checkbox.
- `readonly: boolean` — prevents changes but keeps normal appearance and focus.
- `required: boolean` — marks as required (asterisk on label).
- `error: string` — error message shown below the checkbox.
- `hint: string` — helper text shown below the checkbox (used when `error` is empty).
- `size: CoarCheckboxSize` — default `'md'`.
- `id: string` — HTML id attribute (optional; auto-generated if omitted).
- `name: string` — HTML name attribute.
- `value: string` — value submitted with a form when checked.

#### Outputs

- `checkedChange: CoarCheckboxState` — emits `'checked'` or `'unchecked'` when the user toggles.

#### Forms

Implements ControlValueAccessor for `CoarCheckboxState | undefined`.

- Writing `null` via forms is normalized to `undefined`.
- The component calls `onTouched` on blur.
