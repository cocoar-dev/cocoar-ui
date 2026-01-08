# CoarTextInputComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Selector

```html
<coar-text-input></coar-text-input>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `autocomplete` | `string` | `''` | - | HTML autocomplete attribute |
| `clearable` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Show clear button when input has value and is focused/hovered |
| `disabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Disables the input (greyed out, not focusable) |
| `error` | `string` | `''` | - | Error message to display below the input |
| `hint` | `string` | `''` | - | Hint text displayed below the input |
| `id` | `string` | `''` | - | HTML id attribute for the input element |
| `label` | `string` | `''` | - | Label text displayed above the input |
| `maxlength` | `number \| undefined` | `undefined` | - | Maximum character length |
| `name` | `string` | `''` | - | HTML name attribute for form submission |
| `placeholder` | `string` | `''` | - | Placeholder text shown when input is empty |
| `prefix` | `string` | `''` | - | Text or symbol displayed before the input value |
| `readonly` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Makes the input read-only (focusable but not editable) |
| `required` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Marks the input as required, shows asterisk on label |
| `rows` | `number` | `1` | - | Number of visible text rows (1 = single-line input, 2+ = textarea) |
| `size` | `CoarTextInputSize` | `'md'` | - | Input size - matches button/checkbox sizes for consistent layouts |
| `suffix` | `string` | `''` | - | Text or symbol displayed after the input value |
| `value` | `string` | `''` | - | Current input value (two-way bindable with [(value)]) |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `blurred` | `FocusEvent` | Emits when input loses focus |
| `clear` | `void` | Emits when clear button is clicked |
| `focused` | `FocusEvent` | Emits when input gains focus |
| `value` | `string` | Current input value (two-way bindable with [(value)]) |
| `valueChange` | `string` | Emits when input value changes |
