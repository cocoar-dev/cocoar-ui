# CoarDatePickerComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

Date picker component using Temporal API.
Supports Temporal.PlainDate values for timezone-independent date selection.
Uses ISO string format internally for forms compatibility.
**Example :**`<coar-date-picker
  label="Birth Date"
  [(value)]="birthDate"
  placeholder="Select date..."
/>`

## Selector

```html
<coar-date-picker></coar-date-picker>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `dateFormatConfig` | `DateFormatConfig` | - | - | Date format configuration (pattern and first day of week). If not provided, uses locale service default or falls back to European format. |
| `disabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether the picker is disabled |
| `error` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Error state |
| `highlightWeekends` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether to highlight weekend days (Saturday/Sunday) with a subtle background |
| `label` | `string` | `''` | - | Label text displayed above the input |
| `locale` | `string` | - | - | Locale identifier for date formatting (e.g., 'de-AT', 'en-US'). Uses global locale service default if not specified. |
| `markers` | `CoarDateMarker[]` | `[]` | - | Date markers for highlighting special dates (holidays, events, etc.) |
| `max` | `Temporal.PlainDate \| null` | `null` | - | Maximum selectable date |
| `message` | `string` | `''` | - | Helper or error message |
| `min` | `Temporal.PlainDate \| null` | `null` | - | Minimum selectable date |
| `placeholder` | `string` | `'Select date...'` | - | Placeholder text when no date is selected |
| `readonly` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether the picker is readonly |
| `required` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether the field is required |
| `showTodayButton` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Whether to show a "Today" button |
| `showWeekNumbers` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether to show week numbers |
| `size` | `CoarDatePickerSize` | `'md'` | - | Size variant |
| `value` | `Temporal.PlainDate \| null` | `null` | - | Current selected date (two-way bindable with [(value)]) |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `closed` | `void` | Emitted when the picker closes |
| `opened` | `void` | Emitted when the picker opens |
| `value` | `Temporal.PlainDate \| null` | Current selected date (two-way bindable with [(value)]) |
| `valueChange` | `Temporal.PlainDate \| null` | Emitted when the selected date changes |
