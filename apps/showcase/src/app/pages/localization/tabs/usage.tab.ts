import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  CoarCardComponent,
  CoarCodeBlockComponent,
} from '@cocoar/ui/components';
import {
  CoarCurrencyPipe,
  CoarDatePipe,
  CoarI18nPipe,
  CoarLocalizationService,
  CoarNumberPipe,
  CoarPercentPipe,
} from '@cocoar/localization';

@Component({
  selector: 'app-localization-usage-tab',
  standalone: true,
  imports: [
    CoarCardComponent,
    CoarCodeBlockComponent,
    CoarDatePipe,
    CoarNumberPipe,
    CoarCurrencyPipe,
    CoarPercentPipe,
    CoarI18nPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './usage.tab.html',
  styleUrl: './usage.tab.css',
})
export class LocalizationUsageTab {
  protected readonly locale = inject(CoarLocalizationService);

  protected readonly now = new Date();
  protected readonly largeNumber = 1234567.89;
  protected readonly price = 1234.56;
  protected readonly percent = 0.25;

  // Order summary
  protected readonly itemCount = 42;
  protected readonly subtotal = 1289.99;
  protected readonly tax = 0.19;
  protected readonly total = 1535.09;

  protected readonly translationsExample = `// /i18n/en.json
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
