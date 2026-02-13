import { OverlayBuilder } from './overlay-builder';
import { type OverlaySpec } from './overlay-spec';
import { type OverlayPreset } from './presets';
import { TemplateRef, Type } from '@angular/core';

export class CoarOverlay {
  static define<TInputs>(
    fn: (b: OverlayBuilder) => OverlayBuilder<TInputs>,
    ...presets: readonly OverlayPreset[]
  ): OverlaySpec<TInputs>;
  static define<TInputs = void>(
    fn: (b: OverlayBuilder) => void | OverlayBuilder<TInputs>,
    ...presets: readonly OverlayPreset[]
  ): OverlaySpec<TInputs> {
    const builder = new OverlayBuilder();

    for (const preset of presets) {
      preset(builder);
    }

    const maybeBuilder = fn(builder);
    return (maybeBuilder ?? builder).freeze() as OverlaySpec<TInputs>;
  }

  static fork<TInputs>(
    base: OverlaySpec<TInputs>,
    fn: (b: OverlayBuilder<TInputs>) => void
  ): OverlaySpec<TInputs> {
    const builder = new OverlayBuilder<TInputs>(base as OverlaySpec<unknown>);
    fn(builder);
    return builder.freeze();
  }

  /** Content-first helpers to avoid `Overlay.define<...>` for the common cases. */
  static template<TCtx>(
    template: TemplateRef<TCtx>,
    ...presets: readonly OverlayPreset[]
  ): OverlaySpec<TCtx> {
    return CoarOverlay.define((b) => b.content((c) => c.fromTemplate(template)), ...presets);
  }

  static component<C>(
    component: Type<C>,
    ...presets: readonly OverlayPreset[]
  ): OverlaySpec<Partial<C>> {
    return CoarOverlay.define((b) => b.content((c) => c.fromComponent(component)), ...presets);
  }

  static text(...presets: readonly OverlayPreset[]): OverlaySpec<{ text: string }> {
    return CoarOverlay.define((b) => b.content((c) => c.fromText()), ...presets);
  }
}

/** Alias kept for spec parity (`Overlay.define(...)`). */
export const Overlay = CoarOverlay;
