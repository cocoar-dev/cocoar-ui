import { Component, inject } from '@angular/core';
import { CoarButtonComponent, CoarCodeBlockComponent, CoarDividerComponent } from '@cocoar/ui-components';
import {
  CoarCurrencyPipe,
  CoarDatePipe,
  CoarI18nPipe,
  CoarLocalizationService,
  CoarNumberPipe,
  CoarPercentPipe,
  CoarTranslationLoader,
  CoarTranslationStore,
} from '@cocoar/localization';
import { firstValueFrom } from 'rxjs';

/**
 * Comprehensive showcase page for localization.
 *
 * Covers:
 * - Locale formatting (L10n): Date, number, currency, percent formatting
 * - Translations (i18n): Translation pipes
 */
@Component({
  selector: 'app-localization-page',
  standalone: true,
  imports: [
    CoarButtonComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarDatePipe,
    CoarNumberPipe,
    CoarCurrencyPipe,
    CoarPercentPipe,
    CoarI18nPipe,
  ],
  templateUrl: './localization.page.html',
  styleUrl: './localization.page.css',
})
export class LocalizationPage {
  protected readonly locale = inject(CoarLocalizationService);
  private readonly store = inject(CoarTranslationStore);
  private readonly loader = inject(CoarTranslationLoader);

  // Sample data for formatting examples
  protected readonly now = new Date();
  protected readonly tomorrow = new Date(Date.now() + 86400000);
  protected readonly yesterday = new Date(Date.now() - 86400000);
  protected readonly largeNumber = 1234567.89;
  protected readonly decimal = 1234.567;
  protected readonly price = 1234.56;
  protected readonly percent = 0.25;
  protected readonly itemCount = 42;
  protected readonly subtotal = 1289.99;
  protected readonly tax = 0.19;
  protected readonly total = 1535.09;

  async toggleLang(): Promise<void> {
    const current = this.locale.languageState.value;
    const next = current === 'en' ? 'de' : 'en';

    // Preload translations before switching (prevents showing keys)
    if (!this.store.hasLanguage(next)) {
      const translations = await firstValueFrom(this.loader.loadTranslations(next));
      this.store.setTranslations(next, translations);
    }

    this.locale.setLanguage(next);
  }

  protected readonly setupExample = `import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  provideCoarLocalization,
  provideCoarL10nHttpSource,
  provideCoarI18nHttpSource,
} from '@cocoar/localization';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),

    // Core localization system (language + L10n + i18n)
    provideCoarLocalization({
      defaultLanguage: 'en',
    }),

    // Optional: L10n HTTP source for formatting overrides (Intl is auto-included)
    provideCoarL10nHttpSource(),  // Defaults to /locales/{lang}.json

    // Optional: i18n HTTP source for translations
    provideCoarI18nHttpSource(),  // Defaults to /i18n/{lang}.json
  ],
};`;

  protected readonly customHttpSourceExample = `// Custom L10n URL pattern with authentication
provideCoarL10nHttpSource({
  url: (lang) => \`/api/config/intl-\${lang}.json\`,
  headers: {
    'Authorization': 'Bearer ' + getToken()
  }
})

// Custom i18n URL pattern with authentication
provideCoarI18nHttpSource({
  url: (lang) => \`/api/translations/\${lang}.json\`,
  headers: {
    'Authorization': 'Bearer ' + getToken()
  }
})`;

  protected readonly formattingPipeExamples = `<!-- Date formatting -->
{{ today | coarDate }}                          <!-- 01/14/2026 (en) → 14.01.2026 (de) -->

<!-- Number formatting -->
{{ 1234567.89 | coarNumber }}                   <!-- 1,234,567.89 (en) → 1.234.567,89 (de) -->
{{ 1234.5 | coarNumber:undefined:2 }}           <!-- Control decimal places -->

<!-- Currency formatting -->
{{ 1234.56 | coarCurrency }}                    <!-- $1,234.56 (en) → 1.234,56 € (de) -->
{{ 1234.56 | coarCurrency:undefined:'EUR' }}    <!-- Explicit currency code -->

<!-- Percent formatting -->
{{ 0.25 | coarPercent }}                        <!-- 25% (en) → 25 % (de) -->
{{ 0.2546 | coarPercent:undefined:2 }}          <!-- 25.46% (2 decimals) -->`;

  protected readonly i18nPipeExamples = `<!-- Simple translation -->
{{ 'app.button.save' | coarI18n }}

<!-- With fallback -->
{{ 'app.button.save' | coarI18n:'Save' }}

<!-- With parameters -->
{{ 'app.items.count' | coarI18n:{ count: items.length } }}
<!-- en.json: "You have {count} items" -->
<!-- de.json: "Sie haben {count} Elemente" -->

<!-- Parameters + fallback -->
{{ 'app.greeting' | coarI18n:{ name: userName }:'Hello {name}!' }}`;

  protected readonly localeDataExample = `// /locales/de.json (HTTP source override)
{
  "code": "de",
  "date": {
    "pattern": "dd.mm.yyyy",
    "firstDayOfWeek": 1  // Monday
  },
  "number": {
    "decimal": ",",
    "group": ".",
    "groupingPattern": [3, 3, 3]
  },
  "currency": {
    "position": "after",
    "spacing": true,
    "decimals": 2,
    "symbols": {
      "USD": "$",
      "EUR": "€"
    }
  },
  "percent": {
    "symbol": "%",
    "spacing": true,
    "decimals": 0
  }
}`;

  protected readonly translationsExample = `// /i18n/en.json (i18n translations)
{
  "app": {
    "button": {
      "save": "Save",
      "cancel": "Cancel"
    },
    "items": {
      "count": "You have {count} items"
    },
    "greeting": "Hello {name}!"
  }
}

// /i18n/de.json
{
  "app": {
    "button": {
      "save": "Speichern",
      "cancel": "Abbrechen"
    },
    "items": {
      "count": "Sie haben {count} Elemente"
    },
    "greeting": "Hallo {name}!"
  }
}`;
}
