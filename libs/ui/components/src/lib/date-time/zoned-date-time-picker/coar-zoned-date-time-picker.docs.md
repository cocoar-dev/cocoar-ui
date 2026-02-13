# Zoned DateTime Picker

A strongly-typed datetime picker that returns `Temporal.ZonedDateTime` with full timezone support. Captures user intent (local time + timezone) and can derive UTC instants.

## Overview

The ZonedDateTimePicker is designed for scenarios where you need to capture **when** something happens **and** **where** it happens. Unlike a simple datetime picker, it preserves both the user's intended local time and the timezone context.

### The Core Principle: Store Intent, Derive Math

```typescript
// A meeting at 2:30 PM Vienna time
const meeting = Temporal.ZonedDateTime.from('2025-06-15T14:30[Europe/Vienna]');

// User's INTENT (source of truth):
meeting.toPlainDateTime().toString();  // "2025-06-15T14:30:00"
meeting.timeZoneId;                    // "Europe/Vienna"

// Derived INSTANT (for queries/ordering):
meeting.toInstant().toString();        // "2025-06-15T12:30:00Z"
```

If you only store the UTC instant and DST rules change, a "10:00 AM meeting" could become 9:00 AM or 11:00 AM. By storing the local time + timezone, you can always recalculate the correct instant.

## The Three Timezones

Understanding these three timezones is critical for using this component correctly:

| Timezone | Description | Example | Persistence |
|----------|-------------|---------|-------------|
| **User TZ** | User's browser/profile timezone from `CoarTimeZoneService` | `Europe/Vienna` | Not stored |
| **Location TZ** | Where the event "lives" - part of the `Temporal.ZonedDateTime` value | `Africa/Accra` | Stored with value |
| **Display TZ** | How times are displayed to the user (a "viewing lens") | `Asia/Tokyo` | Session state only |

### Key Insight

- **Location TZ** = The timezone that is **persisted** with the value
- **Display TZ** = A temporary view that **does not change** the stored value

When you save a meeting in Accra at 14:30, it stays `2025-06-15T14:30:00[Africa/Accra]` regardless of how the user views it.

## Timezone Indicator Icon

The icon in the input field shows which timezone is currently being displayed:

| Icon | State | Meaning | Visual | Click Behavior |
|------|-------|---------|--------|----------------|
| 🏠 **Home** (active) | `Display TZ === User TZ` and `Location TZ !== User TZ` | Time shown in your timezone | Full opacity | Switches to Location TZ |
| 🏠 **Home** (disabled) | `Display TZ === User TZ === Location TZ` | Event is local, no toggle needed | Faded (40% opacity) | None |
| 📍 **Location** | `Display TZ === Location TZ` | Time shown where the event happens | Full opacity | Switches to User TZ |
| 🌍 **World** | `Display TZ !== User TZ && Display TZ !== Location TZ` | Time shown in a third timezone | Full opacity | Switches to User TZ |

### Understanding the Disabled Home Icon

When the Home icon appears **faded** (40% opacity), it indicates that:
- The event's Location TZ equals your User TZ
- There's no toggle possible because both timezones are the same
- The event is effectively "local" to you

This visual cue helps users understand at a glance whether an event is local or remote without needing to open the panel.

### Quick Toggle vs Full Selection

| Action | Where | Result |
|--------|-------|--------|
| Click timezone icon | Input field (panel open or closed) | Toggle between User TZ ↔ Location TZ |
| Change Display Timezone | Panel → "Display Timezone" dropdown | Can select **any** IANA timezone |

**Important:** The icon click only toggles between two options (User/Location). To display in any other timezone (e.g., Tokyo when you're in Vienna and event is in Accra), you must use the Display Timezone picker in the panel.

## Basic Usage

```html
<!-- Minimal - uses timezone from CoarTimeZoneService -->
<coar-zoned-date-time-picker
  [(value)]="meetingDateTime"
  label="Meeting Time"
/>

<!-- With explicit timezone -->
<coar-zoned-date-time-picker
  [(value)]="meetingDateTime"
  [timeZone]="'Europe/Vienna'"
  label="Vienna Meeting"
/>

```

## Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `Temporal.ZonedDateTime \| null` | `null` | The selected datetime value (two-way bindable) |
| `label` | `string` | – | Label text above the input |
| `placeholder` | `string` | – | Placeholder text when empty |
| `timeZone` | `string \| null` | `null` | Default timezone for new values (IANA format) |
| `min` | `Temporal.ZonedDateTime \| null` | `null` | Minimum selectable datetime |
| `max` | `Temporal.ZonedDateTime \| null` | `null` | Maximum selectable datetime |
| `use24Hour` | `boolean \| 'auto'` | `'auto'` | Time format (auto = detect from locale) |
| `minuteStep` | `1 \| 5 \| 10 \| 15` | `5` | Minute increment step |
| `defaultTime` | `CoarTimeValue` | `{ hours: 9, minutes: 0 }` | Default time for new date selections |
| `timezoneFilter` | `string[]` | `[]` | Filter patterns for available timezones |
| `disabled` | `boolean` | `false` | Whether the picker is disabled |
| `readonly` | `boolean` | `false` | Whether the picker is read-only |
| `required` | `boolean` | `false` | Whether a value is required |
| `clearable` | `boolean` | `true` | Whether to show the clear button |
| `size` | `'xs' \| 's' \| 'm' \| 'l'` | `'m'` | Component size |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `valueChange` | `Temporal.ZonedDateTime \| null` | Emitted when the value changes |

## Panel Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │                     │  │  < 2025 >                     │ │
│  │   Scrollable        │  │  Jan Feb Mar Apr              │ │
│  │   Calendar          │  │  May Jun Jul Aug              │ │
│  │                     │  │  Sep Oct Nov Dec              │ │
│  │                     │  ├───────────────────────────────┤ │
│  │                     │  │      ▲ 11 : 30 ▲ PM           │ │
│  │                     │  │      ▼      ▼    ▼            │ │
│  │                     │  ├───────────────────────────────┤ │
│  │                     │  │  Display Timezone             │ │
│  │                     │  │  [Vienna (UTC+1)        ▼]    │ │
│  └─────────────────────┘  └───────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Location: Accra (UTC+0)           06/15/2025 2:30 PM  ⚙️   │
└─────────────────────────────────────────────────────────────┘
```

### Panel Components

- **Left Column:** Scrollable infinite calendar with month virtualization
- **Right Column:** Year stepper, month grid, time picker, display timezone selector
- **Footer:** Location timezone (where the event is stored) with setting button

## Working with Timezones

### Setting the Default Timezone

```html
<!-- Explicit timezone for the value -->
<coar-zoned-date-time-picker
  [timeZone]="'America/New_York'"
  [(value)]="newYorkMeeting"
/>

<!-- Uses timezone from CoarTimeZoneService -->
<coar-zoned-date-time-picker
  [(value)]="localMeeting"
/>
```

### Filtering Available Timezones

```html
<!-- Only European timezones -->
<coar-zoned-date-time-picker
  [timezoneFilter]="['Europe/*']"
  [(value)]="europeanMeeting"
/>

<!-- Specific cities only -->
<coar-zoned-date-time-picker
  [timezoneFilter]="['Europe/Vienna', 'America/New_York', 'Asia/Tokyo']"
  [(value)]="meeting"
/>
```

## Working with Values

### Getting the UTC Instant

```typescript
// In your component
meetingDateTime = signal<Temporal.ZonedDateTime | null>(null);

// Derive the instant from the value when needed
saveToApi() {
  const meeting = this.meetingDateTime();
  if (meeting) {
    const instant = meeting.toInstant();

    // Use for API calls
    const isoString = instant.toString();  // "2025-06-15T12:30:00Z"

    // Use for database storage
    const epochMs = instant.epochMilliseconds;
  }
}
```

### Converting Between Timezones

```typescript
// User selected: 2:30 PM in Vienna
const meeting = this.meetingDateTime();

if (meeting) {
  // Get the same moment in New York
  const inNewYork = meeting.toInstant().toZonedDateTimeISO('America/New_York');
  console.log(inNewYork.toString());  // "2025-06-15T08:30:00-04:00[America/New_York]"

  // Get plain date/time (no timezone)
  const plainDateTime = meeting.toPlainDateTime();
  console.log(plainDateTime.toString());  // "2025-06-15T14:30:00"
}
```

## Accessibility

- Full keyboard navigation support
- ARIA labels for all interactive elements
- Screen reader announcements for timezone changes
- Focus management when opening/closing the panel
- Respects `prefers-reduced-motion` for animations

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Open picker panel |
| `Escape` | Close picker panel |
| `Tab` | Navigate between elements |
| `Arrow Keys` | Navigate calendar dates |

## Best Practices

### DO ✅

- Store the complete `Temporal.ZonedDateTime` value, not just the instant
- Use `.toInstant()` when you need UTC for API calls
- Show timezone indicator for events that may span multiple timezones

### DON'T ❌

- Convert to UTC and discard timezone before storing
- Assume the user's display timezone is the event's timezone
- Use this component if you only need a simple date/time without timezone context

## Related Components

- `coar-date-picker` – Date only (no time, no timezone)
- `coar-date-time-picker` – Date + time (no timezone)
- `coar-time-picker` – Time only

## Migration Notes

If migrating from a simple datetime picker:

1. Values change from `Date` to `Temporal.ZonedDateTime`
2. You'll need to specify or derive the timezone for existing values
3. Use `value.toInstant()` when you need UTC for APIs

```typescript
// Converting from Date to Temporal.ZonedDateTime
const oldDate = new Date('2025-06-15T14:30:00');
const newValue = Temporal.ZonedDateTime.from({
  year: oldDate.getFullYear(),
  month: oldDate.getMonth() + 1,
  day: oldDate.getDate(),
  hour: oldDate.getHours(),
  minute: oldDate.getMinutes(),
  timeZone: 'Europe/Vienna'  // Specify the intended timezone
});
```
