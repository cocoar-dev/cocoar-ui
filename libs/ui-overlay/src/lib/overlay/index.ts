// Public API: one way to create & open overlays.
export * from './create-overlay-builder';
export * from './overlay-settings';
export * from './overlay-ref';
export * from './overlay-context';

export { type OverlaySettings } from './overlay-service';
export {
  COAR_OVERLAY_DEFAULTS,
  COAR_OVERLAY_SPEC_RESOLVERS,
  type OverlaySpec,
  type OverlaySpecResolver,
  type AnchorSpec,
  type PositionSpec,
  type SizeSpec,
  type ScrollSpec,
  type DismissSpec,
  type BackdropSpec,
  type FocusSpec,
  type A11ySpec,
  type AttachmentSpec,
  type Placement,
} from './overlay-spec';
