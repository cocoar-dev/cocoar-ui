# CoarCheckboxComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Selector

```html
<coar-checkbox></coar-checkbox>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `checked` | `CoarCheckboxState \| undefined` | `undefined` | - | Checkbox state: 'checked', 'unchecked', 'indeterminate', or undefined (pristine). Using model() for two-way binding support. |
| `disabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Disables the checkbox (greyed out, not focusable) |
| `error` | `string` | `''` | - | Error message to display below the checkbox |
| `hint` | `string` | `''` | - | Hint text displayed below the checkbox |
| `id` | `string` | `''` | - | HTML id attribute for the checkbox element |
| `label` | `string` | `''` | - | Label text displayed next to the checkbox |
| `name` | `string` | `''` | - | HTML name attribute for form submission |
| `readonly` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Prevents changes but keeps normal appearance and focus |
| `required` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Marks as required, shows asterisk on label |
| `size` | `CoarCheckboxSize` | `'md'` | - | Checkbox size - matches input/button heights for consistent layouts |
| `value` | `string` | `''` | - | Value submitted with form when checked |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `checked` | `CoarCheckboxState \| undefined` | Checkbox state: 'checked', 'unchecked', 'indeterminate', or undefined (pristine). Using model() for two-way binding support. |
| `checkedChange` | `CoarCheckboxState` | Emits when state changes: 'checked' or 'unchecked' |
