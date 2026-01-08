# CoarSingleSelectComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

Single-select dropdown component.
Allows selecting one option from a list with keyboard navigation,
search/filter support, and full forms integration.
**Example :**`<coar-single-select
  label="Country"
  [options]="countries"
  [(value)]="selectedCountry"
  placeholder="Select a country"
/>`

## Selector

```html
<coar-single-select></coar-single-select>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `clearable` | `boolean, unknown` | `true` | - | Whether to show a clear button when a value is selected |
| `value` | `T \| null` | `null` | - | Current selected value (two-way bindable with [(value)]) |
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
| `value` | `T \| null` | Current selected value (two-way bindable with [(value)]) |
| `valueChange` | `T \| null` | Emits when the selected value changes |
