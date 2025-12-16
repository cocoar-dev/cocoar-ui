# Date Picker API

Selector: `<coar-date-picker>`

## Value type

- `value`: `Temporal.PlainDate | null`

## Inputs

| Name | Type | Default | Notes |
|---|---|---:|---|
| `label` | `string` | `''` | Label text displayed above the input. |
| `placeholder` | `string` | `'Select date...'` | Placeholder when no date is selected. |
| `value` | `Temporal.PlainDate \| null` | `null` | Current value (also available via CVA). |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `readonly` | `boolean` | `false` | Focusable but not editable. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `required` | `boolean` | `false` | Shows required indicator. |
| `error` | `boolean` | `false` | Error state styling. |
| `message` | `string` | `''` | Helper/error message text below the input. |
| `min` | `Temporal.PlainDate \| null` | `null` | Minimum selectable date. |
| `max` | `Temporal.PlainDate \| null` | `null` | Maximum selectable date. |
| `locale` | `string \| undefined` | `undefined` | Locale for calendar + formatting (falls back to locale service/default). |
| `dateFormatConfig` | `DateFormatConfig \| undefined` | `undefined` | Format pattern + first day of week. |
| `showTodayButton` | `boolean` | `true` | Show a “Today” button in the calendar. |
| `showWeekNumbers` | `boolean` | `false` | Show ISO week numbers at the left. |
| `highlightWeekends` | `boolean` | `false` | Highlight Saturday/Sunday in the calendar grid. |
| `markers` | `CoarDateMarker[]` | `[]` | Date markers (single dates or inclusive ranges). |

## Outputs

| Name | Type | Notes |
|---|---|---|
| `valueChange` | `EventEmitter<Temporal.PlainDate \| null>` | Emits when the selected date changes. |
| `opened` | `EventEmitter<void>` | Emits when the calendar opens. |
| `closed` | `EventEmitter<void>` | Emits when the calendar closes. |

## Types

### `DateFormatConfig`

- `pattern`: `'dd.mm.yyyy' | 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'`
- `firstDayOfWeek`: `1 | 7`

### `CoarDateMarker`

- `startDate`: `Temporal.PlainDate`
- `endDate?`: `Temporal.PlainDate`
- `description`: `string`
- `cssClass?`: `string`

## Notes

- The component uses `Temporal.PlainDate` from `@js-temporal/polyfill`.
- `message` can be used for helper text or error text; `error` only controls styling.
