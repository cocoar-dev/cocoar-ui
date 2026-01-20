import { Component } from '@angular/core';

import {
  CoarDividerComponent,
  CoarCodeBlockComponent,
  CoarTabGroupComponent,
  CoarTabComponent,
} from '@cocoar/ui-components';
import { ShowcaseSectionComponent } from '../../components/section';
import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-dividers',
  standalone: true,
  imports: [
    CoarDividerComponent,
    CoarCodeBlockComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    ShowcaseSectionComponent,
  ],
  templateUrl: './dividers.page.html',
  styleUrl: './dividers.page.css',
})
export class DividersPage {
  activeTab = 'examples';

  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  protected readonly docsPath = '/docs/libs/ui-components/coar-divider.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-divider.api.md';

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
