# Password Input API

Selector: `<coar-password-input>`

## Inputs

| Name | Type | Default | Notes |
|---|---|---:|---|
| `label` | `string` | `''` | Label text displayed above the input. |
| `placeholder` | `string` | `''` | Placeholder text when empty. |
| `value` | `string` | `''` | Current value (also available via CVA). |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `readonly` | `boolean` | `false` | Focusable but not editable. |
| `required` | `boolean` | `false` | Shows required indicator. |
| `error` | `string` | `''` | Error message below the input. |
| `hint` | `string` | `''` | Hint text below the input (used when no error). |
| `clearable` | `boolean` | `true` | Enables the clear button. |
| `id` | `string` | `''` | HTML id for the input element. |
| `name` | `string` | `''` | HTML name attribute. |
| `autocomplete` | `string` | `'current-password'` | HTML autocomplete attribute. |
| `maxlength` | `number \| undefined` | `undefined` | Max character length. |

## Outputs

| Name | Type | Notes |
|---|---|---|
| `valueChange` | `EventEmitter<string>` | Emits on value change. |
| `focused` | `EventEmitter<FocusEvent>` | Emits when input receives focus. |
| `blurred` | `EventEmitter<FocusEvent>` | Emits when input loses focus. |
| `clear` | `EventEmitter<void>` | Emits when the clear button is used. |

## Notes

- When `error` is set, it takes priority over `hint` for the message area.
- The clear button is only shown when `clearable` is true, there is a value, and the input is not disabled/readonly.
