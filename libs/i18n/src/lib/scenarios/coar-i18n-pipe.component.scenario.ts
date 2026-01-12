import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { defineScenario } from '@cocoar/scenar-abstractions';

import { CoarI18n } from '../coar-i18n';
import { COAR_I18N_PROVIDER, type CoarI18nProvider } from '../coar-i18n-provider';
import { COAR_I18N_EVENTS, type CoarI18nEvents } from '../coar-i18n-events';
import { CoarI18nPipe } from '../coar-i18n.pipe';
import { coarInterpolate } from '../coar-interpolate';

@Injectable()
class CoarI18nPipeScenarioI18n implements CoarI18nProvider, CoarI18nEvents {
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
  selector: 'coar-i18n-pipe-scenario',
  standalone: true,
  imports: [CommonModule, CoarI18nPipe],
  template: `
    <main class="coar-i18n-pipe-scenario">
      <h1 data-testid="title">CoarI18nPipe</h1>

      <p>
        <strong data-testid="lang">{{ i18n.currentLang() }}</strong>
        <button type="button" data-testid="toggle-lang" (click)="i18n.toggleLang()">
          Toggle language
        </button>
      </p>

      <dl>
        <dt>Simple key</dt>
        <dd data-testid="simple">{{ 'demo.hello' | coarI18n }}</dd>

        <dt>Missing key with fallback</dt>
        <dd data-testid="fallback">{{ 'demo.missing' | coarI18n: 'Fallback text' }}</dd>

        <dt>Params</dt>
        <dd data-testid="params">{{ 'demo.items' | coarI18n: { count: 3 } }}</dd>
      </dl>
    </main>
  `,
  styles: [
    `
      .coar-i18n-pipe-scenario {
        padding: 16px;
      }

      dl {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 8px 16px;
        margin: 16px 0 0;
      }

      dt {
        font-weight: 600;
      }

      dd {
        margin: 0;
      }

      button {
        margin-left: 12px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarI18nPipeScenarioComponent {
  readonly i18n = inject(CoarI18nPipeScenarioI18n);
}

export const scenario = defineScenario<CoarI18nPipeScenarioComponent>({
  id: 'i18n/pipe',
  title: 'I18n Pipe',
  description: 'Demo for CoarI18nPipe including fallback, params, and language change events.',
  providers: [
    CoarI18nPipeScenarioI18n,
    { provide: COAR_I18N_PROVIDER, useExisting: CoarI18nPipeScenarioI18n },
    { provide: COAR_I18N_EVENTS, useExisting: CoarI18nPipeScenarioI18n },
    // Override the root-provided CoarI18n so it resolves COAR_I18N_PROVIDER from the scenario injector.
    CoarI18n,
  ],
});
