import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarNoteComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-localization-setup-tab',
  standalone: true,
  imports: [CoarCardComponent, CoarCodeBlockComponent, CoarNoteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './setup.tab.html',
  styleUrl: './setup.tab.css',
})
export class LocalizationSetupTab {
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

  protected readonly fileFallbackExample = `setLanguage('de')
  → loads /i18n/de.json

setLanguage('de-AT')
  → loads /i18n/de.json
  → tries /i18n/de-AT.json (merged)

setLanguage('en-GB')
  → loads /i18n/en.json
  → tries /i18n/en-GB.json (merged)

File structure:
/i18n/
  en.json      ← base English
  en-GB.json   ← optional overrides
  de.json      ← base German
  de-AT.json   ← optional overrides

Same pattern for /locales/ (L10n).`;

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
}
