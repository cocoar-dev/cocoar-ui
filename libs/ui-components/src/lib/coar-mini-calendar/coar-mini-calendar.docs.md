# Mini Calendar

The **Mini Calendar** is an always-open calendar view for selecting a date.

It is designed to be embedded anywhere (side panels, dashboards, forms) and can also be used inside other components.

## Basic usage

```html
<coar-mini-calendar [(value)]="selectedDate" />
```

## Value model

- The calendar uses `Temporal.PlainDate`.
- `value` is nullable (`Temporal.PlainDate | null`).

## Constraints

Use `min` and `max` to disable dates outside a range:

```html
<coar-mini-calendar [(value)]="date" [min]="minDate" [max]="maxDate" />
```

## Localization

Month and weekday labels are localized using `Intl.DateTimeFormat`.

You can override:

- `locale` (e.g. `de-DE`, `en-US`)
- `dateFormatConfig.firstDayOfWeek` to control week layout (Monday vs Sunday)

## Week numbers

Enable ISO week numbers:

```html
<coar-mini-calendar [(value)]="date" [showWeekNumbers]="true" />
```

## Markers

Markers highlight dates or ranges (e.g. holidays) and can show details in a popover:

```ts
import type { CoarDateMarker } from '@cocoar/ui-components';

holidayMarkers: CoarDateMarker[] = [
  { startDate: Temporal.PlainDate.from('2025-12-24'), description: 'Christmas Eve' },
  { startDate: Temporal.PlainDate.from('2025-12-25'), endDate: Temporal.PlainDate.from('2025-12-26'), description: 'Christmas Holidays' },
];
```

```html
<coar-mini-calendar [(value)]="date" [markers]="holidayMarkers" />
```
