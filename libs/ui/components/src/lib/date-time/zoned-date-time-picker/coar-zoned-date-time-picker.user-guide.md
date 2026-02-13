# Zoned Date Time Picker - User Guide

The Zoned Date Time Picker lets you select a date and time while keeping track of **where** the event takes place. This is especially useful for scheduling meetings or events across different time zones.

---

## The Input Field

When closed, the picker shows a compact input field:

```
┌─────────────────────────────────────────────────────┐
│  ✕  │  01/07/2026 9:00 AM  │  Vienna (UTC+1)  │ 🏠 │ 📅 │
└─────────────────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| **✕ (Clear)** | Removes the selected date and time |
| **Date & Time** | The currently selected date and time |
| **Timezone Label** | Shows which timezone the displayed time is in (e.g., "Vienna (UTC+1)") |
| **Timezone Icon** | Shows whether you're viewing in your local time or the event's location time |
| **📅 Calendar** | Opens the full picker panel |

---

## Timezone Icons Explained

The timezone icon tells you at a glance which timezone the displayed time is in:

| Icon | Name | Meaning |
|------|------|---------|
| 🏠 | **Home** | Time is shown in **your timezone** (your local time) |
| 📍 | **Location** | Time is shown in the **event's timezone** (where the event takes place) |
| 🌍 | **World** | Time is shown in a **different timezone** (neither yours nor the event's) |

### Clicking the Timezone Icon

When you click the timezone icon, it toggles between:
- **Your timezone** (Home 🏠)
- **The event's timezone** (Location 📍)

This lets you quickly see "What time is this for me?" vs. "What time is this where the event happens?"

### Faded Home Icon

If the Home icon appears **faded** (semi-transparent), it means:
- The event is in your timezone
- There's nothing to toggle — your time and the event's time are the same

---

## The Picker Panel

Click the calendar icon to open the full picker panel:

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │                     │  │  < 2025 >                     │ │
│  │   Scrollable        │  │  Jan Feb Mar Apr              │ │
│  │   Calendar          │  │  May Jun Jul Aug              │ │
│  │                     │  │  Sep Oct Nov Dec              │ │
│  │                     │  ├───────────────────────────────┤ │
│  │                     │  │      ▲ 11 : 30 ▲ AM           │ │
│  │                     │  │      ▼      ▼    ▼            │ │
│  │                     │  ├───────────────────────────────┤ │
│  │                     │  │  Display Timezone             │ │
│  │                     │  │  [Vienna (UTC+1)        ▼]    │ │
│  └─────────────────────┘  └───────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📍 Accra (UTC+0)                    06/15/2025 2:30 PM  ⚙️ │
└─────────────────────────────────────────────────────────────┘
```

### Left Side: Calendar

- **Scroll** up or down to navigate through months
- **Click** a date to select it
- A small **arrow button** appears to jump back to today's month if you've scrolled far away

### Right Side: Controls

| Section | What it does |
|---------|--------------|
| **Year Stepper** | Use `<` and `>` to change the year |
| **Month Grid** | Click a month to jump directly to it |
| **Time Picker** | Adjust hours and minutes (use arrows or type directly) |
| **Display Timezone** | Change which timezone you want to **view** the time in |

### Footer: Event Location

The footer shows the **actual timezone where the event is stored**:

```
📍 Accra (UTC+0)                    06/15/2025 2:30 PM  ⚙️
```

| Element | Description |
|---------|-------------|
| **📍 Location icon** | Indicates this is the event's "home" timezone |
| **Timezone name** | Where the event takes place (e.g., "Accra (UTC+0)") |
| **Date/Time** | The event time in its location timezone |
| **⚙️ Settings** | Click to change the event's location timezone |

---

## Understanding the Two Timezones

This picker handles two important concepts:

### 1. Event Location Timezone (📍)
**Where the event physically happens.**

Example: A conference in New York starts at 9:00 AM. The location timezone is "America/New_York". No matter where you are in the world, the conference starts at 9:00 AM New York time.

### 2. Display Timezone (🏠 or 🌍)
**How you choose to view the time.**

Example: You're in Vienna and want to join that New York conference. You can view the time as:
- 9:00 AM (New York time — Location 📍)
- 3:00 PM (Vienna time — Home 🏠)

Both are correct — they represent the same moment, just displayed differently.

---

## Common Tasks

### Selecting a Date and Time

1. Click the **calendar icon** to open the picker
2. **Scroll** or use the month grid to find your date
3. **Click** the date to select it
4. Adjust the **time** using the time picker
5. Click outside the panel to close it

### Changing the Event's Location

1. Open the picker panel
2. Click the **⚙️ settings icon** in the footer
3. Search for and select the new timezone
4. The event is now stored in the new location

### Viewing in a Different Timezone

**Quick toggle:** Click the timezone icon (🏠/📍) in the input field to switch between your time and the event's time.

**Any timezone:** Open the panel and use the "Display Timezone" dropdown to select any timezone in the world.

### Clearing the Selection

Click the **✕** button on the left side of the input field to remove the date and time.

---

## Tips

- **Hover** over the timezone icon for a tooltip showing both timezones
- The **timezone label** on the input always tells you which timezone is currently displayed
- When scheduling with people in other timezones, use the **Display Timezone** feature to see what time it is for them
- The **faded home icon** means the event is local to you — no timezone confusion!

---

## Example: Scheduling an International Meeting

**Scenario:** You're in Vienna and need to schedule a call with a colleague in Tokyo.

1. Open the picker and select the date
2. The time shows in your timezone (Vienna) by default
3. Set the time to when you're available (e.g., 4:00 PM Vienna)
4. Click the **Display Timezone** dropdown and select "Asia/Tokyo"
5. You'll see it's 12:00 AM (midnight) in Tokyo — probably not ideal!
6. Adjust the time until it works for both parties
7. The event is saved with your local time, but you've verified it works across timezones
