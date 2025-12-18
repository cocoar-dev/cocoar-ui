import { InjectionToken } from '@angular/core';
import { type OverlayRef } from './overlay-ref';

/**
 * The OverlayRef for the overlay currently rendering this content.
 *
 * Provided automatically by CoarOverlayService for overlay content so components
 * can open true child overlays without DOM lookups.
 */
export const COAR_OVERLAY_REF = new InjectionToken<OverlayRef>('COAR_OVERLAY_REF');
