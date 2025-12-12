import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  CoarButtonComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarNoteComponent,
  CoarPopoverComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
  CoarTableComponent,
  CoarTooltipDirective,
} from '@cocoar/ui-components';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [
    CommonModule,
    CoarTooltipDirective,
    CoarPopoverComponent,
    CoarButtonComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarTableComponent,
  ],
  templateUrl: './tooltip.page.html',
  styleUrl: './tooltip.page.css',
})
export class TooltipPage {
  activeTab = 'examples';

  protected readonly clicksThroughOverlay = signal(0);

  protected readonly demoDisabled = signal(false);
  protected readonly demoPlacement = signal<typeof this.placementOptions[number]>('right');
  protected readonly demoOpenDelay = signal(0);
  protected readonly demoCloseDelay = signal(0);
  protected readonly demoClampToViewport = signal(true);
  protected readonly demoFallbackToBestFit = signal(false);
  protected readonly demoText = signal('This is a tooltip with longer text to show clamping/fallback near edges.');

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

  tooltipProperties = [
    {
      name: 'coarTooltip',
      type: "string | TemplateRef | Type<Component>",
      default: 'null',
      description: 'Tooltip content (text, template ref, or component type).',
    },
    {
      name: 'coarTooltipContext',
      type: 'object',
      default: 'null',
      description: 'Optional context for TemplateRef tooltips.',
    },
    {
      name: 'coarTooltipDisabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables tooltip behavior (trigger still renders).',
    },
    {
      name: 'coarTooltipPlacement',
      type: "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end' | 'auto'",
      default: "'top'",
      description: "Controls the tooltip placement. Use 'auto' for best-fit. Supports all 12 standard placements with optional -start/-end alignment.",
    },
    {
      name: 'coarTooltipClampToViewport',
      type: 'boolean',
      default: 'true',
      description: 'Clamps coordinates to keep the tooltip visible in the viewport.',
    },
    {
      name: 'coarTooltipFallbackToBestFit',
      type: 'boolean',
      default: 'false',
      description: 'When placement is explicit (not auto), fall back to best-fit if it does not fit.',
    },
    {
      name: 'coarTooltipOpenDelay',
      type: 'number',
      default: '0',
      description: 'Delay (ms) before opening on hover/focus.',
    },
    {
      name: 'coarTooltipCloseDelay',
      type: 'number',
      default: '0',
      description: 'Delay (ms) before closing on leave/blur.',
    },
  ];

  popoverProperties = [
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables popover behavior (trigger still renders).',
    },
    {
      name: 'openOnHover',
      type: 'boolean',
      default: 'false',
      description: 'Opens on hover/focus (desktop-friendly).',
    },
    {
      name: 'openOnClick',
      type: 'boolean',
      default: 'false',
      description: 'Opens on click/tap and pins open until closed.',
    },
    {
      name: 'interactive',
      type: 'boolean',
      default: 'true',
      description: 'When false, popover does not capture pointer events.',
    },
  ];

  popoverSlots = [
    {
      name: '[coarPopoverTrigger]',
      description: 'Projected trigger content (what users hover/click).',
    },
    {
      name: '[coarPopoverContent]',
      description: 'Projected panel content (what the popover shows).',
    },
  ];

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
