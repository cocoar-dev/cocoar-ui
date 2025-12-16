# Multi Select API

Selector: `<coar-multi-select>`

## Inputs

| Name | Type | Default | Notes |
|---|---|---:|---|
| `label` | `string` | `''` | Label text displayed above the select. |
| `placeholder` | `string` | `'Select an option...'` | Placeholder when no values are selected. |
| `options` | `CoarSelectOption<T>[]` | `[]` | List of selectable options. |
| `value` | `T[]` | `[]` | Current values (also available via CVA). |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `readonly` | `boolean` | `false` | Focusable but not editable. |
| `required` | `boolean` | `false` | Shows required indicator. |
| `error` | `string` | `''` | Error message below the select. |
| `hint` | `string` | `''` | Hint text below the select (used when no error). |
| `id` | `string` | `''` | HTML id (auto-generated when empty). |
| `name` | `string` | `''` | HTML name attribute. |
| `clearable` | `boolean` | `true` | Shows a clear button when values exist. |
| `maxDisplayItems` | `number` | `3` | Max selected labels shown before `"N selected"`. |
| `showSelectAll` | `boolean` | `false` | Show a "Select All" row in the dropdown. |
| `searchable` | `boolean` | `false` | Enables search/filter input in the dropdown. |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for the dropdown search input. |
| `compareWith` | `(o1: unknown, o2: unknown) => boolean \| undefined` | `undefined` | Use for object values (e.g. compare by `id`). |
| `dropdownPositionPreference` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Preferred dropdown opening direction. |

## Outputs

| Name | Type | Notes |
|---|---|---|
| `valueChange` | `EventEmitter<T[]>` | Emits whenever the selected values change. |

## Notes

- "Select All" is shown only when `showSelectAll` is true and the search query is empty.
- When `error` is set, it takes priority over `hint`.
