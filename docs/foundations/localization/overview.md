# Localization Service

The Cocoar Localization Service provides **locale-aware formatting rules** for:

- Numbers (decimal + thousands separators)
- Dates (supported date patterns + first day of week)

It is intentionally **not** a translation/i18n solution. It answers “how to format” rather than “what text to show”.

## Where it’s used

Several UI components consume these formatting rules, for example:

- **Date Picker** uses it to derive a default `dateFormatConfig` when none is provided.
- **Number Input** uses it to derive a default `numberFormat` (decimal/thousand separators) when none is provided.

In both cases, explicit component inputs should be preferred when the component instance needs a specific format.

## Basic idea

- The service is accessed through the DI token `COAR_LOCALE_SERVICE`.
- A default implementation (`CoarLocaleService`) is provided automatically.
- The default implementation derives formatting rules via browser `Intl.*` APIs.

## Choosing between “global default” and “per component”

### Global default

If your application has a single, stable locale (or a user preference that is known early), you can set the default locale once:

```ts
import { provideAppInitializer, inject } from '@angular/core';
import { COAR_LOCALE_SERVICE } from '@cocoar/ui-components';

export const appConfig = {
  providers: [
    provideAppInitializer(() => {
      inject(COAR_LOCALE_SERVICE).setDefaultLocale('de-AT');
    }),
  ],
};
```

### Per component

If different screens or individual inputs require different formats, override directly on the component:

```html
<!-- Number Input: explicit number format -->
<coar-number-input [numberFormat]="{ decimal: ',', thousand: '.' }" />

<!-- Date Picker: explicit date format config -->
<coar-date-picker [dateFormatConfig]="{ pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 }" />
```

## Custom locale IDs

If you need a format that does not map cleanly to a standard locale, you can register an app-specific locale ID:

```ts
import { inject } from '@angular/core';
import { COAR_LOCALE_SERVICE } from '@cocoar/ui-components';

const localeService = inject(COAR_LOCALE_SERVICE);

localeService.registerLocale('finance-eu', {
  number: { decimal: ',', thousand: ' ' },
  date: { pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 },
});

localeService.setDefaultLocale('finance-eu');
```

## When to provide your own implementation

Provide a custom `ICoarLocaleService` when:

- Your app already has a locale/format policy (tenant/user settings).
- You want full control over defaults or persistence.
- You need deterministic rules that do not depend on the browser’s `Intl` behavior.
