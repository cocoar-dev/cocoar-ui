import { TemplateRef, Type } from '@angular/core';
import { type ContentSpec } from './overlay-spec';

export class ContentBuilder {
  fromComponent<C>(component: Type<C>): ContentSpec<Partial<C>> {
    return { kind: 'component', component };
  }

  fromTemplate<TCtx>(template: TemplateRef<TCtx>): ContentSpec<TCtx> {
    return { kind: 'template', template };
  }

  fromText(): ContentSpec<{ text: string }> {
    return { kind: 'text' };
  }
}
