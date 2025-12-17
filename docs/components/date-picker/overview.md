# Date Picker

Selector: `<coar-date-picker>`

A date picker based on **Temporal.PlainDate** (timezone-independent calendar dates).

## Basic usage

```html
<coar-date-picker
  label="Select a Date"
  placeholder="Pick a date..."
  [(value)]="selectedDate"
/>
```

## Min / max constraints

```ts
import { Temporal } from '@js-temporal/polyfill';

minDate = Temporal.Now.plainDateISO().subtract({ months: 1 });
maxDate = Temporal.Now.plainDateISO().add({ months: 3 });
```

```html
<coar-date-picker
  label="Booking Date"
  [(value)]="selectedDate"
  [min]="minDate"
  [max]="maxDate"
/>
```

## Locale-aware formatting

The date picker integrates with `COAR_LOCALE_SERVICE`.

Format priority:
1. `dateFormatConfig` input
2. `locale` input + locale service
3. Locale service default

```html
<coar-date-picker
  label="European"
  [dateFormatConfig]="{ pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 }"
  [(value)]="selectedDate"
/>
```

## Optional features

```html
<coar-date-picker
  label="Full Featured"
  [(value)]="selectedDate"
  [showWeekNumbers]="true"
  [highlightWeekends]="true"
  [showTodayButton]="true"
/>
```

## Date markers

Use `markers` to mark special dates (single day or ranges):

```ts
import { Temporal } from '@js-temporal/polyfill';
import type { CoarDateMarker } from '@cocoar/ui-components';

holidayMarkers: CoarDateMarker[] = [
  {
    startDate: Temporal.PlainDate.from('2025-12-24'),
    description: 'Christmas Eve',
  },
  {
    startDate: Temporal.PlainDate.from('2025-12-25'),
    endDate: Temporal.PlainDate.from('2025-12-26'),
    description: 'Christmas Holidays',
  },
];
```

```html
<coar-date-picker
  label="With Holidays"
  [(value)]="selectedDate"
  [markers]="holidayMarkers"
/>
```

## Forms

The component implements Angular `ControlValueAccessor`, so it works with both template-driven and reactive forms.

**Reactive Forms:**
```ts
import { FormControl } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';

birthDate = new FormControl<Temporal.PlainDate | null>(null);
```

```html
<coar-date-picker
  label="Birth Date"
  [formControl]="birthDate"
/>
```

See [login-form-skeleton.md](../../recipes/login-form-skeleton.md) for a complete forms example.
