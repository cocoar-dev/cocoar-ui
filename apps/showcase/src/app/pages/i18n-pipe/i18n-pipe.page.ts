import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import {
  CoarButtonComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
} from '@cocoar/ui-components';

import { CoarI18nPipe } from '@cocoar/i18n';
import { TranslocoService } from '@jsverse/transloco';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

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
})
export class I18nPipePage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/i18n/CoarI18nPipe/overview.md';
  protected readonly apiPath = '/docs/libs/i18n/CoarI18nPipe/api.md';

  private readonly transloco = inject(TranslocoService);

  currentLang(): string {
    return this.transloco.getActiveLang();
  }

  toggleLang(): void {
    const current = this.transloco.getActiveLang();
    const next = current === 'en' ? 'de' : 'en';
    this.transloco.setActiveLang(next);
  }

  readonly usageExample = `<!-- Simple key -->\n<span>{{ 'showcase.i18nPipe.demo.simpleKey.value' | coarI18n }}</span>\n\n<!-- Missing key with fallback -->\n<span>{{ 'showcase.i18nPipe.demo.missingKey.value' | coarI18n:'Fallback text' }}</span>\n\n<!-- With parameters -->\n<span>{{ 'showcase.i18nPipe.demo.params.value' | coarI18n:{ count: 3 } }}</span>\n\n<!-- Chaining with other pipes -->\n<h2>{{ 'showcase.i18nPipe.demo.simpleKey.value' | coarI18n | uppercase }}</h2>`;

  readonly providersExample = `// Provide CoarI18n at app (or route) level\nimport { COAR_I18N_PROVIDER, COAR_I18N_EVENTS, CoarI18n } from '@cocoar/i18n';\n\nproviders: [\n  { provide: COAR_I18N_PROVIDER, useExisting: MyI18nProvider },\n  { provide: COAR_I18N_EVENTS, useExisting: MyI18nProvider }, // optional, enables live updates\n  CoarI18n,\n];`;
}
