import { Component } from '@angular/core';

import {
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-localization',
  standalone: true,
  imports: [
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarDividerComponent,
    CoarCodeBlockComponent
],
  templateUrl: './localization.page.html',
  styleUrl: './localization.page.css',
})
export class LocalizationPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/foundations/localization/overview.md';
  protected readonly apiPath = '/docs/foundations/localization/api.md';

  codeExamples = {
    provideDefault: `// The locale service is already provided by default via the injection token.
// You usually don't need to configure anything.

import { COAR_LOCALE_SERVICE, type ICoarLocaleService } from '@cocoar/ui-components';
import { inject } from '@angular/core';

export class MyComponent {
  private readonly localeService = inject(COAR_LOCALE_SERVICE, { optional: true });

  constructor() {
    const locale = this.localeService?.getDefaultLocale() ?? 'en-US';
    const numberFormat = this.localeService?.getNumberFormat(locale);
    const dateFormat = this.localeService?.getDateFormat(locale);

    // Use these rules to configure components or formatting.
  }
}`,

    setDefaultLocale: `// Option A: Set the default locale once at app startup
// (example uses provideAppInitializer, but any early startup hook works).

import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { COAR_LOCALE_SERVICE } from '@cocoar/ui-components';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const localeService = inject(COAR_LOCALE_SERVICE);
      localeService.setDefaultLocale('de-AT');
    }),
  ],
};`,

    provideCustomImplementation: `// Option B: Provide your own implementation (e.g., backed by your app's preferences)

import { COAR_LOCALE_SERVICE, type ICoarLocaleService } from '@cocoar/ui-components';

class MyLocaleService implements ICoarLocaleService {
  getNumberFormat(locale?: string) {
    return { decimal: ',', thousand: '.' };
  }

  getDateFormat(locale?: string) {
    return { pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 };
  }

  getDefaultLocale() {
    return 'de-AT';
  }

  setDefaultLocale(locale: string) {
    // Persist to user preferences, etc.
  }

  registerLocale(id: string, config: any) {
    // Optional: implement if you need custom locale registration
  }
}

export const appConfig = {
  providers: [{ provide: COAR_LOCALE_SERVICE, useClass: MyLocaleService }],
};`,

    registerLocale: `// Option C: Register a custom locale ID (partial overrides)

import { COAR_LOCALE_SERVICE } from '@cocoar/ui-components';
import { inject } from '@angular/core';

export class AppStartup {
  private readonly localeService = inject(COAR_LOCALE_SERVICE);

  init(): void {
    this.localeService.registerLocale('finance-eu', {
      number: { decimal: ',', thousand: ' ' },
      date: { pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 },
    });

    this.localeService.setDefaultLocale('finance-eu');
  }
}`,

    componentUsage: `// Components consume locale rules in a predictable way:
// - If you pass explicit format inputs, they win.
// - Otherwise, the component can derive defaults from COAR_LOCALE_SERVICE.

// Number Input
<coar-number-input
  label="Price"
  [decimals]="2"
  [numberFormat]="{ decimal: ',', thousand: '.' }"
/>

// Date Picker
<coar-date-picker
  label="Birthday"
  [dateFormatConfig]="{ pattern: 'dd.mm.yyyy', firstDayOfWeek: 1 }"
/>`,
  };
}
