import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  input,
  ContentChild,
  ViewChild,
  TemplateRef,
  inject,
  DestroyRef,
  Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { type CoreIconName } from '../coar-icon/core-icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CoarOverlayService,
  coarHoverMenuPreset,
  Overlay,
  COAR_MENU_PARENT,
} from '@cocoar/ui-overlay';
import { COAR_MENU_CASCADE, CoarMenuCascade } from './coar-menu-cascade';
import { CoarSubmenuTemplateDirective } from './coar-submenu-template.directive';

/**
 * CoarSubmenuItem: Menu item that opens a submenu on hover.
 *
 * Responsibilities:
 * - Render parent item with icon and label
 * - Manage submenu overlay lifecycle
 * - Support nested submenus (can contain other submenu-items)
 *
 * @example
 * ```html
 * <coar-submenu-item label="Share" icon="🔗">
 *   <ng-template>
 *     <coar-menu-item icon="✉️" (itemClick)="sendEmail()">Email</coar-menu-item>
 *     <coar-menu-item icon="🔗" (itemClick)="copyLink()">Copy Link</coar-menu-item>
 *   </ng-template>
 * </coar-submenu-item>
 *
 * <!-- Optional: explicitly mark the template -->
 * <coar-submenu-item label="Share" icon="🔗">
 *   <ng-template coarSubmenu>
 *     ...
 *   </ng-template>
 * </coar-submenu-item>
 *
 * <!-- Also supported (legacy / external template): -->
 * <coar-submenu-item label="Share" icon="🔗" [submenuTemplate]="shareMenu" />
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

    <ng-template #overlaySubmenuTemplate>
      <ng-container
        *ngTemplateOutlet="submenuTemplateToRender(); injector: submenuTemplateInjector"
      />
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
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly cascade = inject(COAR_MENU_CASCADE);
  private readonly parentOverlay = inject(COAR_MENU_PARENT, { optional: true });
  private readonly injector = inject(Injector);

  // Ensures the submenu TemplateRef is instantiated with a parent injector that contains
  // the correct cascade instance for this submenu item. Without this, TemplateRefs declared
  // outside of this component can end up resolving menu context from the declaration site.
  protected readonly submenuTemplateInjector = Injector.create({
    providers: [{ provide: COAR_MENU_CASCADE, useValue: this.cascade }],
    parent: this.injector,
  });

  constructor() {
    // Cleanup cascade when component is destroyed
    this.destroyRef.onDestroy(() => {
      this.cascade.destroy();
    });
  }

  /** Label text for the menu item */
  readonly label = input.required<string>();

  /** Optional icon identifier */
  readonly icon = input<CoreIconName | undefined>(undefined);

  /** Disabled state prevents interaction */
  readonly disabled = input(false);

  /**
   * Optional external submenu template.
   *
   * Prefer an inline `<ng-template>` child when possible.
   */
  readonly submenuTemplate = input<TemplateRef<unknown> | null>(null);

  @ContentChild(CoarSubmenuTemplateDirective, { descendants: false })
  private readonly markedInlineTemplate?: CoarSubmenuTemplateDirective;

  @ContentChild(TemplateRef, { descendants: false })
  private readonly inlineTemplate?: TemplateRef<unknown>;

  @ViewChild('overlaySubmenuTemplate') private overlaySubmenuTemplate!: TemplateRef<unknown>;

  private submenuRef: ReturnType<typeof this.overlayService.open> | null = null;
  isOpen = false;

  protected submenuTemplateToRender(): TemplateRef<unknown> {
    const template =
      this.markedInlineTemplate?.templateRef ?? this.inlineTemplate ?? this.submenuTemplate();

    if (!template) {
      throw new Error(
        'CoarSubmenuItemComponent: missing submenu content. Provide either an inline <ng-template> child or set [submenuTemplate].'
      );
    }

    return template;
  }

  onMouseEnter(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }

    // If the submenu is currently closing (e.g. sibling switch + close animation),
    // allow reopening immediately on hover.
    if (this.submenuRef?.isClosed) {
      this.submenuRef = null;
      this.isOpen = false;
      this.cdr.markForCheck();
    }

    // Open submenu if not already open
    if (!this.submenuRef) {
      const anchor = event.currentTarget as HTMLElement;

      // Menu-aim: when a different sibling submenu is already open, delay switching
      // if the pointer trajectory suggests the user is heading into the open submenu panel.
      const parent = this.cascade.parent;
      if (parent) {
        parent.requestOpenFromChild(this.cascade, () => this.openSubmenu(anchor), {
          x: event.clientX,
          y: event.clientY,
        });
      } else {
        this.openSubmenu(anchor);
      }
    }
  }

  onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (this.submenuRef?.isClosed) {
      this.submenuRef = null;
      this.isOpen = false;
      this.cdr.markForCheck();
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

    if (this.submenuRef?.isClosed) {
      this.submenuRef = null;
      this.isOpen = false;
      this.cdr.markForCheck();
    }

    const target = event.currentTarget as HTMLElement;
    if (this.submenuRef) {
      this.closeSubmenu();
    } else {
      this.openSubmenu(target);
    }
  }

  private openSubmenu(anchorElement: HTMLElement): void {
    // Validate early so the error points at the submenu item usage.
    this.submenuTemplateToRender();

    // All overlays use hoverTree preset for proper tree tracking
    const spec = Overlay.define<void>((b) => {
      b.content((c) => c.fromTemplate(this.overlaySubmenuTemplate));
      b.anchor({ kind: 'element', element: anchorElement });
      b.position({ placement: ['right-start', 'left-start'], offset: -4, flip: true, shift: true });
    }, coarHoverMenuPreset);

    // Prefer the cascade parent's overlayRef when available.
    // With Angular content projection, submenu content can be instantiated in the *root* overlay
    // injector even when it's rendered inside a child overlay. The cascade chain preserves the
    // correct containing overlay via overlayRef.
    const containingOverlay = this.cascade.parent?.overlayRef ?? this.parentOverlay;

    if (containingOverlay) {
      // Inside an overlay: close siblings (direct children of parent) then open as child
      // First, create the child overlay
      this.submenuRef = this.overlayService.openChild(containingOverlay, spec, undefined);

      // Then close siblings, excluding the newly opened one
      containingOverlay.closeChildren(this.submenuRef);
    } else {
      // Inline menu: use cascade-level sibling closure
      this.cascade.closeSiblings();
      this.submenuRef = this.overlayService.open(spec, undefined);
    }

    // Expose the overlay ref to descendants so they can parent their own flyouts correctly.
    this.cascade.overlayRef = this.submenuRef;
    this.cascade.parent?.notifyChildOpened(this.cascade);

    this.isOpen = true;
    this.cdr.markForCheck();

    const openedRef = this.submenuRef;

    openedRef.afterClosed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.cascade.overlayRef === openedRef) {
        this.cascade.overlayRef = null;
      }

      this.submenuRef = null;
      this.isOpen = false;
      this.cdr.markForCheck();

      this.cascade.parent?.notifyChildClosed(this.cascade);
    });
  }

  // Parent overlay is resolved via COAR_OVERLAY_REF when rendered inside an overlay.

  private closeSubmenu(): void {
    this.submenuRef?.close();
    this.submenuRef = null;
    this.isOpen = false;
    this.cdr.markForCheck();
  }
}
