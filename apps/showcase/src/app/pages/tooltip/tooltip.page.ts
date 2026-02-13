import { Component, signal } from '@angular/core';
import {
  CoarButtonComponent,
  CoarCodeBlockComponent,
  CoarNoteComponent,
  CoarPopoverComponent,
  CoarTooltipDirective,
  CoarCardComponent,
} from '@cocoar/ui/components';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [
    CoarTooltipDirective,
    CoarPopoverComponent,
    CoarButtonComponent,
    CoarCodeBlockComponent,
    CoarNoteComponent,
    CoarCardComponent,
  ],
  templateUrl: './tooltip.page.html',
  styleUrl: './tooltip.page.css',
})
export class TooltipPage {
  importCode = `import { CoarTooltipDirective, CoarPopoverComponent } from '@cocoar/ui/components';`;

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
  size="s"
  coarTooltip="This is a tooltip."
  [coarTooltipPlacement]="'top'"
>
  Hover me
</coar-button>`,
    auto: `<coar-button
  variant="ghost"
  size="s"
  coarTooltip="Uses best-fit placement."
  [coarTooltipPlacement]="'auto'"
>
  Best-fit
</coar-button>`,

    popoverBasic: `<coar-popover [openOnHover]="true">
  <coar-button coarPopoverTrigger variant="ghost" size="s">
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
  <coar-button coarPopoverTrigger variant="ghost" size="s">
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
  <coar-button coarPopoverTrigger variant="ghost" size="s">
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
