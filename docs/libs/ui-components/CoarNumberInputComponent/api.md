# CoarNumberInputComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Selector

```html
<coar-number-input></coar-number-input>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `clearable` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Show clear button when input has value and is focused/hovered |
| `decimals` | `number` | `0` | - | Number of decimal places to display |
| `disabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Disables the input (greyed out, not focusable) |
| `error` | `string` | `''` | - | Error message to display below the input |
| `hint` | `string` | `''` | - | Hint text displayed below the input |
| `id` | `string` | `''` | - | HTML id attribute for the input element |
| `label` | `string` | `''` | - | Label text displayed above the input |
| `locale` | `string` | - | - | Locale identifier for number formatting (e.g., 'de-AT', 'en-US'). Uses global locale service default if not specified. |
| `max` | `number \| undefined` | `undefined` | - | Maximum allowed value |
| `min` | `number \| undefined` | `undefined` | - | Minimum allowed value |
| `name` | `string` | `''` | - | HTML name attribute for form submission |
| `numberFormat` | `NumberFormatConfig` | - | - | Number format configuration (decimal and thousand separators). If not provided, uses locale service default or falls back to { decimal: '.', thousand: '' }. |
| `placeholder` | `string` | `''` | - | Placeholder text shown when input is empty |
| `prefix` | `string` | `''` | - | Text or symbol displayed before the input value |
| `readonly` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Makes the input read-only (focusable but not editable) |
| `required` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Marks the input as required, shows asterisk on label |
| `size` | `CoarNumberInputSize` | `'md'` | - | Input size - matches button/checkbox sizes for consistent layouts |
| `step` | `number` | `1` | - | Step increment for arrows and keyboard |
| `stepperButtons` | `CoarNumberInputStepperButtons, boolean \| string` | `'none', {    transform: transformStepperButtons,  }` | - | Controls visibility of increment/decrement stepper buttons. Supports both boolean attribute pattern and granular string control:  - No attribute → no buttons  - `stepperButtons` (attribute) → both buttons  - `stepperButtons="increment"` → only increment  - `stepperButtons="decrement"` → only decrement  - `stepperButtons="both"` → both buttons (explicit)  - `stepperButtons="none"` → no buttons (explicit) |
| `suffix` | `string` | `''` | - | Text or symbol displayed after the input value |
| `value` | `number \| null` | `null` | - | Current numeric value. Using model() for two-way binding support. |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `blurred` | `FocusEvent` | Emits when input loses focus |
| `clear` | `void` | Emits when clear button is clicked |
| `focused` | `FocusEvent` | Emits when input gains focus |
| `value` | `number \| null` | Current numeric value. Using model() for two-way binding support. |
| `valueChange` | `number \| null` | Emits when input value changes |
