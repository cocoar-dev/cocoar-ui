import { Component } from '@angular/core';
import { CoarTabGroupComponent, CoarTabComponent } from '@cocoar/ui-components';

import {
  DesignPrinciplesOverviewTab,
  DesignPrinciplesTokensTab,
  DesignPrinciplesTouchFirstTab,
  DesignPrinciplesDosDontsTab,
} from './tabs';

/**
 * Design Principles page - showcases the foundation of the Cocoar Design System.
 *
 * Each tab is a separate component for better maintainability:
 * - Overview: Vision, target applications, and aesthetic
 * - Key Tokens: Brand colors, border radius, sizing, typography
 * - Touch-First: Touch-first design principles and patterns
 * - Do's & Don'ts: Best practices and anti-patterns
 */
@Component({
  selector: 'app-design-principles',
  standalone: true,
  imports: [CoarTabGroupComponent, CoarTabComponent],
  templateUrl: './design-principles.page.html',
  styleUrl: './design-principles.page.css',
})
export class DesignPrinciplesPage {
  activeTab = 'overview';

  // Tab content components - passed to [content] input for lazy loading
  readonly OverviewTab = DesignPrinciplesOverviewTab;
  readonly TokensTab = DesignPrinciplesTokensTab;
  readonly TouchFirstTab = DesignPrinciplesTouchFirstTab;
  readonly DosDontsTab = DesignPrinciplesDosDontsTab;
}
