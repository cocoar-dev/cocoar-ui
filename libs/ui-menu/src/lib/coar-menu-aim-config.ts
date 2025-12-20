import { InjectionToken } from '@angular/core';

export interface CoarMenuAimConfig {
  readonly enabled: boolean;
  /** Emits debug events consumed by the showcase to render the aim triangle overlay. */
  readonly debugEnabled: boolean;
  /** Delay before switching to a newly hovered sibling submenu when aim is detected. */
  readonly switchDelayMs: number;
  /** Maximum age of the last pointer sample used for intent detection. */
  readonly sampleMaxAgeMs: number;
}

export interface CoarMenuAimConfigProvider {
  getMenuAimConfig(): CoarMenuAimConfig;
}

export const DEFAULT_COAR_MENU_AIM_CONFIG: CoarMenuAimConfig = {
  enabled: true,
  debugEnabled: false,
  switchDelayMs: 500,
  sampleMaxAgeMs: 200,
};

export const COAR_MENU_AIM_CONFIG = new InjectionToken<CoarMenuAimConfigProvider>(
  'COAR_MENU_AIM_CONFIG'
);
