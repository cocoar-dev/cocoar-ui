# Tag Select API

Selector: `<coar-tag-select>`

## Inputs

| Name | Type | Default | Notes |
|---|---|---:|---|
| `label` | `string` | `''` | Label text displayed above the select. |
| `placeholder` | `string` | `'Select an option...'` | Placeholder when no tags are selected. |
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
| `allowCreate` | `boolean` | `false` | Enables creating a new tag from the current input. |
| `maxTags` | `number` | `0` | Max tags allowed (`0` = unlimited). |
| `createPrefix` | `string` | `'Create: '` | Label prefix for the create option row. |
| `searchable` | `boolean` | `false` | Present on the base type; not used by tag-select. |
| `searchPlaceholder` | `string` | `'Search...'` | Present on the base type; not used by tag-select. |
| `compareWith` | `(o1: unknown, o2: unknown) => boolean \| undefined` | `undefined` | Use for object values (e.g. compare by `id`). |
| `dropdownPositionPreference` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Preferred dropdown opening direction. |

## Outputs

| Name | Type | Notes |
|---|---|---|
| `valueChange` | `EventEmitter<T[]>` | Emits whenever the selected values change. |
| `tagCreated` | `EventEmitter<T>` | Emits when a new tag is created. |

## Notes

- Tag select always filters the dropdown based on the current typed text; it does not have a separate `searchable` mode.
- When `maxTags` is reached, the inline input is hidden and no more tags can be added.
- When `error` is set, it takes priority over `hint`.
