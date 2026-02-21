import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

import { createOverlayBuilder, type OverlayRef, type Placement } from '@cocoar/ui/overlay';

import { CoarTooltipService } from './coar-tooltip.service';
import {
  CoarTooltipOverlayComponent,
  type CoarTooltipOverlayContent,
} from './coar-tooltip-overlay.component';

/** Tooltip placement preference - all 12 standard placements plus 'auto' for best-fit */
type TooltipPlacement =
  | 'auto'
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

@Directive({
  selector: '[coarTooltip]',
  exportAs: 'coarTooltip',
  standalone: true,
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class CoarTooltipDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly tooltipService = inject(CoarTooltipService);

  /** Tooltip content (string, TemplateRef, or Component type). */
  readonly coarTooltip = input<CoarTooltipOverlayContent | null>(null);

  /** Optional context for TemplateRef tooltips. */
  readonly coarTooltipContext = input<object | null>(null);

  /** Disable tooltip behavior. */
  readonly coarTooltipDisabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Placement preference. Default: 'top'. Use 'auto' for best-fit. */
  readonly coarTooltipPlacement = input<TooltipPlacement>('top');

  /** Delay (ms) before opening on hover/focus. Default: 0 */
  readonly coarTooltipOpenDelay = input<number, unknown>(0, { transform: numberAttribute });

  /** Delay (ms) before closing on leave/blur. Default: 0 */
  readonly coarTooltipCloseDelay = input<number, unknown>(0, { transform: numberAttribute });

  /** Whether the tooltip should be clamped into the viewport. Default: true */
  readonly coarTooltipClampToViewport = input<boolean, unknown>(true, {
    transform: booleanAttribute,
  });

  /** When placement is explicit (not auto), fall back to best-fit when it doesn't fit. Default: false */
  readonly coarTooltipFallbackToBestFit = input<boolean, unknown>(false, {
    transform: booleanAttribute,
  });

  private readonly tooltipId = `coar-tooltip-${cryptoRandomId()}`;

  private overlayRef: OverlayRef | null = null;
  private readonly overlayBuilder = createOverlayBuilder();

  private openTimerId: number | null = null;
  private closeTimerId: number | null = null;

  private openReason: 'hover' | 'focus' | null = null;

  private readonly hasContent = computed(() => {
    const value = this.coarTooltip();
    return value != null && value !== '';
  });

  constructor() {
    effect(() => {
      if (this.coarTooltipDisabled()) {
        this.close(true);
      }

      // Track these inputs so updates are observed; if an overlay is open,
      // we re-open to apply content/config changes predictably.
      this.coarTooltip();
      this.coarTooltipContext();
      this.coarTooltipPlacement();
      this.coarTooltipClampToViewport();
      this.coarTooltipFallbackToBestFit();

      const currentOpenReason = this.openReason;
      const hasOpenOverlay = this.overlayRef != null;

      // When the tooltip is open and config changes, re-open to apply changes.
      // Overlays do not support updating spec/content in-place.
      if (!this.coarTooltipDisabled() && hasOpenOverlay && currentOpenReason && this.hasContent()) {
        this.close(true);
        Promise.resolve().then(() => this.openInternal(currentOpenReason));
      }
    });

    this.destroyRef.onDestroy(() => {
      this.clearTimers();
      this.close(true);
    });
  }

  private clearTimers(): void {
    if (this.openTimerId != null) {
      window.clearTimeout(this.openTimerId);
      this.openTimerId = null;
    }
    if (this.closeTimerId != null) {
      window.clearTimeout(this.closeTimerId);
      this.closeTimerId = null;
    }
  }

  private openInternal(reason: 'hover' | 'focus'): void {
    if (this.coarTooltipDisabled()) return;
    if (!this.hasContent()) return;

    const trigger = this.elementRef.nativeElement;

    // Ensure only one tooltip at a time across the app.
    this.tooltipService.requestOpen(
      this.tooltipId,
      () => this.close(true),
      () => this.scheduleClose('hover'),
      trigger,
      reason
    );

    this.openReason = reason;

    if (this.overlayRef) {
      this.overlayRef.updatePosition();
      trigger.setAttribute('aria-describedby', this.tooltipId);
      return;
    }

    const content = this.coarTooltip();
    if (!content) return;

    const position = this.resolveOverlayPosition();

    const ref = this.overlayBuilder
      .anchor({ kind: 'element', element: trigger })
      .position(position)
      .scroll({ strategy: 'reposition' })
      .dismiss({ outsideClick: false, escapeKey: true })
      .a11y({ role: 'tooltip' })
      .fromComponent(CoarTooltipOverlayComponent)
      .open({
        tooltipId: this.tooltipId,
        content,
        context: this.coarTooltipContext(),
        contentInjector: this.injector,
      });

    this.overlayRef = ref;

    trigger.setAttribute('aria-describedby', this.tooltipId);

    ref.afterClosed$.subscribe(() => {
      if (this.overlayRef !== ref) return;
      this.overlayRef = null;
      this.openReason = null;
      trigger.removeAttribute('aria-describedby');
      this.tooltipService.notifyClosed(this.tooltipId);
    });
  }

  private resolveOverlayPosition(): {
    placement: Placement | readonly Placement[];
    offset: number;
    flip: boolean;
    shift: boolean;
  } {
    const preference = this.coarTooltipPlacement();
    const clampToViewport = this.coarTooltipClampToViewport();
    const fallbackToBestFit = this.coarTooltipFallbackToBestFit();

    if (preference === 'auto') {
      return {
        placement: ['top', 'bottom', 'left', 'right'] as const,
        offset: 6,
        flip: false,
        shift: clampToViewport,
      };
    }

    const requested = toOverlayPlacement(preference);

    if (fallbackToBestFit) {
      const candidates = ['top', 'bottom', 'left', 'right'] as const;
      const rest = candidates.filter((p) => p !== requested);

      return {
        placement: [requested, ...rest],
        offset: 6,
        flip: true,
        shift: clampToViewport,
      };
    }

    return {
      placement: requested,
      offset: 6,
      flip: false,
      shift: clampToViewport,
    };
  }

  private scheduleOpen(reason: 'hover' | 'focus'): void {
    this.clearTimers();

    const delay = Math.max(0, Number(this.coarTooltipOpenDelay()) || 0);
    if (delay === 0) {
      this.openInternal(reason);
      return;
    }

    this.openTimerId = window.setTimeout(() => {
      this.openTimerId = null;
      this.openInternal(reason);
    }, delay);
  }

  private scheduleClose(reason: 'hover' | 'focus'): void {
    if (this.openTimerId != null) {
      window.clearTimeout(this.openTimerId);
      this.openTimerId = null;
    }

    if (this.openReason !== reason) return;

    const delay = Math.max(0, Number(this.coarTooltipCloseDelay()) || 0);
    if (delay === 0) {
      this.close(true);
      return;
    }

    if (this.closeTimerId != null) return;

    this.closeTimerId = window.setTimeout(() => {
      this.closeTimerId = null;
      this.close(true);
    }, delay);
  }

  onMouseEnter(): void {
    if (this.coarTooltipDisabled()) return;

    if (this.closeTimerId != null) {
      window.clearTimeout(this.closeTimerId);
      this.closeTimerId = null;
    }

    this.scheduleOpen('hover');
  }

  onMouseLeave(): void {
    this.scheduleClose('hover');
  }

  onFocusIn(): void {
    if (this.coarTooltipDisabled()) return;

    if (this.closeTimerId != null) {
      window.clearTimeout(this.closeTimerId);
      this.closeTimerId = null;
    }

    this.scheduleOpen('focus');
  }

  onFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && this.elementRef.nativeElement.contains(nextTarget)) {
      return;
    }

    this.scheduleClose('focus');
  }

  close(immediate = false): void {
    if (immediate) {
      this.clearTimers();
    }

    this.openReason = null;

    const trigger = this.elementRef.nativeElement;
    trigger.removeAttribute('aria-describedby');

    const ref = this.overlayRef;
    if (!ref) return;

    this.overlayRef = null;
    ref.close();
    this.tooltipService.notifyClosed(this.tooltipId);
  }

  open(): void {
    const trigger = this.elementRef.nativeElement;
    const active = (
      typeof document !== 'undefined' ? document.activeElement : null
    ) as Element | null;
    const reason: 'hover' | 'focus' = active && trigger.contains(active) ? 'focus' : 'hover';
    this.clearTimers();
    this.openInternal(reason);
  }

  toggle(): void {
    if (this.overlayRef) {
      this.close(true);
      return;
    }
    this.open();
  }
}

function toOverlayPlacement(preference: Exclude<TooltipPlacement, 'auto'>): Placement {
  // Now that overlay supports all 12 placements, pass them through directly
  return preference as Placement;
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}
