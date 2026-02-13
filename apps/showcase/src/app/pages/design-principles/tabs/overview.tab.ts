import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CoarCardComponent, CoarDividerComponent } from '@cocoar/ui/components';

/**
 * Overview tab content for the Design Principles page.
 * Covers vision, target applications, and the Cocoar aesthetic.
 */
@Component({
  selector: 'app-design-principles-overview-tab',
  standalone: true,
  imports: [CoarCardComponent, CoarDividerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview.tab.html',
  styleUrl: './overview.tab.css',
})
export class DesignPrinciplesOverviewTab {}
