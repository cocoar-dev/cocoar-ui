# Timezone Support in Cocoar Localization

**Package:** `@cocoar/localization`

## Overview

The Cocoar Localization system provides a pluggable timezone resolution architecture that allows applications to define custom timezone sources while maintaining a guaranteed browser-based fallback.

The system uses a **reactive provider hierarchy** where timezone changes propagate automatically to all consumers (components, services, pipes) through RxJS observables and Angular signals.

## ⚠️ Critical: Timezone ≠ Language ≠ Locale

**Timezone, language, and locale are three independent concerns:**

| Concern | What It Controls | Example |
|---------|------------------|---------|
| **i18n (Language)** | Text translation | "Hello" vs "Bonjour" vs "こんにちは" |
| **L10n (Locale)** | Number/date formatting | `1,000.00` (US) vs `1.000,00` (DE) vs `1 000,00` (FR) |
| **Timezone** | When events happen in time | `America/New_York` vs `Europe/Paris` vs `Asia/Tokyo` |

**They are NOT coupled:**

```typescript
// ✅ Valid combination: French-speaking user in New York
{
  language: 'fr',           // i18n: Show French text
  locale: 'fr-FR',          // L10n: Format dates/numbers French style
  timeZone: 'America/New_York'  // Timezone: Show times in Eastern Time
}

// ✅ Valid combination: English-speaking user in Tokyo
{
  language: 'en',           // i18n: Show English text
  locale: 'en-US',          // L10n: Format dates/numbers US style
  timeZone: 'Asia/Tokyo'    // Timezone: Show times in Japan Standard Time
}

// ✅ Valid combination: Global team working in UTC
{
  language: 'en',           // i18n: English text
  locale: 'en-US',          // L10n: US formatting
  timeZone: 'UTC'           // Timezone: Coordinated Universal Time (no DST)
}
```

**Why this matters for DateTimePicker:**

- A French user living in New York should see:
  - ✅ French button labels (i18n)
  - ✅ Date format: `22/01/2026` (L10n: French `DD/MM/YYYY`)
  - ✅ Timezone context: `America/New_York` (Eastern Time, UTC-5)

- An American traveling in Paris should see:
  - ✅ English button labels (i18n)
  - ✅ Date format: `1/22/2026` (L10n: US `M/D/YYYY`)
  - ✅ Timezone context: `Europe/Paris` (Central European Time, UTC+1)

**Don't assume timezone from language!**
Inferring timezone from language (`fr` → assume Paris) is wrong. Use browser detection or explicit user preference.

## Architecture

### Provider Chain

Timezone resolution follows a priority-based chain:

```
Custom Providers (config array, in order) → Browser Provider (Intl API) → UTC (safety net)
```

**Resolution logic:** First non-null value wins.

### Key Components

1. **`CoarTimeZoneProvider`** (interface)
   Contract for custom timezone sources

2. **`BrowserTimeZoneProvider`** (built-in, always present)
   Uses `Intl.DateTimeFormat().resolvedOptions().timeZone` to detect OS timezone

3. **`CoarTimeZoneService`** (singleton)
   Orchestrates provider chain, exposes reactive timezone stream

4. **`COAR_TIMEZONE_PROVIDERS`** (injection token)
   Multi-provider token for registering custom sources

### Reactive Resolution

The service uses `combineLatest` to merge all provider streams:

```typescript
combineLatest([customProvider1.timeZone$, customProvider2.timeZone$, browserProvider.timeZone$])
  .pipe(
    map(timeZones => timeZones.find(tz => tz !== null) ?? 'UTC'),
    distinctUntilChanged()
  )
```

**Why reactive?**
If a user changes their profile timezone while a DateTimePicker is open, the picker must update automatically. A one-time snapshot would miss this change.

**Why `distinctUntilChanged()`?**
Prevents unnecessary re-renders when multiple providers emit but the resolved value stays the same (e.g., profile emits `null`, browser still wins with same value).

## Basic Usage

### Default Setup (Browser Timezone Only)

```typescript
import { provideCoarLocalization } from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCoarLocalization({
      defaultLanguage: 'en'
      // No timeZoneProviders → uses browser timezone only
    })
  ]
};
```

### Consuming in Components

```typescript
import { Component, inject } from '@angular/core';
import { CoarTimeZoneService } from '@cocoar/localization';

@Component({
  selector: 'app-my-component',
  template: `
    <p>Current timezone: {{ currentTimeZone() }}</p>
    <p>Browser detected: {{ timeZoneService.currentTimeZone() }}</p>
  `
})
export class MyComponent {
  private timeZoneService = inject(CoarTimeZoneService);

  // Signal (reactive, updates automatically)
  currentTimeZone = this.timeZoneService.currentTimeZone;

  // Observable stream (for pipe composition)
  timeZone$ = this.timeZoneService.timeZone$;
}
```

## Custom Providers

### Creating a Custom Provider

Custom providers implement the `CoarTimeZoneProvider` interface:

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CoarTimeZoneProvider } from '@cocoar/localization';

@Injectable({ providedIn: 'root' })
export class ProfileTimeZoneProvider implements CoarTimeZoneProvider {
  private profileService = inject(ProfileService);

  // Reactive stream from user profile
  readonly timeZone$: Observable<string | null> = this.profileService.settings$.pipe(
    map(settings => settings.timeZone ?? null)
  );
}
```

**Key requirements:**

- Must return `Observable<string | null>`
- Emit `string` (IANA timezone ID) when provider has a value
- Emit `null` when provider has no preference (falls through to next provider)
- Must be reactive (emit new values when source changes)

### Registering Custom Providers

Register providers in the config array:

```typescript
import { provideCoarLocalization } from '@cocoar/localization';
import { ProfileTimeZoneProvider } from './profile-timezone.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCoarLocalization({
      defaultLanguage: 'en',
      timeZoneProviders: [
        inject(ProfileTimeZoneProvider)  // Highest priority
      ]
    })
  ]
};
```

**Resolution order example:**

```typescript
provideCoarLocalization({
  defaultLanguage: 'en',
  timeZoneProviders: [
    inject(OrganizationTimeZoneProvider),  // 1st priority
    inject(ProfileTimeZoneProvider),       // 2nd priority
    inject(GeolocationTimeZoneProvider)    // 3rd priority
    // BrowserTimeZoneProvider             // 4th priority (auto-added)
    // UTC                                 // Safety net (auto-added)
  ]
})
```

If `OrganizationTimeZoneProvider` emits `null`, resolution falls through to `ProfileTimeZoneProvider`, etc.

## Provider Examples

### Organization Timezone Provider

```typescript
/**
 * Uses organization's default timezone for business hours context.
 * Example: Company HQ is in New York, all deadlines shown in ET.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationTimeZoneProvider implements CoarTimeZoneProvider {
  private orgService = inject(OrganizationService);

  readonly timeZone$: Observable<string | null> = this.orgService.currentOrganization$.pipe(
    map(org => org?.defaultTimeZone ?? null)
  );
}
```

### Geolocation Timezone Provider

```typescript
/**
 * Detects timezone from user's GPS coordinates.
 * Useful for mobile apps where OS timezone may be stale.
 */
@Injectable({ providedIn: 'root' })
export class GeolocationTimeZoneProvider implements CoarTimeZoneProvider {
  private geoService = inject(GeolocationService);

  readonly timeZone$: Observable<string | null> = this.geoService.coordinates$.pipe(
    switchMap(coords => this.fetchTimeZoneFromCoords(coords)),
    map(tz => tz ?? null),
    catchError(() => of(null)) // Fall through on error
  );

  private fetchTimeZoneFromCoords(coords: Coordinates): Observable<string> {
    // Use API like Google Maps Time Zone API
    return this.http.get<{timeZoneId: string}>(`/api/timezone?lat=${coords.latitude}&lng=${coords.longitude}`)
      .pipe(map(result => result.timeZoneId));
  }
}
```

### Session Storage Provider

```typescript
/**
 * Allows user to manually override timezone per session.
 * Example: "View deadlines in Tokyo time" temporary switcher.
 */
@Injectable({ providedIn: 'root' })
export class SessionTimeZoneProvider implements CoarTimeZoneProvider {
  private storageKey = 'user-selected-timezone';
  private timeZoneSubject = new BehaviorSubject<string | null>(
    sessionStorage.getItem(this.storageKey)
  );

  readonly timeZone$ = this.timeZoneSubject.asObservable();

  setTimeZone(timeZone: string | null): void {
    if (timeZone) {
      sessionStorage.setItem(this.storageKey, timeZone);
    } else {
      sessionStorage.removeItem(this.storageKey);
    }
    this.timeZoneSubject.next(timeZone);
  }

  clearOverride(): void {
    this.setTimeZone(null);
  }
}
```

## IANA Timezone Identifiers

All providers must return valid IANA timezone identifiers:

**Valid examples:**
- `"America/New_York"`
- `"Europe/Paris"`
- `"Asia/Tokyo"`
- `"UTC"`

**Invalid examples:**
- ❌ `"EST"` (abbreviation, ambiguous)
- ❌ `"GMT-5"` (offset, loses DST context)
- ❌ `"Eastern Time"` (not standardized)

Use the [IANA Time Zone Database](https://www.iana.org/time-zones) for reference.

## Technical Details

### Browser Provider Behavior

- **One-time snapshot:** Browser timezone is detected once at app startup
- **No live updates:** If user changes OS timezone while app runs, provider won't emit new value (browser limitation)
- **Fallback:** Returns `"UTC"` if Intl API fails (shouldn't happen in modern browsers)

### UTC Safety Net

If all providers return `null` (shouldn't happen because browser provider always returns a value), the service falls back to `"UTC"`:

```typescript
map(timeZones => timeZones.find(tz => tz !== null) ?? 'UTC')
```

This ensures `CoarTimeZoneService.currentTimeZone` is always non-null.

### Performance Considerations

- **`distinctUntilChanged()`** prevents unnecessary re-renders when providers emit but resolved value stays same
- **Lazy evaluation:** Providers only activate when service is first injected
- **Signal-based:** Components can use `currentTimeZone()` signal for template change detection optimization

## Design Principles

### Why Not Multi-Provider Registration Order?

Multi-provider order is fragile across module imports. Config array gives explicit, visible priority.

### Why Browser Provider Always Present?

Guarantees a sensible fallback. Apps can't accidentally ship with no timezone source.

### Why Observable Instead of Signal?

Providers may need RxJS operators (`switchMap`, `debounceTime`, etc.) for complex sources (HTTP, geolocation). Service converts to signal for consumer convenience.

## Related Documentation

- **[ARCHITECTURE.md](../../ARCHITECTURE.md)** — Framework purity, design patterns
- **[Localization Overview](../foundations/localization/overview.md)** — Language management and L10n system

## Future Enhancements

- [ ] Timezone validation helper (check if IANA ID is valid)
- [ ] Timezone switcher UI component
- [ ] Integration with DateTimePicker (display + DST handling)
- [ ] Common provider library (profile, org, geolocation)
- [ ] SSR support (hydration of server-detected timezone)

