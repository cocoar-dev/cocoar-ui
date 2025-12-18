import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  input,
  signal,
  inject,
  ElementRef,
  viewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoreIconName } from '../coar-icon/core-icons';
import { CoarOverlayService, type OverlayRef } from '@cocoar/ui-overlay';

/**
 * @deprecated Use CoarMenuItemComponent with [hasSubmenu]="true" instead.
 * This component will be removed in a future version.
 *
 * Migration example:
 * OLD:
 * <coar-menu-submenu title="Options" mode="flyout">
 *   <coar-menu-item title="Option 1" />
 * </coar-menu-submenu>
 *
 * NEW:
 * <coar-menu-item title="Options" [hasSubmenu]="true" submenuMode="flyout">
 *   <div submenu>
 *     <coar-menu-item title="Option 1" />
 *   </div>
 * </coar-menu-item>
 */
@Component({
  selector: 'coar-menu-submenu',
  standalone: true,
  imports: [CommonModule, CoarIconComponent, NgTemplateOutlet],
  template: `
    <!-- Capture ng-content once in a template -->
    <ng-template #contentTemplate>
      <ng-content />
    </ng-template>

    <li class="coar-menu-submenu" [class.coar-menu-submenu--open]="isOpen()">
      <div
        #triggerElement
        class="coar-menu-submenu__title"
        (click)="toggleOpen()"
        (keydown)="handleKeydownOnTrigger($event)"
        (mouseenter)="handleMouseEnter()"
        (mouseleave)="handleMouseLeave()"
        role="button"
        tabindex="0"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="true"
      >
        @if (icon()) {
        <coar-icon [name]="icon()!" [size]="'sm'" class="coar-menu-submenu__icon" />
        }
        <span class="coar-menu-submenu__text">{{ title() }}</span>
        <coar-icon
          [name]="mode() === 'flyout' ? 'chevron-right' : 'chevron-down'"
          [size]="'xs'"
          class="coar-menu-submenu__arrow"
          [class.coar-menu-submenu__arrow--open]="isOpen() && mode() === 'accordion'"
        />
      </div>
      @if (isOpen() && mode() === 'accordion') {
      <div class="coar-menu-submenu__content">
        <ng-container [ngTemplateOutlet]="contentTemplate" />
      </div>
      }
    </li>

    <!-- Template for flyout mode content -->
    <ng-template #flyoutTemplate>
      <div class="coar-menu-submenu__flyout">
        <ng-container [ngTemplateOutlet]="contentTemplate" />
      </div>
    </ng-template>
  `,
  styleUrl: './coar-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarMenuSubmenuComponent {
  private readonly overlayService = inject(CoarOverlayService);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  /** Icon to display */
  icon = input<CoreIconName | undefined>(undefined);

  /** Submenu title */
  title = input.required<string>();

  /** Submenu expansion mode */
  mode = input<'accordion' | 'flyout'>('accordion');

  /** Whether to open flyout on hover (only applies to flyout mode) */
  openOnHover = input<boolean>(false);

  /** Menu size (inherited from parent menu) */
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');

  /** Whether the submenu is initially open */
  defaultOpen = input<boolean>(false);

  /** Whether the submenu is disabled */
  disabled = input<boolean>(false);

  /** Internal state for open/closed */
  protected isOpen = signal(false);

  /** Reference to the submenu content template (for flyout mode) */
  protected flyoutTemplate = viewChild<TemplateRef<any>>('flyoutTemplate');

  /** Reference to the trigger element for focusing */
  protected triggerElement = viewChild<ElementRef<HTMLElement>>('triggerElement');

  /** Reference to the overlay (for flyout mode) */
  private overlayRef: OverlayRef | null = null;

  /** Timer for hover delay */
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  /** Timer for close delay when mouse leaves */
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Fix: Read defaultOpen after inputs are set
    afterNextRender(() => {
      this.isOpen.set(this.defaultOpen());
    });
  }

  /** Handle keyboard events on the trigger element */
  protected handleKeydownOnTrigger(event: KeyboardEvent): void {
    if (this.disabled()) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        event.stopPropagation();
        if (!this.isOpen()) {
          this.toggleOpen();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        event.stopPropagation();
        if (this.isOpen()) {
          this.toggleOpen();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        event.stopPropagation();
        this.toggleOpen();
        break;
    }
  }

  protected toggleOpen(): void {
    if (!this.disabled()) {
      if (this.mode() === 'flyout') {
        this.toggleFlyout();
      } else {
        this.isOpen.update((open) => !open);
      }
    }
  }

  /** Toggle flyout overlay */
  private toggleFlyout(): void {
    if (this.overlayRef) {
      this.closeFlyout();
    } else {
      this.openFlyout();
    }
  }

  /** Open flyout overlay */
  private openFlyout(): void {
    const triggerElement = this.hostElement.nativeElement.querySelector(
      '.coar-menu-submenu__title'
    );
    const template = this.flyoutTemplate();

    if (!triggerElement || !template) return;

    this.overlayRef = this.overlayService.open(
      {
        content: { kind: 'template', template },
        anchor: { kind: 'element', element: triggerElement as HTMLElement },
        position: {
          placement: ['right-start', 'right', 'left-start', 'left'],
          offset: 4,
          flip: true,
          shift: true,
        },
        backdrop: { kind: 'none' },
        scroll: { strategy: 'close' },
        dismiss: { outsideClick: true, escapeKey: true },
        focus: { trap: false, restore: true },
        a11y: { role: 'menu' },
        attachment: { strategy: 'body' },
      },
      {}
    );

    this.isOpen.set(true);

    // Listen for overlay close
    this.overlayRef.afterClosed$.subscribe(() => {
      this.overlayRef = null;
      this.isOpen.set(false);
    });
  }

  /** Close flyout overlay */
  private closeFlyout(): void {
    if (this.overlayRef) {
      this.overlayRef.close();
      this.overlayRef = null;
      this.isOpen.set(false);
    }
  }

  /** Open the submenu programmatically */
  open(): void {
    if (!this.disabled()) {
      if (this.mode() === 'flyout') {
        this.openFlyout();
      } else {
        this.isOpen.set(true);
      }
    }
  }

  /** Close the submenu programmatically */
  close(): void {
    if (this.mode() === 'flyout') {
      this.closeFlyout();
    } else {
      this.isOpen.set(false);
    }
  }

  /** Focus the submenu trigger element for keyboard navigation */
  focus(): void {
    this.triggerElement()?.nativeElement.focus();
  }

  /** Handle mouse enter on trigger */
  protected handleMouseEnter(): void {
    if (this.openOnHover() && this.mode() === 'flyout' && !this.disabled()) {
      // Cancel any pending close
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }

      // Small delay to prevent accidental opens
      this.hoverTimer = setTimeout(() => {
        if (!this.isOpen()) {
          this.openFlyout();
        }
      }, 200);
    }
  }

  /** Handle mouse leave on trigger */
  protected handleMouseLeave(): void {
    // Cancel hover timer if we leave before it fires
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    // Close flyout if hover mode and flyout is open
    if (this.openOnHover() && this.mode() === 'flyout' && this.isOpen()) {
      this.closeTimer = setTimeout(() => {
        this.closeFlyout();
      }, 300);
    }
  }
}
