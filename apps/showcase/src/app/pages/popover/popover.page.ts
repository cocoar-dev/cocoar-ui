
import { Component, signal } from '@angular/core';
import {
  CoarButtonComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarPopoverComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [
    CoarPopoverComponent,
    CoarButtonComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent
],
  templateUrl: './popover.page.html',
  styleUrl: './popover.page.css',
})
export class PopoverPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/components/popover/overview.md';
  protected readonly apiPath = '/docs/components/popover/api.md';

  protected readonly clicksThroughOverlay = signal(0);

  protected onClickThroughOverlay(): void {
    this.clicksThroughOverlay.update((v) => v + 1);
  }

  codeExamples = {
    basic: `<coar-popover [openOnHover]="true">
  <coar-button coarPopoverTrigger variant="ghost" size="sm">
    Hover me
  </coar-button>

  <div coarPopoverContent>
    <div class="coar-body" style="margin-bottom: var(--coar-spacing-xs)">Popover</div>
    <div class="coar-caption" style="color: var(--coar-text-neutral-secondary)">
      Rich tooltip-like content.
    </div>
  </div>
</coar-popover>`,
    clickOnly: `<coar-popover [openOnHover]="false" [openOnClick]="true">
  <coar-button coarPopoverTrigger variant="ghost" size="sm">
    Click to pin
  </coar-button>

  <div coarPopoverContent>
    <div class="coar-body" style="margin-bottom: var(--coar-spacing-xs)">Pinned</div>
    <div class="coar-caption" style="color: var(--coar-text-neutral-secondary)">
      Click outside or click the trigger again to close.
    </div>
  </div>
</coar-popover>`,
    nonInteractive: `<coar-popover [openOnClick]="true" [interactive]="false">
  <coar-button coarPopoverTrigger variant="ghost" size="sm">
    Open non-interactive popover
  </coar-button>

  <div coarPopoverContent>
    <div class="coar-body" style="margin-bottom: var(--coar-spacing-xs)">Overlay</div>
    <div class="coar-caption" style="color: var(--coar-text-neutral-secondary)">
      Pointer events pass through to elements below.
    </div>
  </div>
</coar-popover>`,
  };
}
