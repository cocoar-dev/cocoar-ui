import { Directive, input, inject } from '@angular/core';
import {
  COAR_MENU_AIM_CONFIG,
  DEFAULT_COAR_MENU_AIM_CONFIG,
  type CoarMenuAimConfig,
  type CoarMenuAimConfigProvider,
} from './coar-menu-aim-config';

@Directive({
  selector: '[coarMenuAimConfig]',
  standalone: true,
  providers: [{ provide: COAR_MENU_AIM_CONFIG, useExisting: CoarMenuAimConfigDirective }],
})
export class CoarMenuAimConfigDirective implements CoarMenuAimConfigProvider {
  private readonly parent = inject(COAR_MENU_AIM_CONFIG, { optional: true, skipSelf: true });

  /** Enable/disable menu-aim for this menu tree. */
  readonly aimEnabled = input<boolean | undefined>(undefined);

  /** Emit debug events for menu-aim visualization (showcase only). */
  readonly aimDebugEnabled = input<boolean | undefined>(undefined);

  /** Delay before switching to a newly hovered sibling submenu when aim is detected. */
  readonly aimSwitchDelayMs = input<number | undefined>(undefined);

  /** Maximum age of the last pointer sample used for intent detection. */
  readonly aimSampleMaxAgeMs = input<number | undefined>(undefined);

  getMenuAimConfig(): CoarMenuAimConfig {
    const base = this.parent?.getMenuAimConfig() ?? DEFAULT_COAR_MENU_AIM_CONFIG;

    return {
      enabled: this.aimEnabled() ?? base.enabled,
      debugEnabled: this.aimDebugEnabled() ?? base.debugEnabled,
      switchDelayMs: this.aimSwitchDelayMs() ?? base.switchDelayMs,
      sampleMaxAgeMs: this.aimSampleMaxAgeMs() ?? base.sampleMaxAgeMs,
    };
  }
}
