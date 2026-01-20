import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarLocalizationService } from './coar-localization.service';
import { provideCoarLocalization } from './provide-coar-localization';
import { CoarI18nPipe } from './i18n/coar-i18n.pipe';
import { CoarNumberPipe } from './l10n/number.pipe';
import { CoarDatePipe } from './l10n/date.pipe';
import { provideCoarI18nHttpSource } from './i18n/provide-coar-i18n-http-source';
import { provideCoarL10nHttpSource } from './l10n/provide-l10n-http-source';
import { Temporal } from '@js-temporal/polyfill';

/**
 * Integrated scenario testing CoarLocalizationService, i18n pipe, and l10n pipes together.
 *
 * Tests:
 * - Language switching via service
 * - Translation pipe (coarI18n)
 * - Number formatting pipe (coarNumber)
 * - Date formatting pipe (coarDate)
 * - All react to language changes
 */
@Component({
  selector: 'coar-localization-scenario',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarI18nPipe, CoarNumberPipe, CoarDatePipe],
  template: `
    <div style="padding: 40px; max-width: 600px;">
      <h2>{{ 'demo.title' | coarI18n: 'Localization Demo' }}</h2>

      <div style="margin: 20px 0; padding: 20px; border: 1px solid #ccc; border-radius: 4px;">
        <h3>Current Language: {{ currentLanguage() }}</h3>
        <button
          (click)="switchLanguage()"
          style="padding: 8px 16px; cursor: pointer; margin-right: 10px;"
        >
          Switch to {{ nextLanguage() }}
        </button>
      </div>

      <div style="margin-top: 30px;">
        <h3>{{ 'demo.sections.translations' | coarI18n: 'Translations (i18n)' }}</h3>
        <ul>
          <li><strong>Welcome:</strong> {{ 'demo.welcome' | coarI18n: 'Welcome!' }}</li>
          <li>
            <strong>Description:</strong> {{ 'demo.description' | coarI18n: 'This is a test' }}
          </li>
          <li>
            <strong>With params:</strong>
            {{ 'demo.greeting' | coarI18n: { name: userName() } : 'Hello {name}' }}
          </li>
        </ul>
      </div>

      <div style="margin-top: 30px;">
        <h3>{{ 'demo.sections.numbers' | coarI18n: 'Number Formatting (l10n)' }}</h3>
        <ul>
          <li><strong>Price:</strong> {{ testNumber() | coarNumber }}</li>
          <li><strong>Large number:</strong> {{ largeNumber() | coarNumber: undefined : 0 }}</li>
          <li><strong>Percentage:</strong> {{ percentage() | coarNumber }}%</li>
        </ul>
      </div>

      <div style="margin-top: 30px;">
        <h3>{{ 'demo.sections.dates' | coarI18n: 'Date Formatting (l10n)' }}</h3>
        <ul>
          <li><strong>Today:</strong> {{ testDate() | coarDate }}</li>
          <li><strong>Reference date:</strong> {{ referenceDate() | coarDate }}</li>
        </ul>
      </div>

      <div style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 4px;">
        <strong>Note:</strong> Switch language to see all pipes and translations update
        automatically.
      </div>
    </div>
  `,
})
export class CoarLocalizationScenarioComponent {
  private readonly localizationService = inject(CoarLocalizationService);

  currentLanguage = signal('en');
  userName = signal('World');
  testNumber = signal(1234.56);
  largeNumber = signal(1000000);
  percentage = signal(87.5);
  testDate = signal(Temporal.Now.plainDateISO());
  referenceDate = signal(Temporal.PlainDate.from('2025-01-15'));

  nextLanguage() {
    return this.currentLanguage() === 'en' ? 'de' : 'en';
  }

  switchLanguage() {
    const next = this.nextLanguage();
    this.currentLanguage.set(next);
    this.localizationService.setLanguage(next);
  }
}

export const scenario = defineScenario<CoarLocalizationScenarioComponent>({
  id: 'localization',
  title: 'Localization (Service + i18n + l10n)',
  description: 'Integrated test of localization service, translation pipe, and formatting pipes',
  providers: [provideCoarLocalization({ defaultLanguage: 'en' })],
});
