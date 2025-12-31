import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  signal,
  viewChild,
  booleanAttribute,
  TemplateRef,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, filter } from 'rxjs';

import { CoarOverlayService, Overlay } from '@cocoar/ui-overlay';
import { CoarScrollbarDirective } from '../coar-scrollbar/coar-scrollbar.directive';
import { CoarPopoverGroupService } from './coar-popover-group.service';

/**
 * A lightweight, hover/focus popover for rich tooltip-like content.
 *
 * Uses the overlay system for positioning with automatic placement and viewport clamping.
 */
@Component({
  selector: 'coar-popover',
  standalone: true,
  imports: [CoarScrollbarDirective],
  templateUrl: './coar-popover.component.html',
  styleUrl: './coar-popover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarPopoverComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly popoverGroup = inject(CoarPopoverGroupService, { optional: true });
  private readonly overlayService = inject(CoarOverlayService);

  private static nextId = 0;
  private readonly popoverId = `coar-popover-${CoarPopoverComponent.nextId++}`;
  protected readonly panelId = `${this.popoverId}-panel`;

  private overlayRef: import('@cocoar/ui-overlay').OverlayRef | null = null;
  protected readonly isOpen = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.close();
    });
  }

  /** Disable popover behavior (still renders trigger content). */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Enable hover/focus behavior (desktop-friendly). Default: false */
  openOnHover = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Enable click/tap behavior (touch-friendly). Default: false */
  openOnClick = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether the panel should receive pointer events. Default: true */
  interactive = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** When a concrete placement is set, fall back to best-fit when it doesn't fit. Default: false */
  fallbackToBestFit = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether the panel should be clamped into the viewport. Default: true */
  clampToViewport = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** When true, the popover is "pinned" open via click and won't close on hover out. */
  protected readonly pinnedByClick = signal(false);

  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly hoveringTrigger = signal(false);
  private readonly hoveringPanel = signal(false);

  private readonly closeOnDisable = effect(() => {
    if (this.disabled()) {
      this.close();
    }
  });

  private readonly syncClampToViewport = effect(() => {
    // Applied when opening the overlay.
    void this.clampToViewport();
  });

  private readonly syncFallbackToBestFit = effect(() => {
    // Relevant for concrete placements; popover uses best-fit placement list.
    void this.fallbackToBestFit();
  });

  private readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');

  private readonly panelTemplateRef = viewChild<TemplateRef<unknown>>('panelTemplate');

  private readonly closeOnDocumentClick = fromEvent<MouseEvent>(document, 'click')
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => this.isOpen()),
      filter(() => this.openOnClick()),
      filter(() => this.pinnedByClick()),
      filter((event) => {
        const target = event.target as Node | null;
        if (!target) return false;

        const trigger = this.triggerRef()?.nativeElement ?? null;
        if (trigger && trigger.contains(target)) return false;

        const panel = document.getElementById(this.panelId);
        if (panel && panel.contains(target)) return false;

        return true;
      })
    )
    .subscribe(() => this.close());

  private openInternal(source: 'hover' | 'click'): void {
    if (this.disabled()) return;

    const trigger = this.triggerRef()?.nativeElement;
    if (!trigger) return;

    if (this.overlayRef) {
      if (source === 'click') {
        this.pinnedByClick.set(true);
      }
      return;
    }

    const template = this.panelTemplateRef();
    if (!template) return;

    // Scope-level coordination (e.g. date picker): opening one closes others.
    this.popoverGroup?.requestOpen(this.popoverId, () => this.close());

    if (source === 'click') {
      this.pinnedByClick.set(true);
    } else {
      this.pinnedByClick.set(false);
    }

    const spec = Overlay.define<Record<string, never>>((b) => {
      b.content((c) => c.fromTemplate(template));
      b.anchor({ kind: 'element', element: trigger });
      b.position({ placement: ['bottom', 'top', 'right', 'left'], offset: 6, flip: false, shift: this.clampToViewport() });
      b.scroll({ strategy: 'reposition' });
      b.dismiss({ outsideClick: false, escapeKey: true });
      b.size({ mode: 'content' });
      b.a11y({ role: 'tooltip' });
    });

    const ref = this.overlayService.open(spec, {});
    this.overlayRef = ref;
    this.isOpen.set(true);

    ref.afterClosed$.subscribe(() => {
      if (this.overlayRef !== ref) return;
      this.overlayRef = null;
      this.isOpen.set(false);
      this.pinnedByClick.set(false);
      this.popoverGroup?.notifyClosed(this.popoverId);
    });
  }

  onMouseEnter(): void {
    if (!this.openOnHover()) return;
    this.hoveringTrigger.set(true);
    this.clearCloseTimer();
    this.openInternal('hover');
  }

  onMouseLeave(): void {
    if (!this.openOnHover()) return;
    if (this.pinnedByClick()) return;
    this.hoveringTrigger.set(false);
    this.scheduleHoverClose();
  }

  onPanelMouseEnter(): void {
    if (!this.openOnHover()) return;
    this.hoveringPanel.set(true);
    this.clearCloseTimer();
  }

  onPanelMouseLeave(): void {
    if (!this.openOnHover()) return;
    if (this.pinnedByClick()) return;
    this.hoveringPanel.set(false);
    this.scheduleHoverClose();
  }

  onFocusIn(): void {
    if (!this.openOnHover()) return;
    this.openInternal('hover');
  }

  onPanelFocusIn(): void {
    if (!this.openOnHover()) return;
    this.openInternal('hover');
  }

  onTriggerClick(event: MouseEvent): void {
    if (!this.openOnClick()) return;
    if (this.disabled()) return;

    // Prevent the global document click handler from immediately closing.
    event.stopPropagation();

    if (!this.isOpen()) {
      this.openInternal('click');
      return;
    }

    // If opened via hover, treat click as "pin". If already pinned, toggle closed.
    if (!this.pinnedByClick()) {
      this.pinnedByClick.set(true);
      return;
    }

    this.close();
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    if (!this.openOnClick()) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Only toggle when the click originated from the projected trigger.
    if (!target.closest('[coarPopoverTrigger]')) return;

    this.onTriggerClick(event);
  }

  close(): void {
    if (!this.isOpen()) return;
    this.pinnedByClick.set(false);
    this.clearCloseTimer();

    const ref = this.overlayRef;
    this.overlayRef = null;
    ref?.close();

    this.isOpen.set(false);
    this.popoverGroup?.notifyClosed(this.popoverId);
  }

  onFocusOut(event: FocusEvent): void {
    if (this.pinnedByClick()) return;

    const nextTarget = event.relatedTarget as Node | null;

    // Close only when focus fully leaves the popover (trigger + panel).
    const trigger = this.triggerRef()?.nativeElement ?? null;
    const panel = document.getElementById(this.panelId);
    if ((trigger && nextTarget && trigger.contains(nextTarget)) || (panel && nextTarget && panel.contains(nextTarget))) {
      return;
    }

    this.close();
  }

  onPanelFocusOut(event: FocusEvent): void {
    this.onFocusOut(event);
  }

  private scheduleHoverClose(): void {
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => {
      if (this.pinnedByClick()) return;
      if (this.hoveringTrigger() || this.hoveringPanel()) return;
      this.close();
    }, 80);
  }

  private clearCloseTimer(): void {
    if (!this.closeTimer) return;
    clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }
}
