import { Component } from '@angular/core';
import { CoarTabGroupComponent, CoarTabComponent } from '@cocoar/ui/components';

import {
  LocalizationOverviewTab,
  LocalizationSetupTab,
  LocalizationUsageTab,
} from './tabs';

/**
 * Comprehensive showcase page for localization.
 *
 * Each tab is a separate component for better maintainability:
 * - Overview: Three concepts, BCP 47 tags, language switching
 * - Setup: Providers, sources, file fallback, data structure
 * - Usage: Live pipe examples (L10n + i18n)
 */
@Component({
  selector: 'app-localization-page',
  standalone: true,
  imports: [CoarTabGroupComponent, CoarTabComponent],
  templateUrl: './localization.page.html',
  styleUrl: './localization.page.css',
})
export class LocalizationPage {
  activeTab = 'overview';

  readonly OverviewTab = LocalizationOverviewTab;
  readonly SetupTab = LocalizationSetupTab;
  readonly UsageTab = LocalizationUsageTab;
}
