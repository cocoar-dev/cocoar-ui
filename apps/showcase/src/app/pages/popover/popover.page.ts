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
} from '@cocoar/ui-components';

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [
    CommonModule,
    CoarPopoverComponent,
    CoarButtonComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarTableComponent,
  ],
  templateUrl: './popover.page.html',
  styleUrl: './popover.page.css',
})
export class PopoverPage {
  activeTab = 'examples';

  protected readonly clicksThroughOverlay = signal(0);

  protected onClickThroughOverlay(): void {
    this.clicksThroughOverlay.update((v) => v + 1);
  }

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
