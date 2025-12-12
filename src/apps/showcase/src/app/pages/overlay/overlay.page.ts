import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import {
  CoarButtonComponent,
  CoarCodeBlockComponent,
  CoarDividerComponent,
  CoarIconComponent,
  CoarNoteComponent,
  CoarTabComponent,
  CoarTabGroupComponent,
  CoarTableComponent,
  CoarTextInputComponent,
} from '@cocoar/ui-components';

import { CoarMarkdownComponent } from '@cocoar/markdown-viewer';

import { ShowcaseMarkdownDocsService } from '../../shared/services/showcase-markdown-docs.service';

import {
  CoarOverlayService,
  Overlay,
  coarMenuPreset,
  coarModalPreset,
  type ContentBuilder,
  type OverlayBuilder,
  type OverlayRef,
  type OverlaySpec,
} from '@cocoar/ui-overlay';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    CommonModule,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarButtonComponent,
    CoarTextInputComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarNoteComponent,
    CoarTableComponent,
    CoarMarkdownComponent,
    CoarIconComponent,
  ],
  templateUrl: './overlay.page.html',
  styleUrl: './overlay.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayPage {
  private readonly overlayService = inject(CoarOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly markdownDocs = inject(ShowcaseMarkdownDocsService);

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-overlay/OVERLAY.md';
  protected readonly docsState$ = this.markdownDocs.load(this.docsPath);

  private overlayRef: OverlayRef | null = null;

  private readonly connectedTemplateRef = viewChild<TemplateRef<object>>('connectedTemplate');
  private readonly centeredTemplateRef = viewChild<TemplateRef<object>>('centeredTemplate');
  private readonly contextMenuTemplateRef = viewChild<TemplateRef<{ x: number; y: number }>>(
    'contextMenuTemplate'
  );
  private readonly submenuTemplateRef = viewChild<TemplateRef<object>>('submenuTemplate');
  private readonly resolvedMenuTemplateRef = viewChild<TemplateRef<object>>('resolvedMenuTemplate');
  private readonly parentAttachedTemplateRef = viewChild<TemplateRef<object>>('parentAttachedTemplate');

  private readonly connectedOriginRef = viewChild<ElementRef<HTMLElement>>('connectedOrigin');
  private readonly resolvedMenuOriginRef = viewChild<ElementRef<HTMLElement>>('resolvedMenuOrigin');
  private readonly containerBoxRef = viewChild<ElementRef<HTMLElement>>('containerBox');
  private readonly containerTriggerRef = viewChild<ElementRef<HTMLElement>>('containerTrigger');

  protected readonly isOpen = signal(false);
  private readonly openMode = signal<'connected' | 'context-menu' | 'centered' | null>(null);

  protected readonly lastContextMenuPosition = signal<{ x: number; y: number } | null>(null);

  constructor() {
    this.destroyRef.onDestroy(() => this.close());
  }

  openConnected(): void {
    const origin = this.connectedOriginRef()?.nativeElement;
    const template = this.connectedTemplateRef();
    if (!origin || !template) return;

    this.openMode.set('connected');

    const base = Overlay.define<object>((b: OverlayBuilder) => {
      b.content((c: ContentBuilder) => c.fromTemplate(template));
      b.position({ placement: 'bottom' });
    });

    const spec = Overlay.fork(base, (b: OverlayBuilder) => {
      b.anchor({ kind: 'element', element: origin });
    });

    this.openOverlay(spec, {});
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();

    const template = this.contextMenuTemplateRef();
    if (!template) return;

    this.openMode.set('context-menu');
    this.lastContextMenuPosition.set({ x: event.clientX, y: event.clientY });

    const spec = Overlay.define<{ x: number; y: number }>((b: OverlayBuilder) => {
      b.content((c: ContentBuilder) => c.fromTemplate(template));
      b.anchor({ kind: 'point', x: event.clientX, y: event.clientY });
      b.position({ placement: 'bottom' });
    }, coarMenuPreset);

    this.openOverlay(spec, { x: event.clientX, y: event.clientY });
  }

  openSubmenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const parent = this.overlayRef;
    const template = this.submenuTemplateRef();
    const origin = event.currentTarget;
    if (!parent || !template || !(origin instanceof Element)) return;

    const spec = Overlay.define<object>((b: OverlayBuilder) => {
      b.content((c: ContentBuilder) => c.fromTemplate(template));
      b.anchor({ kind: 'element', element: origin });
      b.position({ placement: 'right', offset: 4, flip: true, shift: true });
    }, coarMenuPreset);

    this.overlayService.openChild(parent, spec, {});
  }

  openCentered(): void {
    const template = this.centeredTemplateRef();
    if (!template) return;

    this.openMode.set('centered');

    const spec = Overlay.define<object>((b: OverlayBuilder) => {
      b.content((c: ContentBuilder) => c.fromTemplate(template));
    }, coarModalPreset);

    this.openOverlay(spec, {});
  }

  openResolvedMenu(): void {
    const template = this.resolvedMenuTemplateRef();
    const origin = this.resolvedMenuOriginRef()?.nativeElement;
    if (!template || !origin) return;

    this.openMode.set('context-menu');

    // Intentionally NOT specifying scroll(...) here.
    // The page-level resolver (via DI) will default menu overlays to scroll.strategy = 'close'.
    const spec = Overlay.define<object>((b: OverlayBuilder) => {
      b.content((c: ContentBuilder) => c.fromTemplate(template));
      b.anchor({ kind: 'element', element: origin });
      b.a11y({ role: 'menu', label: 'Resolved menu' });
      b.position({ placement: 'bottom', offset: 4, flip: true, shift: true });
      b.dismiss({ outsideClick: true, escapeKey: true });
    });

    this.openOverlay(spec, {});
  }

  openParentAttached(): void {
    const template = this.parentAttachedTemplateRef();
    const container = this.containerBoxRef()?.nativeElement;
    const trigger = this.containerTriggerRef()?.nativeElement;
    if (!template || !container || !trigger) return;

    this.openMode.set('connected');

    const spec = Overlay.define<object>((b: OverlayBuilder) => {
      b.content((c: ContentBuilder) => c.fromTemplate(template));
      b.anchor({ kind: 'element', element: trigger });
      b.position({ placement: 'right', offset: 8, flip: true, shift: true });
      b.attachment({ strategy: 'parent', container });
      b.dismiss({ outsideClick: true, escapeKey: true });
    });

    this.openOverlay(spec, {});
  }

  close(): void {
    this.closeExistingOverlay();
    this.openMode.set(null);
  }

  private openOverlay<TInputs>(spec: OverlaySpec<TInputs>, inputs: TInputs): void {
    this.closeExistingOverlay();
    this.overlayRef = this.overlayService.open(spec, inputs);
    this.isOpen.set(true);
  }

  private closeExistingOverlay(): void {
    this.overlayRef?.close();
    this.overlayRef = null;
    this.isOpen.set(false);
  }

  protected readonly codeExamples = {
    defineTemplate: `const base = Overlay.define((b) => {
  b.content((c) => c.fromTemplate(tpl));
  b.position({ placement: 'bottom' });
});`,

    openConnected: `const spec = Overlay.fork(base, (b) => {
  b.anchor({ kind: 'element', element: originElement });
});

const ref = overlayService.open(spec, {});`,

    openAtPoint: `const spec = Overlay.define<{ x: number; y: number }>((b) => {
  b.content((c) => c.fromTemplate(tpl));
  b.anchor({ kind: 'point', x: event.clientX, y: event.clientY });
  b.position({ placement: 'bottom' });
}, coarMenuPreset);

const ref = overlayService.open(spec, { x: event.clientX, y: event.clientY });`,

    globalCenter: `const spec = Overlay.define((b) => {
  b.content((c) => c.fromTemplate(tpl));
}, coarModalPreset);

const ref = overlayService.open(spec, {});`,

    resolveViaDi: `// Register a resolver (app/page module providers)
{
  provide: COAR_OVERLAY_SPEC_RESOLVERS,
  multi: true,
  useValue: (spec) => {
    if (spec.scroll) return spec;
    if (spec.a11y?.role !== 'menu') return spec;
    return { ...spec, scroll: { strategy: 'close' } };
  }
}

// Then define a menu overlay WITHOUT scroll(...)
const spec = Overlay.define((b) => {
  b.a11y({ role: 'menu', label: 'Resolved menu' });
  b.anchor({ kind: 'point', x: 120, y: 120 });
  b.position({ placement: 'bottom' });
  b.content((c) => c.fromTemplate(tpl));
});

overlayService.open(spec, {});`,

    parentAttached: `// Attach overlay to a parent container with overflow:hidden
const spec = Overlay.define((b) => {
  b.content((c) => c.fromTemplate(tpl));
  b.anchor({ kind: 'element', element: trigger });
  b.position({ placement: 'right', offset: 8, flip: true, shift: true });
  b.attachment({ strategy: 'parent', container: containerEl });
});

overlayService.open(spec, {});`,

    stickyOverlay: `// A sticky overlay stays at a fixed viewport location.
// Use scroll.strategy = 'noop' and a point/virtual anchor.
const spec = Overlay.define((b) => {
  b.content((c) => c.fromText());
  b.anchor({ kind: 'point', x: 24, y: 24 });
  b.position({ placement: 'bottom', offset: 8, flip: false, shift: true });
  b.scroll({ strategy: 'noop' });
});

overlayService.open(spec, { text: 'Sticky panel' });`,

    submenu: `// Open a submenu as a child overlay.
const parentRef = overlayService.open(parentSpec, parentInputs);

const childSpec = Overlay.define((b) => {
  b.content((c) => c.fromTemplate(submenuTpl));
  b.anchor({ kind: 'element', element: menuItemEl });
  b.position({ placement: 'right', offset: 4, flip: true, shift: true });
}, coarMenuPreset);

overlayService.openChild(parentRef, childSpec, {});`,
  };

  protected readonly apiRows = [
    {
      name: 'Overlay.define((b) => ...)',
      type: 'OverlaySpec',
      description: 'Defines WHAT to render and how it should behave (anchor, position, backdrop).',
    },
    {
      name: 'overlayService.open(spec, inputs)',
      type: 'OverlayRef',
      description: 'Creates and attaches an overlay instance based on the spec and inputs/context.',
    },
    {
      name: 'Overlay.fork(base, (b) => ...)',
      type: 'OverlaySpec',
      description: 'Creates a modified spec from an existing base spec without mutation.',
    },
    {
      name: 'ref.close()',
      type: 'void',
      description: 'Closes and cleans up the overlay instance.',
    },
  ];
}
