import { Component } from '@angular/core';

import {
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-i18n',
  standalone: true,
  imports: [CoarTabGroupComponent, CoarTabComponent, CoarDividerComponent, CoarCodeBlockComponent],
  templateUrl: './i18n.page.html',
  styleUrl: './i18n.page.css',
})
export class I18nPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/foundations/i18n/overview.md';
  protected readonly apiPath = '/docs/foundations/i18n/api.md';

  codeExamples = {
    translocoSetup: `import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { CoarI18n } from '@cocoar/i18n';
import { provideTransloco } from '@jsverse/transloco';
import { provideCoarI18nUsingTransloco } from '@cocoar/i18n-transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'de'],
        defaultLang: 'en',
      },
      loader: YourTranslocoLoader,
    }),
    ...provideCoarI18nUsingTransloco(),
  ],
};`,

    customBackendSetup: `import { ApplicationConfig } from '@angular/core';
import {
  COAR_I18N_EVENTS,
  COAR_I18N_PROVIDER,
  CoarI18n,
  type CoarI18nEvents,
  type CoarI18nProvider,
} from '@cocoar/i18n';

class MyI18nBackend implements CoarI18nProvider, CoarI18nEvents {
  readonly languageChanged$ = /* Observable<void> */ undefined as any;

  t(key: string, params?: Record<string, unknown>): string {
    return key;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    MyI18nBackend,
    { provide: COAR_I18N_PROVIDER, useExisting: MyI18nBackend },
    { provide: COAR_I18N_EVENTS, useExisting: MyI18nBackend },
    CoarI18n,
  ],
};`,

    pipeUsage: `<!-- Simple translation -->
{{ 'coar.button.save' | coarI18n }}

<!-- With fallback default -->
{{ 'coar.button.save' | coarI18n:'Save' }}

<!-- With parameters -->
{{ 'coar.items.count' | coarI18n:{ count: items.length } }}

<!-- With parameters and fallback -->
{{ 'coar.items.count' | coarI18n:{ count: items.length }:'You have {count} items.' }}`,

    typescriptUsage:
      `import { Component, inject } from '@angular/core';
import { CoarI18n } from '@cocoar/i18n';

@Component({
  selector: 'app-example',
  template: ` +
      '`<h1>{{ title() }}</h1>`' +
      `,
})
export class ExampleComponent {
  private readonly i18n = inject(CoarI18n);

  // Synchronous
  getTitle(): string {
    return this.i18n.t('coar.alert.errorTitle', 'Error');
  }

  // Signal
  readonly title = this.i18n.tSignal('coar.alert.errorTitle', undefined, 'Error');

  // Observable
  readonly title$ = this.i18n.t$('coar.alert.errorTitle', undefined, 'Error');
}`,

    combineWithLocalization: `import { inject } from '@angular/core';
import { COAR_LOCALE_SERVICE } from '@cocoar/ui-components';
import { CoarI18n } from '@cocoar/i18n';

export class Example {
  private readonly i18n = inject(CoarI18n);
  private readonly localeService = inject(COAR_LOCALE_SERVICE, { optional: true });

  message(count: number): string {
    // Format values first (numbers/dates) based on your locale policy,
    // then pass them into translation params.
    const formattedCount = String(count);

    return this.i18n.t(
      'demo.items',
      'You have {count} items',
      { count: formattedCount }
    );
  }
}`,
  };
}
