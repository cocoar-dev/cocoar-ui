import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  TemplateRef,
  Type,
  inject,
} from '@angular/core';
import {
  COAR_OVERLAY_DEFAULTS,
  COAR_OVERLAY_SPEC_RESOLVERS,
  type ContentSpec,
  type OverlaySpec,
  type OverlaySpecResolver,
  type ResolvedOverlaySpec,
} from './overlay-spec';
import { type OverlayRef } from './overlay-ref';
import { CoarOverlayRef } from './overlay-ref-impl';

export interface OverlayOpenOptions {
  closeSiblings?: boolean;
}

export type OverlaySettings<TInputs> = Omit<OverlaySpec<TInputs>, 'content'>;

type UnwrapInputSignal<T> = T extends import('@angular/core').InputSignal<infer V> ? V : T;

export type ComponentInputs<C> = {
  [K in keyof C]?: UnwrapInputSignal<C[K]>;
};

export interface OverlayAsChildOptions {
  closeSiblings?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CoarOverlayService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  private readonly specResolvers =
    inject(COAR_OVERLAY_SPEC_RESOLVERS, { optional: true }) ??
    ([] as const satisfies readonly OverlaySpecResolver[]);

  private readonly openOverlays = new Set<CoarOverlayRef>();

  private globalListenersInstalled = false;

  private readonly onDocumentPointerDown = (event: PointerEvent) => {
    const overlays = this.getOpenOverlaysInOrder();
    if (overlays.length === 0) return;

    const target = event.target;
    const topmostContaining = this.getTopmostOverlayContainingTarget(target);
    if (topmostContaining) {
      // When interacting with an overlay, close any child overlays (submenus) that may be open.
      topmostContaining.closeChildren();
      return;
    }

    const topmost = this.getTopmostDismissableOverlay('outsideClick');
    if (!topmost) return;

    // For overlay trees (e.g. menus + submenus), outside-click should close the entire tree.
    const root = topmost.getRoot();
    if (root !== topmost && root.isDismissable('outsideClick')) {
      root.close();
      return;
    }

    topmost.close();
  };

  private readonly onDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const topmost = this.getTopmostDismissableOverlay('escapeKey');
      if (!topmost) return;

      event.preventDefault();
      event.stopPropagation();
      topmost.close();
      return;
    }

    if (event.key === 'Tab') {
      const topmost = this.getTopmostFocusTrappingOverlay();
      if (!topmost) return;

      if (topmost.handleTabKey(event)) {
        event.preventDefault();
      }
    }
  };

  openTemplate<TCtx>(
    template: TemplateRef<TCtx>,
    settings: OverlaySettings<TCtx>,
    inputs: TCtx
  ): OverlayRef {
    const resolved = this.resolveSpec({
      ...settings,
      content: { kind: 'template', template },
    });

    return this.attach(resolved, inputs, undefined);
  }

  openComponent<C>(
    component: Type<C>,
    settings: OverlaySettings<ComponentInputs<C>>,
    inputs: ComponentInputs<C>
  ): OverlayRef {
    const resolved = this.resolveSpec({
      ...settings,
      content: { kind: 'component', component },
    });

    return this.attach(resolved, inputs, undefined);
  }

  openText(settings: OverlaySettings<{ text: string }>, inputs: { text: string }): OverlayRef {
    const resolved = this.resolveSpec({
      ...settings,
      content: { kind: 'text' },
    });

    return this.attach(resolved, inputs, undefined);
  }

  openTemplateAsChild<TCtx>(
    parent: OverlayRef,
    template: TemplateRef<TCtx>,
    settings: OverlaySettings<TCtx>,
    inputs: TCtx,
    options?: OverlayOpenOptions
  ): OverlayRef {
    const resolved = this.resolveSpec({
      ...settings,
      content: { kind: 'template', template },
    });

    return this.attach(resolved, inputs, { parent, closeSiblings: options?.closeSiblings });
  }

  openComponentAsChild<C>(
    parent: OverlayRef,
    component: Type<C>,
    settings: OverlaySettings<ComponentInputs<C>>,
    inputs: ComponentInputs<C>,
    options?: OverlayOpenOptions
  ): OverlayRef {
    const resolved = this.resolveSpec({
      ...settings,
      content: { kind: 'component', component },
    });

    return this.attach(resolved, inputs, { parent, closeSiblings: options?.closeSiblings });
  }

  openTextAsChild(
    parent: OverlayRef,
    settings: OverlaySettings<{ text: string }>,
    inputs: { text: string },
    options?: OverlayOpenOptions
  ): OverlayRef {
    const resolved = this.resolveSpec({
      ...settings,
      content: { kind: 'text' },
    });

    return this.attach(resolved, inputs, { parent, closeSiblings: options?.closeSiblings });
  }

  closeAll(): void {
    for (const ref of Array.from(this.openOverlays)) {
      ref.close();
    }
  }

  private resolveSpec<TInputs>(spec: OverlaySpec<TInputs>): ResolvedOverlaySpec<TInputs> {
    const resolvedSpec = this.applySpecResolvers(spec);

    const content = resolvedSpec.content;
    if (!content) {
      throw new Error('OverlaySpec missing content');
    }

    return {
      content,
      anchor: resolvedSpec.anchor ?? COAR_OVERLAY_DEFAULTS.anchor,
      position: resolvedSpec.position ?? COAR_OVERLAY_DEFAULTS.position,
      size: resolvedSpec.size,
      backdrop: resolvedSpec.backdrop ?? COAR_OVERLAY_DEFAULTS.backdrop,
      scroll: resolvedSpec.scroll ?? COAR_OVERLAY_DEFAULTS.scroll,
      dismiss: resolvedSpec.dismiss ?? COAR_OVERLAY_DEFAULTS.dismiss,
      focus: resolvedSpec.focus ?? COAR_OVERLAY_DEFAULTS.focus,
      a11y: resolvedSpec.a11y ?? COAR_OVERLAY_DEFAULTS.a11y,
      attachment: resolvedSpec.attachment ?? COAR_OVERLAY_DEFAULTS.attachment,
      panelClass: resolvedSpec.panelClass,
    };
  }

  private applySpecResolvers<TInputs>(spec: OverlaySpec<TInputs>): OverlaySpec<TInputs> {
    if (this.specResolvers.length === 0) return spec;

    let current = spec as unknown as OverlaySpec<unknown>;
    for (const resolver of this.specResolvers) {
      const next = resolver(current);
      current = (next ?? current) as OverlaySpec<unknown>;
    }

    return current as unknown as OverlaySpec<TInputs>;
  }

  private attach<TInputs>(
    spec: ResolvedOverlaySpec<TInputs>,
    inputs: TInputs,
    options?: { parent?: OverlayRef; closeSiblings?: boolean }
  ): OverlayRef {
    const parent = this.getInternalRefOrNull(options?.parent);

    // Close sibling overlays if requested (close all existing children of parent)
    if (options?.closeSiblings && parent) {
      parent.closeChildren();
    }

    const stackIndex = this.openOverlays.size;

    const effectiveSpec = this.inheritDismissFromParent(spec, parent);

    const ref = new CoarOverlayRef(
      this.appRef,
      this.environmentInjector,
      effectiveSpec,
      this.mergeInputs(spec.content, inputs),
      stackIndex,
      parent,
      () => {
        this.openOverlays.delete(ref);
        this.uninstallGlobalListenersIfIdle();
      }
    );

    this.openOverlays.add(ref);
    this.installGlobalListenersIfNeeded();
    ref.open();
    return ref;
  }

  private inheritDismissFromParent<TInputs>(
    spec: ResolvedOverlaySpec<TInputs>,
    parent: CoarOverlayRef | null
  ): ResolvedOverlaySpec<TInputs> {
    if (!parent) return spec;

    const parentHoverTree = parent.getHoverTreeDismissConfig();
    if (!parentHoverTree?.enabled) return spec;

    const childHoverTree = spec.dismiss.hoverTree;

    // Explicit disable in child wins.
    if (childHoverTree?.enabled === false) return spec;

    let mergedHoverTree: typeof childHoverTree;
    if (!childHoverTree) {
      mergedHoverTree = { ...parentHoverTree };
    } else {
      mergedHoverTree = {
        enabled: true,
        delayMs: childHoverTree.delayMs ?? parentHoverTree.delayMs,
      };
    }

    // No change.
    if (mergedHoverTree === childHoverTree) return spec;

    return {
      ...(spec as unknown as object),
      dismiss: {
        ...(spec.dismiss as object),
        hoverTree: mergedHoverTree,
      },
    } as ResolvedOverlaySpec<TInputs>;
  }

  private getInternalRefOrNull(ref: OverlayRef | undefined): CoarOverlayRef | null {
    if (!ref) return null;
    if (ref instanceof CoarOverlayRef) return ref;
    return null;
  }

  private installGlobalListenersIfNeeded(): void {
    if (this.globalListenersInstalled) return;
    if (typeof document === 'undefined') return;

    document.addEventListener('pointerdown', this.onDocumentPointerDown, { capture: true });
    document.addEventListener('keydown', this.onDocumentKeyDown, { capture: true });
    this.globalListenersInstalled = true;
  }

  private uninstallGlobalListenersIfIdle(): void {
    if (!this.globalListenersInstalled) return;
    if (this.openOverlays.size > 0) return;
    if (typeof document === 'undefined') return;

    document.removeEventListener('pointerdown', this.onDocumentPointerDown, { capture: true });
    document.removeEventListener('keydown', this.onDocumentKeyDown, { capture: true });
    this.globalListenersInstalled = false;
  }

  private getOpenOverlaysInOrder(): CoarOverlayRef[] {
    return Array.from(this.openOverlays);
  }

  private getTopmostOverlayContainingTarget(target: EventTarget | null): CoarOverlayRef | null {
    const overlays = this.getOpenOverlaysInOrder();

    for (let i = overlays.length - 1; i >= 0; i -= 1) {
      const overlay = overlays[i];
      if (overlay.containsEventTarget(target)) return overlay;
    }

    return null;
  }

  private getTopmostDismissableOverlay(kind: 'outsideClick' | 'escapeKey'): CoarOverlayRef | null {
    const overlays = this.getOpenOverlaysInOrder();

    for (let i = overlays.length - 1; i >= 0; i -= 1) {
      const overlay = overlays[i];
      if (overlay.isDismissable(kind)) {
        return overlay;
      }
    }

    return null;
  }

  private getTopmostFocusTrappingOverlay(): CoarOverlayRef | null {
    const overlays = this.getOpenOverlaysInOrder();

    for (let i = overlays.length - 1; i >= 0; i -= 1) {
      const overlay = overlays[i];
      if (overlay.hasFocusTrap()) {
        return overlay;
      }
    }

    return null;
  }

  private mergeInputs<TInputs>(content: ContentSpec<TInputs>, inputs: TInputs): TInputs {
    if (!content.defaults) return inputs;

    if (inputs == null || typeof inputs !== 'object') {
      return { ...(content.defaults as object) } as TInputs;
    }

    return {
      ...(content.defaults as object),
      ...(inputs as object),
    } as TInputs;
  }
}
