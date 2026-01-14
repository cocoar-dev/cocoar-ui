# Formatting Pipes

Reactive formatting pipes for dates, numbers, currency, and percentages.

All pipes automatically update when the language changes via [CoarLocalizationService](../locale/README.md).

## Available Pipes

### CoarDatePipe

Formats dates with locale-specific patterns.

```html
<!-- Short format -->
{{ now | coarDate:'short' }}
<!-- Output (en): 1/13/26, 9:41 PM -->
<!-- Output (de): 13.01.26, 21:41 -->

<!-- Full format -->
{{ now | coarDate:'full' }}
<!-- Output (en): Monday, January 13, 2026 at 9:41:23 PM GMT -->
<!-- Output (de): Montag, 13. Januar 2026 um 21:41:23 GMT -->

<!-- Custom pattern -->
{{ now | coarDate:'EEEE, MMMM d, y' }}
<!-- Output (en): Monday, January 13, 2026 -->
<!-- Output (de): Montag, 13. Januar 2026 -->
```

**See:** [Angular DatePipe formats](https://angular.dev/api/common/DatePipe)

---

### CoarNumberPipe

Formats numbers with locale-specific separators.

```html
<!-- Default (max 3 decimals) -->
{{ 1234567.89 | coarNumber }}
<!-- Output (en): 1,234,567.89 -->
<!-- Output (de): 1.234.567,89 -->
<!-- Output (fr): 1 234 567,89 -->

<!-- Fixed 2 decimals -->
{{ 1234.567 | coarNumber:'1.2-2' }}
<!-- Output (en): 1,234.57 -->
<!-- Output (de): 1.234,57 -->

<!-- No decimals -->
{{ 1234.567 | coarNumber:'1.0-0' }}
<!-- Output: 1,235 (all locales use their grouping) -->
```

**Format:** `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`

---

### CoarCurrencyPipe

Formats currency with locale-specific rules.

```html
<!-- USD with default symbol -->
{{ 1234.56 | coarCurrency:'USD' }}
<!-- Output (en): $1,234.56 -->
<!-- Output (de): 1.234,56 $ -->

<!-- EUR with symbol -->
{{ 1234.56 | coarCurrency:'EUR' }}
<!-- Output (en): €1,234.56 -->
<!-- Output (de): 1.234,56 € -->

<!-- Currency code instead of symbol -->
{{ 1234.56 | coarCurrency:'USD':'code' }}
<!-- Output (en): USD 1,234.56 -->
<!-- Output (de): 1.234,56 USD -->

<!-- Narrow symbol (preferred) -->
{{ 1234.56 | coarCurrency:'EUR':'symbol-narrow' }}
<!-- Output: €1,234.56 (compact symbol) -->
```

**Display options:**
- `'symbol'` - Currency symbol (€, $)
- `'symbol-narrow'` - Narrow symbol (€, $) - preferred
- `'code'` - Currency code (USD, EUR)
- Custom string - Your custom label

---

### CoarPercentPipe

Formats percentages (multiplies by 100 automatically).

```html
<!-- Default (max 3 decimals) -->
{{ 0.25 | coarPercent }}
<!-- Output: 25% -->

<!-- Fixed 2 decimals -->
{{ 0.2546 | coarPercent:'1.2-2' }}
<!-- Output (en): 25.46% -->
<!-- Output (de): 25,46 % -->

<!-- Large percentage -->
{{ 12.34567 | coarPercent }}
<!-- Output (en): 1,234.567% -->
<!-- Output (de): 1.234,567 % -->
```

**Important:** The pipe multiplies by 100:
- `0.25` → `25%`
- `1.5` → `150%`
- `0.0042` → `0.42%`

---

## How It Works

All pipes use Angular's built-in formatters (DatePipe, DecimalPipe, etc.) but:
1. Get the current language from **CoarLocalizationService**
2. Pass it to Angular's formatter
3. Set `pure: false` so they update when language changes

```typescript
@Pipe({
  name: 'coarDate',
  standalone: true,
  pure: false, // Required for reactivity
})
export class CoarDatePipe implements PipeTransform {
  private readonly locale = inject(CoarLocalizationService);

  transform(value: Date | string | number, format?: string): string | null {
    const currentLocale = this.locale.getCurrentLanguage();
    const datePipe = new DatePipe(currentLocale);
    return datePipe.transform(value, format);
  }
}
```

---

## Setup

### 1. Configure Localization

```ts
import { provideHttpClient } from '@angular/common/http';
import { provideCoarLocalization } from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideCoarLocalization({ defaultLanguage: 'en' }),
  ],
};
```

### 2. Register Angular Locale Data

**⚠️ IMPORTANT:** You must register Angular locale data for any non-English language you want to use:

```typescript
// app.config.ts
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';

// Register locale data BEFORE app initialization
registerLocaleData(localeDe);
registerLocaleData(localeFr);
```

Without this, you'll get: `Missing locale data for the locale "de"`

### 2. Provide CoarLocale

```typescript
// app.config.ts
import { provideCoarLocalization } from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCoarLocalization({
      defaultLanguage: 'en',
      availableLanguages: ['en', 'de', 'fr'],
    }),
  ],
};
```

### 3. Import Pipes

```typescript
// Standalone component
import { CoarDatePipe, CoarNumberPipe, CoarCurrencyPipe } from '@cocoar/localization';

@Component({
  selector: 'my-component',
  standalone: true,
  imports: [CoarDatePipe, CoarNumberPipe, CoarCurrencyPipe],
  template: `
    <p>Date: {{ now | coarDate:'fullDate' }}</p>
    <p>Price: {{ price | coarCurrency:'EUR' }}</p>
  `,
})
export class MyComponent {
  now = new Date();
  price = 1234.56;
}
```

### 4. Change Language

All pipes update automatically when you change the language:

```typescript
import { inject } from '@angular/core';
import { CoarLocalizationService } from '@cocoar/localization';

export class MyComponent {
  private readonly locale = inject(CoarLocalizationService);

  switchToGerman(): void {
    this.locale.setLanguage('de');
    // All coarDate, coarNumber, coarCurrency pipes update automatically
  }
}
```

---

## Combined Example

```typescript
@Component({
  selector: 'invoice',
  standalone: true,
  imports: [CoarDatePipe, CoarNumberPipe, CoarCurrencyPipe, CoarPercentPipe],
  template: `
    <div class="invoice">
      <h1>Invoice</h1>
      <p><strong>Date:</strong> {{ invoiceDate | coarDate:'fullDate' }}</p>
      <p><strong>Items:</strong> {{ itemCount | coarNumber }}</p>
      <p><strong>Subtotal:</strong> {{ subtotal | coarCurrency:'EUR' }}</p>
      <p><strong>Tax ({{ taxRate | coarPercent }}):</strong> {{ taxAmount | coarCurrency:'EUR' }}</p>
      <p><strong>Total:</strong> {{ total | coarCurrency:'EUR' }}</p>
    </div>
  `,
})
export class InvoiceComponent {
  invoiceDate = new Date();
  itemCount = 42;
  subtotal = 1289.99;
  taxRate = 0.19; // 19%
  taxAmount = 245.10;
  total = 1535.09;
}
```

**Output (English):**
```
Invoice
Date: Monday, January 13, 2026
Items: 42
Subtotal: €1,289.99
Tax (19%): €245.10
Total: €1,535.09
```

**Output (German):**
```
Rechnung
Date: Montag, 13. Januar 2026
Items: 42
Subtotal: 1.289,99 €
Tax (19 %): 245,10 €
Total: 1.535,09 €
```

---

## Best Practices

### ✅ DO

- Import only the pipes you need (tree-shaking)
- Use pipes in templates (automatic updates)
- Combine with i18n for labels:
  ```html
  <p>{{ 'invoice.date' | coarI18n }}: {{ date | coarDate:'full' }}</p>
  ```
- Use `'symbol-narrow'` for currencies (more compact)
- Specify decimal places for financial data (`'1.2-2'`)

### ❌ DON'T

- Don't use Angular's built-in pipes directly (DatePipe, DecimalPipe)
  - They won't update when language changes
- Don't format in TypeScript unless necessary
  - Pipes are more efficient and reactive
- Don't forget `pure: false` if you create custom formatting pipes

---

## Performance

All pipes set `pure: false` to react to language changes. This is required but has a performance cost:

- **Pure pipes** (default): Only re-run when input changes
- **Impure pipes** (`pure: false`): Re-run on every change detection cycle

**Impact:** Minimal for typical usage (<100 pipes per page). If you have thousands of formatted values:
1. Consider formatting in TypeScript once per language change
2. Cache formatted values in a computed signal
3. Use virtual scrolling for large lists

---

## Related

- [CoarLocalizationService](../locale/README.md) - Central language management
- [CoarI18nPipe](../i18n/coar-i18n.pipe.md) - Translation pipe
- [Angular Pipes](https://angular.dev/guide/pipes) - Official pipe documentation

---

**Package:** `@cocoar/localization`
**Version:** 1.0.0
**License:** MIT
