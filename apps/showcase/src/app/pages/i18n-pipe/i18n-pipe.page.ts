import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';

import {
  CoarButtonComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
} from '@cocoar/ui-components';

import {
  COAR_I18N_PROVIDER,
  type CoarI18nProvider,
  COAR_I18N_EVENTS,
  type CoarI18nEvents,
  CoarI18n,
  CoarI18nPipe,
  coarInterpolate,
} from '@cocoar/i18n';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Injectable()
class ShowcaseI18nPipeI18n implements CoarI18nProvider, CoarI18nEvents {
  private readonly lang = signal<'en' | 'de'>('en');
  private readonly languageChangedSubject = new Subject<void>();

  readonly languageChanged$ = this.languageChangedSubject.asObservable();

  currentLang(): 'en' | 'de' {
    return this.lang();
  }

  toggleLang(): void {
    this.lang.update((prev) => (prev === 'en' ? 'de' : 'en'));
    this.languageChangedSubject.next();
  }

  t(key: string, params?: Record<string, unknown>): string {
    const translations: Record<'en' | 'de', Record<string, string>> = {
      en: {
        'demo.hello': 'Hello',
        'demo.items': 'You have {count} items',
      },
      de: {
        'demo.hello': 'Hallo',
        'demo.items': 'Sie haben {count} Elemente',
      },
    };

    const raw = translations[this.lang()][key] ?? key;
    return coarInterpolate(raw, params);
  }
}

@Component({
  selector: 'app-i18n-pipe',
  standalone: true,
  imports: [
    CoarButtonComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarTabComponent,
    CoarTabGroupComponent,
    CoarI18nPipe,
  ],
  templateUrl: './i18n-pipe.page.html',
  styleUrl: './i18n-pipe.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ShowcaseI18nPipeI18n,
    { provide: COAR_I18N_PROVIDER, useExisting: ShowcaseI18nPipeI18n },
    { provide: COAR_I18N_EVENTS, useExisting: ShowcaseI18nPipeI18n },
    CoarI18n,
  ],
})
export class I18nPipePage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/i18n/CoarI18nPipe/overview.md';
  protected readonly apiPath = '/docs/libs/i18n/CoarI18nPipe/api.md';

  readonly i18n = inject(ShowcaseI18nPipeI18n);

  readonly usageExample = `<!-- Simple key -->\n<span>{{ 'demo.hello' | coarI18n }}</span>\n\n<!-- Missing key with fallback -->\n<span>{{ 'demo.missing' | coarI18n:'Fallback text' }}</span>\n\n<!-- With parameters -->\n<span>{{ 'demo.items' | coarI18n:{ count: 3 } }}</span>\n\n<!-- Chaining with other pipes -->\n<h2>{{ 'demo.hello' | coarI18n | uppercase }}</h2>`;

  readonly providersExample = `// Provide CoarI18n at app (or route) level\nimport { COAR_I18N_PROVIDER, COAR_I18N_EVENTS, CoarI18n } from '@cocoar/i18n';\n\nproviders: [\n  { provide: COAR_I18N_PROVIDER, useExisting: MyI18nProvider },\n  { provide: COAR_I18N_EVENTS, useExisting: MyI18nProvider }, // optional, enables live updates\n  CoarI18n,\n];`;
}
