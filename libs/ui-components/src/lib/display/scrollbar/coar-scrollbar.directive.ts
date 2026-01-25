import {
  Directive,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  NgZone,
  inject,
  input,
  effect,
  booleanAttribute,
} from '@angular/core';
import { OverlayScrollbars, ClickScrollPlugin, type PartialOptions } from 'overlayscrollbars';

/**
 * Theme options for the scrollbar appearance.
 * - 'dark': Dark scrollbar theme (default)
 * - 'light': Light scrollbar theme
 */
export type CoarScrollbarTheme = 'dark' | 'light';

/**
 * Auto-hide behavior for the scrollbar.
 * - 'never': Scrollbars are always visible
 * - 'scroll': Scrollbars hide when not scrolling
 * - 'leave': Scrollbars hide when pointer leaves the element
 * - 'move': Scrollbars hide when pointer stops moving
 */
export type CoarScrollbarAutoHide = 'never' | 'scroll' | 'leave' | 'move';

/**
 * Overflow behavior for each axis.
 * - 'hidden': Content is clipped, no scrollbar
 * - 'scroll': Always show scrollbar
 * - 'visible-hidden': Content visible but no scrollbar
 * - 'visible-scroll': Content visible with scrollbar
 */
export type CoarScrollbarOverflow = 'hidden' | 'scroll' | 'visible-hidden' | 'visible-scroll';

/**
 * Directive that applies custom overlay scrollbars to an element.
 *
 * Uses OverlayScrollbars library to replace native scrollbars with
 * styleable overlay scrollbars while preserving native scroll behavior.
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <div coarScrollbar>Scrollable content</div>
 *
 * <!-- With options -->
 * <div coarScrollbar [theme]="'light'" [autoHide]="'scroll'">
 *   Scrollable content
 * </div>
 *
 * <!-- Horizontal only -->
 * <div coarScrollbar [overflowX]="'scroll'" [overflowY]="'hidden'">
 *   Horizontal scrollable content
 * </div>
 * ```
 */
@Directive({
  selector: '[coarScrollbar]',
  exportAs: 'coarScrollbar',
  standalone: true,
  host: {
    // Prevents flickering during initialization
    'data-overlayscrollbars-initialize': '',
  },
})
export class CoarScrollbarDirective implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);

  /** Theme for scrollbar appearance */
  readonly theme = input<CoarScrollbarTheme>('dark');

  /** Auto-hide behavior for scrollbars */
  readonly autoHide = input<CoarScrollbarAutoHide>('leave');

  /** Delay in ms before auto-hide triggers */
  readonly autoHideDelay = input<number>(400);

  /** Whether clicking the track scrolls to that position */
  readonly clickScroll = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Overflow behavior for x-axis */
  readonly overflowX = input<CoarScrollbarOverflow>('scroll');

  /** Overflow behavior for y-axis */
  readonly overflowY = input<CoarScrollbarOverflow>('scroll');

  /** Whether to defer initialization until browser is idle */
  readonly defer = input<boolean, unknown>(true, { transform: booleanAttribute });

  /**
   * Overscroll behavior to prevent scroll chaining to parent elements.
   * - 'auto': Default browser behavior (scroll chains to parent)
   * - 'contain': Prevents scroll chaining when reaching scroll boundaries
   * - 'none': Prevents scroll chaining and disables bounce effects
   */
  readonly overscrollBehavior = input<'auto' | 'contain' | 'none'>('auto');

  private osInstance: OverlayScrollbars | null = null;
  private initialized = false;

  constructor() {
    // Register the ClickScrollPlugin for click-to-scroll functionality
    OverlayScrollbars.plugin(ClickScrollPlugin);

    // React to input changes and update options
    effect(() => {
      // Read all inputs to track them (signals must be read to be tracked)
      this.theme();
      this.autoHide();
      this.autoHideDelay();
      this.clickScroll();
      this.overflowX();
      this.overflowY();

      if (this.osInstance && this.initialized) {
        this.osInstance.options(this.buildOptions());
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.defer()) {
      // Defer initialization to browser idle time for better performance
      this.deferInitialization();
    } else {
      this.initialize();
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  /**
   * Returns the OverlayScrollbars instance or null if not initialized.
   */
  getInstance(): OverlayScrollbars | null {
    return this.osInstance;
  }

  /**
   * Scrolls to the specified position.
   */
  scrollTo(options: { x?: number; y?: number }): void {
    const viewport = this.osInstance?.elements().viewport;
    if (viewport) {
      if (options.x !== undefined) {
        viewport.scrollLeft = options.x;
      }
      if (options.y !== undefined) {
        viewport.scrollTop = options.y;
      }
    }
  }

  /**
   * Scrolls to the bottom of the scrollable content.
   */
  scrollToBottom(): void {
    const viewport = this.osInstance?.elements().viewport;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }

  /**
   * Scrolls to the top of the scrollable content.
   */
  scrollToTop(): void {
    const viewport = this.osInstance?.elements().viewport;
    if (viewport) {
      viewport.scrollTop = 0;
    }
  }

  /**
   * Updates the scrollbar (useful after dynamic content changes).
   */
  update(): void {
    this.osInstance?.update(true);
  }

  private deferInitialization(): void {
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => this.initialize(), { timeout: 2000 });
    } else {
      setTimeout(() => this.initialize(), 0);
    }
  }

  private initialize(): void {
    // Run outside Angular zone to avoid unnecessary change detection
    this.ngZone.runOutsideAngular(() => {
      this.osInstance = OverlayScrollbars(this.elementRef.nativeElement, this.buildOptions());
      this.initialized = true;

      // Apply overscroll-behavior to the viewport element to prevent scroll chaining
      const overscroll = this.overscrollBehavior();
      if (overscroll !== 'auto') {
        const viewport = this.osInstance.elements().viewport;
        if (viewport) {
          viewport.style.overscrollBehavior = overscroll;
        }
      }
    });
  }

  private buildOptions(): PartialOptions {
    return {
      scrollbars: {
        theme: `os-theme-${this.theme()}`,
        autoHide: this.autoHide(),
        autoHideDelay: this.autoHideDelay(),
        clickScroll: this.clickScroll(),
      },
      overflow: {
        x: this.overflowX(),
        y: this.overflowY(),
      },
    };
  }

  private destroy(): void {
    this.osInstance?.destroy();
    this.osInstance = null;
    this.initialized = false;
  }
}
