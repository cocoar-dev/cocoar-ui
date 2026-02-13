import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CoarCardComponent, CoarDividerComponent } from '@cocoar/ui/components';

/**
 * Key Tokens tab content for the Design Principles page.
 * Covers brand colors, border radius, component sizing, and typography.
 */
@Component({
  selector: 'app-design-principles-tokens-tab',
  standalone: true,
  imports: [CoarCardComponent, CoarDividerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tokens.tab.html',
  styleUrl: './tokens.tab.css',
})
export class DesignPrinciplesTokensTab {
  /** Theme colors - uses coar-card color variants directly */
  readonly themeColors: {
    name: string;
    color: 'accent' | 'info' | 'success' | 'warning' | 'error';
  }[] = [
    { name: 'Accent', color: 'accent' },
    { name: 'Info', color: 'info' },
    { name: 'Success', color: 'success' },
    { name: 'Warning', color: 'warning' },
    { name: 'Error', color: 'error' },
  ];

  readonly radiusTokens = [
    { token: '--coar-radius-xxs', value: '1px', usage: 'Badges, small elements' },
    { token: '--coar-radius-xs', value: '2px', usage: 'Default (buttons, inputs, cards)' },
    { token: '--coar-radius-s', value: '3px', usage: 'Larger cards' },
    { token: '--coar-radius-m', value: '4px', usage: 'Dialogs, panels' },
    { token: '--coar-radius-l', value: '5px', usage: 'Large panels' },
    { token: '--coar-radius-xl', value: '6px', usage: 'Dialogs, modals' },
  ];

  readonly sizingTokens = [
    { size: 'xs', height: '27px', usage: 'Dense data tables, compact toolbars' },
    { size: 'sm', height: '32px', usage: 'Compact UI, secondary actions' },
    { size: 'md', height: '40px', usage: 'Default — forms, dialogs' },
    { size: 'lg', height: '48px', usage: 'Prominent actions, hero sections' },
  ];
}
