import {
  type A11ySpec,
  type AnchorSpec,
  type AttachmentSpec,
  type BackdropSpec,
  type ContentSpec,
  type DismissSpec,
  type FocusSpec,
  type OverlaySpec,
  type PositionSpec,
  type ScrollSpec,
  type SizeSpec,
} from './overlay-spec';
import { ContentBuilder } from './content-builder';
import { deepFreeze } from './deep-freeze';

export class OverlayBuilder<TInputs = void> {
  private readonly draft: OverlaySpec<unknown>;

  constructor(seed?: OverlaySpec<unknown>) {
    this.draft = { ...(seed ?? {}) };
  }

  backdrop(cfg?: BackdropSpec | 'none' | 'modal'): this {
    if (cfg === 'none') {
      this.draft.backdrop = { kind: 'none' };
      return this;
    }

    if (cfg === 'modal') {
      this.draft.backdrop = { kind: 'modal', closeOnBackdropClick: true };
      return this;
    }

    this.draft.backdrop = cfg;
    return this;
  }

  anchor(cfg: AnchorSpec): this {
    this.draft.anchor = cfg;
    return this;
  }

  position(cfg: PositionSpec): this {
    this.draft.position = cfg;
    return this;
  }

  size(cfg: SizeSpec): this {
    this.draft.size = cfg;
    return this;
  }

  scroll(cfg: ScrollSpec): this {
    this.draft.scroll = cfg;
    return this;
  }

  dismiss(cfg: DismissSpec): this {
    this.draft.dismiss = cfg;
    return this;
  }

  focus(cfg: FocusSpec): this {
    this.draft.focus = cfg;
    return this;
  }

  a11y(cfg: A11ySpec): this {
    this.draft.a11y = cfg;
    return this;
  }

  attachment(cfg: AttachmentSpec): this {
    this.draft.attachment = cfg;
    return this;
  }

  /**
   * Add CSS class(es) to the overlay panel element.
   * Useful for applying custom styles or size variants.
   */
  panelClass(cls: string | string[]): this {
    this.draft.panelClass = cls;
    return this;
  }

  content<TNewInputs>(
    fn: (c: ContentBuilder) => ContentSpec<TNewInputs>
  ): OverlayBuilder<TNewInputs> {
    const contentBuilder = new ContentBuilder();
    this.draft.content = fn(contentBuilder);
    return this as unknown as OverlayBuilder<TNewInputs>;
  }

  freeze(): OverlaySpec<TInputs> {
    return deepFreeze({ ...this.draft }) as OverlaySpec<TInputs>;
  }
}
