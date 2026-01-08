# CoarTagSelectComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

Tag-based multi-select component.
Displays selected items as removable tag chips with support for
creating new tags on-the-fly (optional), keyboard navigation,
and full forms integration.
**Example :**`<coar-tag-select
  label="Tags"
  [options]="availableTags"
  [(value)]="selectedTags"
  [allowCreate]="true"
  placeholder="Add tags..."
/>`

## Selector

```html
<coar-tag-select></coar-tag-select>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `allowCreate` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Allow creating new tags that don't exist in options |
| `createPrefix` | `string` | `'Create: '` | - | Text shown when creating a new tag |
| `maxTags` | `number` | `0` | - | Maximum number of tags that can be selected (0 = unlimited) |
| `value` | `T[]` | `[]` | - | Current selected values (two-way bindable with [(value)]) |
| `compareWith` | `(o1: unknown, o2: unknown) => boolean` | - | - | Comparison function to match values with options. Use this when value objects come from different sources (e.g., API vs form). **Example :**`// Compare Country objects by their ID compareById = (a: Country | null, b: Country | null) => a?.id === b?.id;` |
| `disabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Disables the select (greyed out, not focusable) |
| `dropdownPositionPreference` | `"auto" \| "top" \| "bottom"` | `'auto'` | - | Force dropdown position ('auto' calculates based on available space) |
| `error` | `string` | `''` | - | Error message to display below the select |
| `hint` | `string` | `''` | - | Hint text displayed below the select |
| `id` | `string` | `''` | - | HTML id attribute for the select element |
| `label` | `string` | `''` | - | Label text displayed above the select |
| `name` | `string` | `''` | - | HTML name attribute for form submission |
| `options` | `CoarSelectOption[]` | `[]` | - | Available options to choose from |
| `placeholder` | `string` | `'Select an option...'` | - | Placeholder text shown when no option is selected |
| `readonly` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Makes the select read-only (focusable but not editable) |
| `required` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Marks the select as required, shows asterisk on label |
| `searchable` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Enable search/filter functionality within the dropdown |
| `searchPlaceholder` | `string` | `'Search...'` | - | Search input placeholder when searchable is enabled |
| `size` | `CoarSelectSize` | `'md'` | - | Select size - matches button/input heights for consistent layouts |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `tagCreated` | `T` | Emits when a new tag is created |
| `value` | `T[]` | Current selected values (two-way bindable with [(value)]) |
| `valueChange` | `T[]` | Emits when the selected values change |
