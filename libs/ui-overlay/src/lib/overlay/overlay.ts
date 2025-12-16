import { OverlayBuilder } from './overlay-builder';
import { type OverlaySpec } from './overlay-spec';
import { type OverlayPreset } from './presets';

export class CoarOverlay {
  static define<TInputs = void>(
    fn: (b: OverlayBuilder) => void,
    ...presets: readonly OverlayPreset[]
  ): OverlaySpec<TInputs> {
    const builder = new OverlayBuilder();

    for (const preset of presets) {
      preset(builder);
    }

    fn(builder);
    return builder.freeze<TInputs>();
  }

  static fork<TInputs>(base: OverlaySpec<TInputs>, fn: (b: OverlayBuilder) => void): OverlaySpec<TInputs> {
    const builder = new OverlayBuilder(base as OverlaySpec<unknown>);
    fn(builder);
    return builder.freeze<TInputs>();
  }
}

/** Alias kept for spec parity (`Overlay.define(...)`). */
export const Overlay = CoarOverlay;
