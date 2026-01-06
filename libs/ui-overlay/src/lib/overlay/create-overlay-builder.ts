import { inject, TemplateRef, Type } from '@angular/core';

import { CoarOverlayService, type ComponentInputs, type OverlaySettings } from './overlay-service';
import { type OverlayRef } from './overlay-ref';

export interface OverlayChildOpenOptions {
  closeSiblings?: boolean;
}

export interface TemplateOverlayOpener<TCtx> {
  open(inputs: TCtx): OverlayRef;
  openAsChild(parent: OverlayRef, inputs: TCtx, options?: OverlayChildOpenOptions): OverlayRef;
}

export interface ComponentOverlayOpener<C> {
  open(inputs: ComponentInputs<C>): OverlayRef;
  openAsChild(
    parent: OverlayRef,
    inputs: ComponentInputs<C>,
    options?: OverlayChildOpenOptions
  ): OverlayRef;
}

export interface TextOverlayOpener {
  open(inputs: { text: string }): OverlayRef;
  openAsChild(
    parent: OverlayRef,
    inputs: { text: string },
    options?: OverlayChildOpenOptions
  ): OverlayRef;
}

export class CoarOverlayOpenBuilder {
  constructor(
    private readonly service: CoarOverlayService,
    private readonly settings: OverlaySettings<unknown> = {}
  ) {}

  fork(): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings });
  }

  backdrop(value: OverlaySettings<unknown>['backdrop']): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings, backdrop: value });
  }

  anchor(value: OverlaySettings<unknown>['anchor']): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings, anchor: value });
  }

  position(value: OverlaySettings<unknown>['position']): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings, position: value });
  }

  size(value: OverlaySettings<unknown>['size']): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings, size: value });
  }

  scroll(value: OverlaySettings<unknown>['scroll']): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings, scroll: value });
  }

  dismiss(value: OverlaySettings<unknown>['dismiss']): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings, dismiss: value });
  }

  focus(value: OverlaySettings<unknown>['focus']): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings, focus: value });
  }

  a11y(value: OverlaySettings<unknown>['a11y']): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings, a11y: value });
  }

  attachment(value: OverlaySettings<unknown>['attachment']): CoarOverlayOpenBuilder {
    return new CoarOverlayOpenBuilder(this.service, { ...this.settings, attachment: value });
  }

  /**
   * Applies baseline settings, without overriding fields already set on this builder.
   * Useful for applying a preset after you've already configured part of the builder.
   */
  withPreset(value: OverlaySettings<unknown>): CoarOverlayOpenBuilder {
    const merged: OverlaySettings<unknown> = { ...this.settings };

    merged.anchor ??= value.anchor;
    merged.position ??= value.position;
    merged.size ??= value.size;
    merged.backdrop ??= value.backdrop;
    merged.scroll ??= value.scroll;
    merged.dismiss ??= value.dismiss;
    merged.focus ??= value.focus;
    merged.a11y ??= value.a11y;
    merged.attachment ??= value.attachment;

    return new CoarOverlayOpenBuilder(this.service, merged);
  }

  fromTemplate<TCtx>(template: TemplateRef<TCtx>): TemplateOverlayOpener<TCtx> {
    const settingsSnapshot = { ...this.settings } as OverlaySettings<TCtx>;

    return {
      open: (inputs) => this.service.openTemplate(template, settingsSnapshot, inputs),
      openAsChild: (parent, inputs, options) =>
        this.service.openTemplateAsChild(parent, template, settingsSnapshot, inputs, options),
    };
  }

  fromComponent<C>(component: Type<C>): ComponentOverlayOpener<C> {
    const settingsSnapshot = { ...this.settings } as OverlaySettings<ComponentInputs<C>>;

    return {
      open: (inputs) => this.service.openComponent(component, settingsSnapshot, inputs),
      openAsChild: (parent, inputs, options) =>
        this.service.openComponentAsChild(parent, component, settingsSnapshot, inputs, options),
    };
  }

  fromText(): TextOverlayOpener {
    const settingsSnapshot = { ...this.settings } as OverlaySettings<{ text: string }>;

    return {
      open: (inputs) => this.service.openText(settingsSnapshot, inputs),
      openAsChild: (parent, inputs, options) =>
        this.service.openTextAsChild(parent, settingsSnapshot, inputs, options),
    };
  }
}

/**
 * Content-last overlay builder (configure shared overlay settings once).
 *
 * Intended usage:
 *
 * ```ts
 * const overlay = createOverlayBuilder()
 *   .anchor({ kind: 'element', element })
 *   .position({ placement: 'bottom-start', offset: 4, flip: true, shift: true });
 *
 * overlay.fromTemplate(tpl).open({ $implicit: data });
 * overlay.fromComponent(MyCmp).open({ text: 'Hello' });
 * ```
 *
 * You can also provide initial settings:
 *
 * ```ts
 * const overlay = createOverlayBuilder(coarMenuPreset);
 * ```
 */
export function createOverlayBuilder(): CoarOverlayOpenBuilder;
export function createOverlayBuilder(initial: OverlaySettings<unknown>): CoarOverlayOpenBuilder;
export function createOverlayBuilder(
  ...initial: OverlaySettings<unknown>[]
): CoarOverlayOpenBuilder {
  const service = inject(CoarOverlayService);

  if (initial.length === 0) {
    return new CoarOverlayOpenBuilder(service);
  }

  const merged: OverlaySettings<unknown> = Object.assign({}, ...initial);
  return new CoarOverlayOpenBuilder(service, merged);
}
