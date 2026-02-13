import { InjectionToken } from '@angular/core';
import { type OverlayRef } from './overlay-ref';

/**
 * The OverlayRef for the overlay currently rendering this content.
 *
 * Provided automatically by CoarOverlayService for overlay content so components
 * can open true child overlays without DOM lookups.
 */
export const COAR_OVERLAY_REF = new InjectionToken<OverlayRef>('COAR_OVERLAY_REF');

/**
 * Parent overlay reference for menu hierarchies.
 * Each overlay provides this token pointing to itself, enabling child menu items
 * to close siblings by calling parent.closeChildren().
 */
export const COAR_MENU_PARENT = new InjectionToken<OverlayRef | null>('COAR_MENU_PARENT');
