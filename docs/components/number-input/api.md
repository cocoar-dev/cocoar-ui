# Number Input API

Selector: `<coar-number-input>`

## Inputs

| Name | Type | Default | Notes |
|---|---|---:|---|
| `label` | `string` | `''` | Label text displayed above the input. |
| `placeholder` | `string` | `''` | Placeholder text when empty. |
| `value` | `number \| null` | `null` | Current numeric value (also available via CVA). |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `min` | `number \| undefined` | `undefined` | Minimum allowed value. |
| `max` | `number \| undefined` | `undefined` | Maximum allowed value. |
| `step` | `number` | `1` | Step increment for buttons/keyboard. |
| `decimals` | `number` | `0` | Number of decimal places to display. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `readonly` | `boolean` | `false` | Focusable but not editable. |
| `required` | `boolean` | `false` | Shows required indicator. |
| `error` | `string` | `''` | Error message below the input. |
| `hint` | `string` | `''` | Hint text below the input (used when no error). |
| `clearable` | `boolean` | `true` | Enables the clear button. |
| `stepperButtons` | `'none' \| 'increment' \| 'decrement' \| 'both'` | `'none'` | Can also be used as a boolean attribute (`stepperButtons`) to enable both buttons. |
| `prefix` | `string` | `''` | Text shown before the value. |
| `suffix` | `string` | `''` | Text shown after the value. |
| `locale` | `string \| undefined` | `undefined` | Locale identifier used for formatting. |
| `numberFormat` | `{ decimal: string; thousand: string } \| undefined` | `undefined` | Explicit decimal/thousand separators. |
| `id` | `string` | `''` | HTML id for the input element. |
| `name` | `string` | `''` | HTML name attribute. |

## Outputs

| Name | Type | Notes |
|---|---|---|
| `valueChange` | `EventEmitter<number \| null>` | Emits on value change. |
| `focused` | `EventEmitter<FocusEvent>` | Emits when input receives focus. |
| `blurred` | `EventEmitter<FocusEvent>` | Emits when input loses focus. |
| `clear` | `EventEmitter<void>` | Emits when the clear button is used. |

## Notes

- When `error` is set, it takes priority over `hint` for the message area.
- The clear button is only shown when `clearable` is true, there is a value, and the input is not disabled/readonly.
