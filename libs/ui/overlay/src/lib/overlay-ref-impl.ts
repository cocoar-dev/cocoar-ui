import {
  ApplicationRef,
  EnvironmentInjector,
  Injector,
  TemplateRef,
  Type,
  createComponent,
  createEnvironmentInjector,
} from '@angular/core';
import { Subject } from 'rxjs';

import { COAR_OVERLAY_REF, COAR_MENU_PARENT } from './overlay-context';
import {
  computeOverlayCoordinates,
  getAnchorRect,
  getContainerRect,
  getScrollParents,
  getViewportRect,
} from './overlay-position';
import { type OverlayRef } from './overlay-ref';
import { type ContentSpec, type ResolvedOverlaySpec } from './overlay-spec';

export class CoarOverlayRef implements OverlayRef {
  private readonly afterClosedSubject = new Subject<unknown>();
  readonly afterClosed$ = this.afterClosedSubject.asObservable();

  get isClosed(): boolean {
    return this.closed;
  }

  private readonly host: HTMLElement;
  private readonly panel: HTMLElement;
  private backdropElement: HTMLElement | null = null;
  private destroyContent: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private cleanupFns: Array<() => void> = [];
  private closed = false;
  private lastResult: unknown;
  private rafPending = false;
  private presented = false;
  private closeFinalized = false;
  private readonly restoreFocusTarget: Element | null;
  private readonly children = new Set<CoarOverlayRef>();
  private hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly contentInjector: Injector;
  private readonly contentEnvironmentInjector: EnvironmentInjector;
  private readonly shouldAnimateMenu: boolean;

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly environmentInjector: EnvironmentInjector,
    private readonly spec: ResolvedOverlaySpec<unknown>,
    private readonly inputs: unknown,
    private readonly stackIndex: number,
    private readonly parent: CoarOverlayRef | null,
    private readonly onClosed: () => void
  ) {
    this.host = document.createElement('div');
    this.host.className = 'coar-overlay-host';
    this.host.setAttribute('popover', 'manual');

    this.panel = document.createElement('div');
    this.panel.className = 'coar-overlay-panel';

    // Apply custom panel class(es) if provided
    if (this.spec.panelClass) {
      const classes = Array.isArray(this.spec.panelClass)
        ? this.spec.panelClass
        : [this.spec.panelClass];
      for (const cls of classes) {
        if (cls) this.panel.classList.add(cls);
      }
    }

    this.host.appendChild(this.panel);

    this.shouldAnimateMenu = this.spec.a11y.role === 'menu';

    this.contentInjector = Injector.create({
      providers: [
        { provide: COAR_OVERLAY_REF, useValue: this },
        { provide: COAR_MENU_PARENT, useValue: this },
      ],
      parent: this.environmentInjector,
    });

    this.contentEnvironmentInjector = createEnvironmentInjector(
      [
        { provide: COAR_OVERLAY_REF, useValue: this },
        { provide: COAR_MENU_PARENT, useValue: this },
      ],
      this.environmentInjector
    );

    Object.assign(this.host.style, {
      position: 'fixed',
      inset: 'unset',
      top: '0px',
      left: '0px',
      margin: '0',
      border: 'none',
      padding: '0',
      background: 'transparent',
      overflow: 'visible',
      transform: 'translate3d(0px, 0px, 0px)',
      zIndex: `calc(var(--coar-z-overlay, 1000) + ${this.stackIndex * 2})`,
      opacity: '1',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    if (this.shouldAnimateMenu) {
      Object.assign(this.panel.style, {
        opacity: '0',
        transition: 'opacity var(--coar-duration-slower) var(--coar-ease-out)',
        willChange: 'opacity',
      } satisfies Partial<CSSStyleDeclaration>);
    }

    this.restoreFocusTarget =
      (typeof document !== 'undefined' ? document.activeElement : null) ?? null;

    if (this.parent) {
      this.parent.children.add(this);
    }
  }

  getHoverTreeDismissConfig(): { enabled?: boolean; delayMs?: number } | undefined {
    return this.spec.dismiss.hoverTree;
  }

  getPanelElement(): HTMLElement {
    return this.panel;
  }

  getRoot(): CoarOverlayRef {
    return this.parent?.getRoot() ?? this;
  }

  closeChildren(exclude?: CoarOverlayRef): void {
    for (const child of Array.from(this.children)) {
      if (child !== exclude) {
        child.closeChildren();
        child.close();
      }
    }
  }

  open(): void {
    const backdrop = this.spec.backdrop;
    if (backdrop.kind === 'modal') {
      const backdropEl = document.createElement('div');
      backdropEl.className = 'coar-overlay-backdrop';
      backdropEl.setAttribute('popover', 'manual');

      Object.assign(backdropEl.style, {
        position: 'fixed',
        inset: '0',
        margin: '0',
        border: 'none',
        padding: '0',
        overflow: 'visible',
        background: 'color-mix(in srgb, var(--coar-color-black) 40%, transparent)',
        zIndex: `calc(var(--coar-z-overlay-backdrop, 999) + ${this.stackIndex * 2})`,
      } satisfies Partial<CSSStyleDeclaration>);

      document.body.appendChild(backdropEl);
      if ('showPopover' in backdropEl) backdropEl.showPopover();
      this.backdropElement = backdropEl;

      if (backdrop.closeOnBackdropClick !== false) {
        const onClick = (e: MouseEvent) => {
          if (e.target === backdropEl) {
            this.close();
          }
        };

        backdropEl.addEventListener('click', onClick);
        this.cleanupFns.push(() => backdropEl.removeEventListener('click', onClick));
      }
    }

    const attachment = this.spec.attachment;
    const attachmentParent =
      attachment.strategy === 'parent' ? attachment.container : document.body;
    attachmentParent.appendChild(this.host);
    if ('showPopover' in this.host) this.host.showPopover();

    this.installHoverTreeDismissIfEnabled();

    this.applyA11y();

    this.destroyContent = this.renderContent(this.spec.content, this.panel, this.inputs);

    this.applySize();

    if (this.spec.focus.trap) {
      this.installFocusTrap();
    }

    this.installRepositionTriggers();
    this.updatePosition();
  }

  private installHoverTreeDismissIfEnabled(): void {
    const hoverTree = this.spec.dismiss.hoverTree;
    if (!hoverTree?.enabled) return;

    const delayMs = typeof hoverTree.delayMs === 'number' ? hoverTree.delayMs : 300;

    const onEnter = () => {
      this.cancelHoverCloseUpTree();
    };

    const onHostLeave = () => {
      this.scheduleHoverCloseUpTree(delayMs);
    };

    const onAnchorLeave = () => {
      this.scheduleHoverClose(delayMs);
    };

    this.host.addEventListener('pointerenter', onEnter);
    this.host.addEventListener('pointerleave', onHostLeave);
    this.cleanupFns.push(() => {
      this.host.removeEventListener('pointerenter', onEnter);
      this.host.removeEventListener('pointerleave', onHostLeave);
      this.cancelHoverClose();
    });

    if (this.spec.anchor.kind === 'element') {
      const el = this.spec.anchor.element;
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onAnchorLeave);
      this.cleanupFns.push(() => {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onAnchorLeave);
      });
    }
  }

  private cancelHoverClose(): void {
    if (!this.hoverCloseTimer) return;
    clearTimeout(this.hoverCloseTimer);
    this.hoverCloseTimer = null;
  }

  private cancelHoverCloseUpTree(): void {
    this.cancelHoverClose();
    this.parent?.cancelHoverCloseUpTree();
  }

  private scheduleHoverClose(delayMs: number): void {
    const hoverTree = this.spec.dismiss.hoverTree;
    if (!hoverTree?.enabled) return;

    this.cancelHoverClose();
    this.hoverCloseTimer = setTimeout(() => {
      this.hoverCloseTimer = null;
      this.close();
    }, delayMs);
  }

  private scheduleHoverCloseUpTree(delayMs: number): void {
    this.scheduleHoverClose(delayMs);
    this.parent?.scheduleHoverCloseUpTree(delayMs);
  }

  hasFocusTrap(): boolean {
    return this.spec.focus.trap === true;
  }

  isDismissable(kind: 'outsideClick' | 'escapeKey'): boolean {
    if (kind === 'outsideClick') {
      return this.spec.dismiss.outsideClick !== false;
    }

    return this.spec.dismiss.escapeKey !== false;
  }

  containsEventTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    if (this.host.contains(target)) return true;
    if (this.backdropElement?.contains(target)) return true;

    if (this.spec.anchor.kind === 'element') {
      if (this.spec.anchor.element.contains(target)) return true;
    }

    return false;
  }

  handleTabKey(event: KeyboardEvent): boolean {
    if (!this.spec.focus.trap) return false;

    const focusables = this.getFocusableElements();
    if (focusables.length === 0) {
      this.focusElement(this.host);
      return true;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const active = document.activeElement;
    const isActiveInside =
      active instanceof Node && (this.host.contains(active) || active === this.host);

    if (!isActiveInside) {
      this.focusElement(event.shiftKey ? last : first);
      return true;
    }

    if (event.shiftKey) {
      if (active === first || active === this.host) {
        this.focusElement(last);
        return true;
      }
      return false;
    }

    if (active === last) {
      this.focusElement(first);
      return true;
    }

    return false;
  }

  updatePosition(): void {
    if (this.closed) return;
    if (this.rafPending) return;
    this.rafPending = true;

    this.schedule(() => {
      this.rafPending = false;
      if (this.closed) return;

      const viewport = getViewportRect();
      const anchorRect = getAnchorRect(this.spec.anchor, viewport);

      const rect = this.host.getBoundingClientRect();
      const overlaySize = {
        width: rect.width,
        height: rect.height,
      };

      const attachment = this.spec.attachment;
      const boundaryRect =
        attachment.strategy === 'parent' ? getContainerRect(attachment.container) : undefined;

      const coords = computeOverlayCoordinates(
        anchorRect,
        overlaySize,
        this.spec.position,
        viewport,
        boundaryRect
      );
      this.host.style.transform = `translate3d(${Math.round(coords.left)}px, ${Math.round(
        coords.top
      )}px, 0px)`;
      this.present();
    });
  }

  private present(): void {
    if (this.presented) return;
    this.presented = true;

    if (this.shouldAnimateMenu) {
      void this.panel.getBoundingClientRect();
    }

    this.host.style.pointerEvents = 'auto';

    if (this.shouldAnimateMenu) {
      this.panel.style.opacity = '1';
    }
  }

  close(result?: unknown): void {
    if (this.closed) return;
    this.closed = true;
    this.lastResult = result;

    this.cancelHoverClose();

    this.closeChildren();

    for (const cleanup of this.cleanupFns) {
      cleanup();
    }
    this.cleanupFns = [];

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.shouldAnimateMenu && this.presented) {
      this.host.style.pointerEvents = 'none';
      this.panel.style.opacity = '0';

      const finalizeOnce = () => {
        this.finalizeClose();
      };

      let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

      const onEnd = (e: TransitionEvent) => {
        if (e.target === this.panel && e.propertyName === 'opacity') {
          this.host.removeEventListener('transitionend', onEnd);
          if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
          }
          finalizeOnce();
        }
      };

      this.host.addEventListener('transitionend', onEnd);

      const fallbackMs = this.getMaxTransitionTimeMs();
      if (fallbackMs === 0) {
        this.host.removeEventListener('transitionend', onEnd);
        finalizeOnce();
      } else {
        fallbackTimer = setTimeout(() => {
          this.host.removeEventListener('transitionend', onEnd);
          finalizeOnce();
        }, fallbackMs);
      }

      return;
    }

    this.finalizeClose();
  }

  private finalizeClose(): void {
    if (this.closeFinalized) return;
    this.closeFinalized = true;

    this.destroyContent?.();
    this.destroyContent = null;
    if ('hidePopover' in this.host) this.host.hidePopover();
    this.host.remove();
    if (this.backdropElement) {
      if ('hidePopover' in this.backdropElement) this.backdropElement.hidePopover();
      this.backdropElement.remove();
      this.backdropElement = null;
    }

    if (this.spec.focus.restore !== false) {
      const el = this.restoreFocusTarget as HTMLElement | null;
      if (el && typeof el.focus === 'function') {
        try {
          el.focus({ preventScroll: true });
        } catch {
          try {
            el.focus();
          } catch {
            // noop
          }
        }
      }
    }

    this.afterClosedSubject.next(this.lastResult);
    this.afterClosedSubject.complete();

    this.parent?.children.delete(this);
    this.onClosed();
  }

  private getMaxTransitionTimeMs(): number {
    if (typeof getComputedStyle === 'undefined') return 0;

    const style = getComputedStyle(this.panel);
    const durations = style.transitionDuration.split(',').map((v) => v.trim());
    const delays = style.transitionDelay.split(',').map((v) => v.trim());
    const entries = Math.max(durations.length, delays.length);

    let maxMs = 0;
    for (let i = 0; i < entries; i++) {
      const duration = durations[i] ?? durations[durations.length - 1] ?? '0ms';
      const delay = delays[i] ?? delays[delays.length - 1] ?? '0ms';
      const ms = this.parseCssTimeToMs(duration) + this.parseCssTimeToMs(delay);
      maxMs = Math.max(maxMs, ms);
    }

    return maxMs;
  }

  private parseCssTimeToMs(value: string): number {
    const v = value.trim();
    if (!v) return 0;
    if (v.endsWith('ms')) {
      const n = Number(v.slice(0, -2));
      return Number.isFinite(n) ? n : 0;
    }
    if (v.endsWith('s')) {
      const n = Number(v.slice(0, -1));
      return Number.isFinite(n) ? n * 1000 : 0;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private installFocusTrap(): void {
    this.host.tabIndex = -1;

    this.schedule(() => {
      if (this.closed) return;
      const focusables = this.getFocusableElements();
      this.focusElement(focusables[0] ?? this.host);
    });
  }

  private applySize(): void {
    const size = this.spec.size;
    if (!size) return;

    const viewport = getViewportRect();

    const resolveMin = (
      value: number | 'anchor' | undefined,
      anchorSize: number
    ): number | null => {
      if (value === 'anchor') return anchorSize;
      if (typeof value === 'number') return value;
      return null;
    };

    const resolveMax = (
      value: number | 'viewport' | undefined,
      viewportSize: number
    ): number | null => {
      if (value === 'viewport') return viewportSize;
      if (typeof value === 'number') return value;
      return null;
    };

    const anchorRect = getAnchorRect(this.spec.anchor, viewport);
    const minWidthPx = resolveMin(size.minWidth, anchorRect.width);
    const minHeightPx = resolveMin(size.minHeight, anchorRect.height);

    const maxWidthPx = resolveMax(size.maxWidth, viewport.width);
    const maxHeightPx = resolveMax(size.maxHeight, viewport.height);

    this.host.style.width = '';
    this.host.style.height = '';
    this.host.style.minWidth = '';
    this.host.style.minHeight = '';
    this.host.style.maxWidth = '';
    this.host.style.maxHeight = '';
    this.host.style.overflow = '';

    if (minWidthPx != null && minWidthPx > 0) this.host.style.minWidth = `${minWidthPx}px`;
    if (minHeightPx != null && minHeightPx > 0) this.host.style.minHeight = `${minHeightPx}px`;

    if (size.mode === 'content') {
      return;
    }

    if (size.mode === 'content-clamped') {
      if (maxWidthPx != null) this.host.style.maxWidth = `${maxWidthPx}px`;
      if (maxHeightPx != null) this.host.style.maxHeight = `${maxHeightPx}px`;
      this.host.style.overflow = 'auto';
      return;
    }

    if (maxWidthPx != null) this.host.style.width = `${maxWidthPx}px`;
    if (maxHeightPx != null) this.host.style.height = `${maxHeightPx}px`;
    this.host.style.overflow = 'auto';
  }

  private applyA11y(): void {
    const a11y = this.spec.a11y;
    if (!a11y) return;

    if (a11y.role) {
      this.host.setAttribute('role', a11y.role);
    }

    this.setAttrIfDefined('aria-label', a11y.label);
    this.setAttrIfDefined('aria-labelledby', a11y.labelledBy);
    this.setAttrIfDefined('aria-describedby', a11y.describedBy);

    if (a11y.role === 'dialog' && this.spec.backdrop.kind === 'modal') {
      this.host.setAttribute('aria-modal', 'true');
    }
  }

  private setAttrIfDefined(name: string, value: string | undefined): void {
    if (typeof value === 'string' && value.length > 0) {
      this.host.setAttribute(name, value);
      return;
    }

    this.host.removeAttribute(name);
  }

  private focusElement(el: HTMLElement): void {
    try {
      el.focus({ preventScroll: true });
    } catch {
      try {
        el.focus();
      } catch {
        // noop
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const candidates = Array.from(
      this.host.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'
      )
    );

    return candidates.filter((el) => !this.isHidden(el));
  }

  private isHidden(el: HTMLElement): boolean {
    if (el.hasAttribute('hidden')) return true;
    if (el.getAttribute('aria-hidden') === 'true') return true;
    const style = el.style;
    if (style.display === 'none' || style.visibility === 'hidden') return true;
    return false;
  }

  private installRepositionTriggers(): void {
    const strategy = this.spec.scroll.strategy;
    if (strategy === 'noop') return;

    const scrollParents =
      this.spec.anchor.kind === 'element' ? getScrollParents(this.spec.anchor.element) : [window];

    if (strategy === 'reposition') {
      const onScroll = () => this.updatePosition();
      const onResize = () => this.updatePosition();

      for (const parent of scrollParents) {
        if (parent === window) {
          window.addEventListener('scroll', onScroll, { passive: true });
          this.cleanupFns.push(() => window.removeEventListener('scroll', onScroll));
          continue;
        }

        parent.addEventListener('scroll', onScroll, { passive: true });
        this.cleanupFns.push(() => parent.removeEventListener('scroll', onScroll));
      }

      window.addEventListener('resize', onResize, { passive: true });
      this.cleanupFns.push(() => window.removeEventListener('resize', onResize));

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => this.updatePosition());
        ro.observe(this.host);
        this.resizeObserver = ro;
      }

      return;
    }

    if (strategy === 'close') {
      const onScroll = (e: Event) => {
        const target = e.target;
        if (target instanceof Node && this.host.contains(target)) return;
        this.close();
      };

      if (typeof document !== 'undefined') {
        document.addEventListener('scroll', onScroll, { passive: true, capture: true });
        this.cleanupFns.push(() =>
          document.removeEventListener('scroll', onScroll, { capture: true })
        );
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      this.cleanupFns.push(() => window.removeEventListener('scroll', onScroll));

      for (const parent of scrollParents) {
        if (parent === window) continue;
        parent.addEventListener('scroll', onScroll, { passive: true });
        this.cleanupFns.push(() => parent.removeEventListener('scroll', onScroll));
      }

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => this.updatePosition());
        ro.observe(this.host);
        this.resizeObserver = ro;
      }
    }
  }

  private schedule(fn: () => void): void {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => fn());
      return;
    }

    setTimeout(() => fn(), 0);
  }

  private renderContent<TInputs>(
    content: ContentSpec<TInputs>,
    host: HTMLElement,
    inputs: TInputs
  ): () => void {
    switch (content.kind) {
      case 'text': {
        const text = (inputs as { text: string } | null | undefined)?.text;
        if (typeof text !== 'string') {
          throw new Error('Text overlay requires inputs: { text: string }');
        }
        host.textContent = text;
        return () => {
          host.textContent = '';
        };
      }
      case 'template': {
        const template = content.template as TemplateRef<unknown> | undefined;
        if (!template) throw new Error('Template overlay requires a template');

        let templateContext = inputs as unknown as object;
        if (inputs != null && typeof inputs === 'object' && !('$implicit' in (inputs as object))) {
          templateContext = {
            ...(inputs as object),
            $implicit: inputs,
          };
        }

        const viewRef = template.createEmbeddedView(templateContext, this.contentInjector);
        this.appRef.attachView(viewRef);
        viewRef.detectChanges();

        for (const node of viewRef.rootNodes) {
          host.appendChild(node);
        }

        return () => {
          this.appRef.detachView(viewRef);
          viewRef.destroy();
        };
      }
      case 'component': {
        const component = content.component as Type<unknown> | undefined;
        if (!component) throw new Error('Component overlay requires a component');

        const componentRef = createComponent(component, {
          environmentInjector: this.contentEnvironmentInjector,
          hostElement: host,
        });

        if (inputs && typeof inputs === 'object') {
          for (const [key, value] of Object.entries(inputs as object)) {
            componentRef.setInput(key, value);
          }
        }

        this.appRef.attachView(componentRef.hostView);
        componentRef.changeDetectorRef.detectChanges();

        return () => {
          this.appRef.detachView(componentRef.hostView);
          componentRef.destroy();
        };
      }
    }
  }
}
