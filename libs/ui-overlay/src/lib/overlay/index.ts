export * from './overlay';
export * from './overlay-builder';
export * from './content-builder';
export * from './overlay-ref';
export * from './overlay-service';
export * from './overlay-spec';
export * from './presets';
export * from './overlay-position';
export * from './overlay-context';

// Spec-friendly aliases (no change to underlying class names)
export { CoarOverlayService as OverlayService } from './overlay-service';
export {
  coarTooltipPreset as tooltipPreset,
  coarModalPreset as modalPreset,
  coarMenuPreset as menuPreset,
  coarHoverMenuPreset as hoverMenuPreset,
} from './presets';
