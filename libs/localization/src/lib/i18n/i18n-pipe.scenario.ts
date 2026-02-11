import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { defineScenario } from '@cocoar/scenar-abstractions';
import { provideCoarLocalization } from '../provide-coar-localization';
import { CoarLocalizationService } from '../coar-localization.service';
import { CoarI18nPipe } from './coar-i18n.pipe';
import { CoarTranslationLoader, COAR_TRANSLATION_LOADERS } from './coar-translation-loader';
import type { CoarTranslations } from './coar-translation-store';

const TRANSLATIONS: Record<string, CoarTranslations> = {
  en: {
    'pipe.simple': 'Hello',
    'pipe.params': 'You have {count} items',
  },
  de: {
    'pipe.simple': 'Hallo',
    'pipe.params': 'Sie haben {count} Elemente',
  },
};

@Injectable()
class InlineTranslationLoader extends CoarTranslationLoader {
  loadTranslations(language: string): Observable<CoarTranslations> {
    return of(TRANSLATIONS[language] ?? {});
  }
}

@Component({
  selector: 'coar-i18n-pipe-scenario',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarI18nPipe],
  template: `
    <h1 data-testid="title">CoarI18nPipe</h1>
    <p data-testid="lang">{{ currentLanguage() }}</p>
    <p data-testid="simple">{{ 'pipe.simple' | coarI18n }}</p>
    <p data-testid="fallback">{{ 'pipe.missing' | coarI18n: 'Fallback text' }}</p>
    <p data-testid="params">{{ 'pipe.params' | coarI18n: { count: 3 } }}</p>
    <button data-testid="toggle-lang" (click)="toggleLanguage()">Toggle</button>
  `,
})
export class CoarI18nPipeScenarioComponent {
  private readonly locale = inject(CoarLocalizationService);
  currentLanguage = signal('en');

  async toggleLanguage(): Promise<void> {
    const next = this.currentLanguage() === 'en' ? 'de' : 'en';
    await this.locale.setLanguage(next);
    this.currentLanguage.set(next);
  }
}

export const scenario = defineScenario<CoarI18nPipeScenarioComponent>({
  id: 'i18n/pipe',
  title: 'CoarI18nPipe',
  providers: [
    provideCoarLocalization({ defaultLanguage: 'en' }),
    { provide: COAR_TRANSLATION_LOADERS, multi: true, useClass: InlineTranslationLoader },
  ],
});
