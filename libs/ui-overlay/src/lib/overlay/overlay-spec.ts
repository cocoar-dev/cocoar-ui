import { InjectionToken, TemplateRef, Type } from '@angular/core';

export interface OverlaySpec<TInputs = void> {
  content?: ContentSpec<TInputs>;
  anchor?: AnchorSpec;
  position?: PositionSpec;
  size?: SizeSpec;
  backdrop?: BackdropSpec;
  scroll?: ScrollSpec;
  dismiss?: DismissSpec;
  focus?: FocusSpec;
  a11y?: A11ySpec;
  attachment?: AttachmentSpec;
}

/**
 * Optional application-level hook to apply global overlay defaults/policies.
 *
 * Resolvers should be pure functions and must not override explicit caller configuration
 * unless the application intentionally chooses to.
 */
export type OverlaySpecResolver = (spec: OverlaySpec<unknown>) => OverlaySpec<unknown>;

/**
 * Multi-provider token. Resolvers are applied in registration order.
 */
export const COAR_OVERLAY_SPEC_RESOLVERS = new InjectionToken<readonly OverlaySpecResolver[]>(
  'COAR_OVERLAY_SPEC_RESOLVERS'
);

export type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
  | 'center';

export interface ContentSpec<TInputs> {
  kind: 'component' | 'template' | 'text';
  component?: Type<unknown>;
  template?: TemplateRef<unknown>;

  /**
   * Optional default inputs.
   * Runtime inputs provided at open() time are merged on top.
   */
  defaults?: Partial<TInputs>;
}

export type AnchorSpec =
  | { kind: 'element'; element: Element }
  | { kind: 'point'; x: number; y: number }
  | { kind: 'virtual'; placement: 'center' | 'top' | 'bottom' };

export interface PositionSpec {
  placement: Placement | readonly Placement[];
  offset?: number;
  flip?: boolean;
  shift?: boolean;
}

export interface SizeSpec {
  mode: 'content' | 'content-clamped' | 'fixed';
  minWidth?: number | 'anchor';
  minHeight?: number | 'anchor';
  maxWidth?: number | 'viewport';
  maxHeight?: number | 'viewport';
}

export type BackdropSpec =
  | { kind: 'none' }
  | {
      kind: 'modal';
      closeOnBackdropClick?: boolean;
    };

export interface ScrollSpec {
  strategy: 'noop' | 'reposition' | 'close';
}

export interface DismissSpec {
  outsideClick?: boolean;
  escapeKey?: boolean;
}

export interface FocusSpec {
  trap?: boolean;
  restore?: boolean;
}

export interface A11ySpec {
  role?: 'dialog' | 'menu' | 'tooltip' | 'listbox';
  label?: string;
  labelledBy?: string;
  describedBy?: string;
}

/**
 * Defines where the overlay element is attached in the DOM and what boundaries
 * are used for clamping/fallback calculations.
 *
 * - 'body': Attach to document.body (portal pattern), use viewport boundaries
 * - 'parent': Attach to a specific container element, use that container's boundaries
 */
export type AttachmentSpec =
  | { strategy: 'body' }
  | { strategy: 'parent'; container: HTMLElement };

export const COAR_OVERLAY_DEFAULTS = {
  anchor: { kind: 'virtual', placement: 'center' } as const satisfies AnchorSpec,
  position: {
    placement: ['top', 'bottom', 'left', 'right'] as const,
    offset: 8,
    flip: true,
    shift: true,
  } as const satisfies PositionSpec,
  backdrop: { kind: 'none' } as const satisfies BackdropSpec,
  scroll: { strategy: 'reposition' } as const satisfies ScrollSpec,
  dismiss: { outsideClick: true, escapeKey: true } as const satisfies DismissSpec,
  focus: { trap: false, restore: true } as const satisfies FocusSpec,
  a11y: {} as const satisfies A11ySpec,
  attachment: { strategy: 'body' } as const satisfies AttachmentSpec,
} as const;

export type ResolvedOverlaySpec<TInputs> = Required<Omit<OverlaySpec<TInputs>, 'content'>> &
  Pick<Required<OverlaySpec<TInputs>>, 'content'>;
