import { Component, signal } from '@angular/core';
import {
  CoarButtonComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarPopoverComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
  CoarTooltipDirective,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [
    CoarTooltipDirective,
    CoarPopoverComponent,
    CoarButtonComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
  ],
  templateUrl: './tooltip.page.html',
  styleUrl: './tooltip.page.css',
})
export class TooltipPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-components/coar-tooltip.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-tooltip.api.md';

  protected readonly clicksThroughOverlay = signal(0);

  protected readonly demoDisabled = signal(false);
  protected readonly demoPlacement = signal<(typeof this.placementOptions)[number]>('right');
  protected readonly demoOpenDelay = signal(0);
  protected readonly demoCloseDelay = signal(0);
  protected readonly demoClampToViewport = signal(true);
  protected readonly demoFallbackToBestFit = signal(false);
  protected readonly demoText = signal(
    'This is a tooltip with longer text to show clamping/fallback near edges.'
  );

  protected onClickThroughOverlay(): void {
    this.clicksThroughOverlay.update((v) => v + 1);
  }

  protected readonly placementOptions = [
    'top',
    'top-start',
    'top-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'left',
    'left-start',
    'left-end',
    'right',
    'right-start',
    'right-end',
    'auto',
  ] as const;

  protected onDelayChange(value: string, target: 'open' | 'close'): void {
    const next = Math.max(0, Number(value) || 0);
    if (target === 'open') {
      this.demoOpenDelay.set(next);
      return;
    }
    this.demoCloseDelay.set(next);
  }

  codeExamples = {
    basic: `<coar-button
  variant="ghost"
  size="sm"
  coarTooltip="This is a tooltip."
  [coarTooltipPlacement]="'top'"
>
  Hover me
</coar-button>`,
    auto: `<coar-button
  variant="ghost"
  size="sm"
  coarTooltip="Uses best-fit placement."
  [coarTooltipPlacement]="'auto'"
>
  Best-fit
</coar-button>`,

    popoverBasic: `<coar-popover [openOnHover]="true">
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

    popoverClickOnly: `<coar-popover [openOnHover]="false" [openOnClick]="true">
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

    popoverNonInteractive: `<coar-popover [openOnClick]="true" [interactive]="false">
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
