import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
  CoarNoteComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-localization-overview-tab',
  standalone: true,
  imports: [CoarCardComponent, CoarCodeBlockComponent, CoarNoteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview.tab.html',
  styleUrl: './overview.tab.css',
})
export class LocalizationOverviewTab {
  protected readonly localeResolutionExample = `// Simple language code — Intl resolves region automatically
provideCoarLocalization({ defaultLanguage: 'en' });   // → en-US behavior
provideCoarLocalization({ defaultLanguage: 'de' });   // → de-DE behavior

// Full BCP 47 tag — explicit region control
provideCoarLocalization({ defaultLanguage: 'de-AT' }); // → Austrian German (Jänner)

// Runtime switching — both forms work
this.localization.setLanguage('de');      // Switch to German (de-DE assumed)
this.localization.setLanguage('de-AT');   // Switch to Austrian German
this.localization.setLanguage('en');      // Switch to English (en-US assumed)

// Per-component locale override (datepickers, formatting pipes)
<coar-plain-date-picker locale="de-AT" />  // Austrian formatting regardless of app language`;
}
