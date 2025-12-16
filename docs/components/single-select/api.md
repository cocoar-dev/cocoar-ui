# Single Select API

Selector: `<coar-single-select>`

## Inputs

| Name | Type | Default | Notes |
|---|---|---:|---|
| `label` | `string` | `''` | Label text displayed above the select. |
| `placeholder` | `string` | `'Select an option...'` | Placeholder when no value is selected. |
| `options` | `CoarSelectOption<T>[]` | `[]` | List of selectable options. |
| `value` | `T \| null` | `null` | Current value (also available via CVA). |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `readonly` | `boolean` | `false` | Focusable but not editable. |
| `required` | `boolean` | `false` | Shows required indicator. |
| `error` | `string` | `''` | Error message below the select. |
| `hint` | `string` | `''` | Hint text below the select (used when no error). |
| `id` | `string` | `''` | HTML id (auto-generated when empty). |
| `name` | `string` | `''` | HTML name attribute. |
| `clearable` | `boolean` | `true` | Shows a clear button when a value is selected. |
| `searchable` | `boolean` | `false` | Enables search/filter input in the dropdown. |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for the dropdown search input. |
| `compareWith` | `(o1: unknown, o2: unknown) => boolean \| undefined` | `undefined` | Use for object values (e.g. compare by `id`). |
| `dropdownPositionPreference` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Preferred dropdown opening direction. |

## Outputs

| Name | Type | Notes |
|---|---|---|
| `valueChange` | `EventEmitter<T \| null>` | Emits whenever the selected value changes. |

## Notes

- When `error` is set, it takes priority over `hint`.
- The clear button is only shown when `clearable` is true, there is a value, and the component is not disabled/readonly.
