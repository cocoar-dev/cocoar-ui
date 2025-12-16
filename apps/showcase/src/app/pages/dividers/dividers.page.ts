import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarDividerComponent,
  CoarCodeBlockComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarTableComponent,
} from '@cocoar/ui-components';
import { ShowcaseSectionComponent } from '../../components/section';

@Component({
  selector: 'app-dividers',
  standalone: true,
  imports: [
    CommonModule,
    CoarDividerComponent,
    CoarCodeBlockComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarTableComponent,
    ShowcaseSectionComponent,
  ],
  templateUrl: './dividers.page.html',
  styleUrl: './dividers.page.css',
})
export class DividersPage {
  activeTab = 'examples';

  /** API properties */
  apiProperties = [
    {
      name: 'align',
      type: "'left' | 'center' | 'right'",
      default: "'center'",
      description: 'Content alignment when ng-content is provided',
    },
    {
      name: 'variant',
      type: "'subtle' | 'strong'",
      default: "'subtle'",
      description: 'Visual style - subtle (lighter) or strong (full opacity)',
    },
    {
      name: 'width',
      type: 'number',
      default: '90',
      description: 'Width of the divider as a percentage (0-100)',
    },
    {
      name: 'spacingTop',
      type: 'number',
      default: '0',
      description: 'Spacing above the divider in pixels',
    },
    {
      name: 'spacingBottom',
      type: 'number',
      default: '0',
      description: 'Spacing below the divider in pixels',
    },
  ];

  /** Code examples */
  codeExamples = {
    basic: `<!-- Simple divider -->
<coar-divider />`,

    width: `<!-- Full width -->
<coar-divider [width]="100" />

<!-- 90% width (default) -->
<coar-divider [width]="90" />

<!-- 60% width -->
<coar-divider [width]="60" />`,

    variants: `<!-- Subtle (default) - lighter line -->
<coar-divider variant="subtle" />

<!-- Strong - full opacity line -->
<coar-divider variant="strong" />`,

    spacing: `<!-- With spacing -->
<coar-divider [spacingTop]="16" [spacingBottom]="32" />

<!-- Large spacing for section breaks -->
<coar-divider [spacingTop]="24" [spacingBottom]="64" />`,

    withText: `<!-- Centered text (default) -->
<coar-divider>OR</coar-divider>

<!-- Section label -->
<coar-divider>Continue with</coar-divider>`,

    alignLeft: `<!-- Left-aligned content -->
<coar-divider align="left">Section Title</coar-divider>

<!-- Left-aligned with icon -->
<coar-divider align="left">📌 Important</coar-divider>`,

    alignRight: `<!-- Right-aligned content -->
<coar-divider align="right">End of Section</coar-divider>`,

    combinations: `<!-- Login form divider -->
<coar-divider [spacingTop]="24" [spacingBottom]="24">
  or continue with
</coar-divider>

<!-- Section header -->
<coar-divider align="left" variant="strong" [spacingBottom]="16">
  Advanced Options
</coar-divider>`,
  };
}
