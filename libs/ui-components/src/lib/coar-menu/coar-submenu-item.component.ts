import {
  Component,
  ChangeDetectionStrategy,
  input,
  ViewChild,
  TemplateRef,
  inject,
  DestroyRef,
  InjectionToken,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { type CoreIconName } from '../coar-icon/core-icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CoarOverlayService,
  Overlay,
  coarHoverMenuPreset,
  COAR_OVERLAY_REF,
  type OverlayRef,
} from '@cocoar/ui-overlay';

class CoarMenuCascade {
  overlayRef: OverlayRef | null = null;
  private cancelCloseTimer: (() => void) | null = null;

  constructor(readonly parent: CoarMenuCascade | null) {}

  registerCancelCloseTimer(fn: () => void): void {
    this.cancelCloseTimer = fn;
  }

  keepAliveUpTree(): void {
    this.cancelCloseTimer?.();
    this.parent?.keepAliveUpTree();
  }
}

const COAR_MENU_CASCADE = new InjectionToken<CoarMenuCascade>('COAR_MENU_CASCADE');

/**
 * CoarSubmenuItem: Menu item that opens a submenu on hover.
 *
 * Responsibilities:
 * - Render parent item with icon and label
 * - Manage submenu overlay lifecycle
 * - Handle hover delays (300ms before closing)
 * - Support nested submenus (can contain other submenu-items)
 *
 * @example
 * ```html
 * <coar-submenu-item label="Share" icon="🔗">
 *   <coar-menu-item icon="✉️" (itemClick)="sendEmail()">Email</coar-menu-item>
 *   <coar-menu-item icon="🔗" (itemClick)="copyLink()">Copy Link</coar-menu-item>
 * </coar-submenu-item>
 * ```
 */
@Component({
  selector: 'coar-submenu-item',
  standalone: true,
  imports: [CommonModule, CoarIconComponent],
  template: `
    <div
      class="coar-submenu-item"
      [class.coar-submenu-item--disabled]="disabled()"
      [class.coar-submenu-item--open]="isOpen"
      [attr.role]="'menuitem'"
      [attr.aria-haspopup]="'menu'"
      [attr.aria-expanded]="isOpen"
      [attr.aria-disabled]="disabled()"
      [attr.tabindex]="disabled() ? -1 : 0"
      (mouseenter)="onMouseEnter($event)"
      (click)="onClick($event)"
      (keydown.enter)="onKeyboardActivate($event)"
      (keydown.space)="onKeyboardActivate($event)"
    >
      @if (icon()) {
      <coar-icon [name]="icon()!" size="sm" class="coar-submenu-item__icon" aria-hidden="true" />
      }
      <span class="coar-submenu-item__label">{{ label() }}</span>
      <coar-icon
        name="chevron-right"
        size="xs"
        class="coar-submenu-item__arrow"
        aria-hidden="true"
      />
    </div>

    <ng-template #submenuTemplate>
      <div class="coar-submenu-content">
        <ng-content />
      </div>
    </ng-template>
  `,
  styleUrl: './coar-submenu-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: COAR_MENU_CASCADE,
      useFactory: () =>
        new CoarMenuCascade(inject(COAR_MENU_CASCADE, { optional: true, skipSelf: true })),
    },
  ],
})
export class CoarSubmenuItemComponent {
  private readonly overlayService = inject(CoarOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cascade = inject(COAR_MENU_CASCADE);
  private readonly containingOverlayRef = inject(COAR_OVERLAY_REF, { optional: true });

  /** Label text for the menu item */
  readonly label = input.required<string>();

  /** Optional icon identifier */
  readonly icon = input<CoreIconName | undefined>(undefined);

  /** Disabled state prevents interaction */
  readonly disabled = input(false);

  @ViewChild('submenuTemplate') submenuTemplate!: TemplateRef<unknown>;

  private submenuRef: ReturnType<typeof this.overlayService.open> | null = null;
  isOpen = false;

  constructor() {
    // Kept for compatibility with older patterns; now hover dismissal is handled by ui-overlay.
    this.cascade.registerCancelCloseTimer(() => void 0);
  }

  onMouseEnter(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }

    this.cascade.keepAliveUpTree();

    // Open submenu if not already open
    if (!this.submenuRef) {
      this.openSubmenu(event.currentTarget as HTMLElement);
    }
  }

  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    // For accessibility: toggle on click/Enter/Space
    if (this.submenuRef) {
      this.closeSubmenu();
    } else {
      this.openSubmenu(event.currentTarget as HTMLElement);
    }
  }

  onKeyboardActivate(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const target = event.currentTarget as HTMLElement;
    if (this.submenuRef) {
      this.closeSubmenu();
    } else {
      this.openSubmenu(target);
    }
  }

  private openSubmenu(anchorElement: HTMLElement): void {
    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromTemplate(this.submenuTemplate));
      b.anchor({ kind: 'element', element: anchorElement });
      b.position({ placement: 'right-start', offset: -4, flip: true });
    }, coarHoverMenuPreset);

    // If this submenu-item lives inside another submenu overlay, open as a *child* overlay.
    // This keeps overlay trees consistent for outside-click and sibling submenu behavior.
    const parentOverlayRef = this.cascade.parent?.overlayRef ?? this.containingOverlayRef;
    this.submenuRef = parentOverlayRef
      ? this.overlayService.openChild(parentOverlayRef, spec, undefined)
      : this.overlayService.open(spec, undefined);

    // Expose the overlay ref to descendants so they can parent their own flyouts correctly.
    this.cascade.overlayRef = this.submenuRef;

    this.isOpen = true;
    this.cascade.keepAliveUpTree();

    const openedRef = this.submenuRef;

    openedRef.afterClosed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.cascade.overlayRef === openedRef) {
        this.cascade.overlayRef = null;
      }

      this.submenuRef = null;
      this.isOpen = false;
    });
  }

  // Parent overlay is resolved via COAR_OVERLAY_REF when rendered inside an overlay.

  private closeSubmenu(): void {
    this.submenuRef?.close();
    this.submenuRef = null;
    this.isOpen = false;
  }
}
