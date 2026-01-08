# CoarPasswordInputComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Selector

```html
<coar-password-input></coar-password-input>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `autocomplete` | `string` | `'current-password'` | - | HTML autocomplete attribute for browser autofill |
| `clearable` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Show clear button when input has value and is focused/hovered |
| `disabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Disables the input (greyed out, not focusable) |
| `error` | `string` | `''` | - | Error message to display below the input |
| `hint` | `string` | `''` | - | Hint text displayed below the input |
| `id` | `string` | `''` | - | HTML id attribute for the input element |
| `label` | `string` | `''` | - | Label text displayed above the input |
| `maxlength` | `number \| undefined` | `undefined` | - | Maximum character length |
| `name` | `string` | `''` | - | HTML name attribute for form submission |
| `placeholder` | `string` | `''` | - | Placeholder text shown when input is empty |
| `readonly` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Makes the input read-only (focusable but not editable) |
| `required` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Marks the input as required, shows asterisk on label |
| `size` | `CoarPasswordInputSize` | `'md'` | - | Input size - matches other form elements for consistent layouts |
| `value` | `string` | `''` | - | Current password value. Using model() for two-way binding support. |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `blurred` | `FocusEvent` | Emits when input loses focus |
| `clear` | `void` | Emits when clear button is clicked |
| `focused` | `FocusEvent` | Emits when input gains focus |
| `value` | `string` | Current password value. Using model() for two-way binding support. |
| `valueChange` | `string` | Emits when password value changes |
