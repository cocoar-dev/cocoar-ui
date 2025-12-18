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
  CoarTabComponent,
  CoarTabGroupComponent,
  CoarTextInputComponent,
} from '@cocoar/ui-components';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

import {
  CoarOverlayService,
  Overlay,
  coarHoverMenuPreset,
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
  ],
  templateUrl: './overlay.page.html',
  styleUrl: './overlay.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  private readonly overlayService = inject(CoarOverlayService);
  private readonly destroyRef = inject(DestroyRef);

  activeTab = 'examples';

  protected readonly docsPath = '/docs/libs/ui-overlay/overview.md';

  protected readonly apiPath = '/docs/libs/ui-overlay/api.md';

  private overlayRef: OverlayRef | null = null;

  private readonly connectedTemplateRef = viewChild<TemplateRef<object>>('connectedTemplate');
  private readonly centeredTemplateRef = viewChild<TemplateRef<object>>('centeredTemplate');
  private readonly contextMenuTemplateRef =
    viewChild<TemplateRef<{ x: number; y: number }>>('contextMenuTemplate');
  private readonly submenuTemplateRef = viewChild<TemplateRef<object>>('submenuTemplate');
  private readonly resolvedMenuTemplateRef = viewChild<TemplateRef<object>>('resolvedMenuTemplate');
  private readonly parentAttachedTemplateRef =
    viewChild<TemplateRef<object>>('parentAttachedTemplate');

  private readonly nestedTestParentRef = viewChild<TemplateRef<object>>('nestedTestParent');
  private readonly nestedTestChildARef = viewChild<TemplateRef<object>>('nestedTestChildA');
  private readonly nestedTestChildBRef = viewChild<TemplateRef<object>>('nestedTestChildB');
  private readonly nestedTestChildCRef = viewChild<TemplateRef<object>>('nestedTestChildC');
  private readonly nestedTestGrandchildRef =
    viewChild<TemplateRef<{ name: string }>>('nestedTestGrandchild');

  private readonly hoverTestParentRef = viewChild<TemplateRef<object>>('hoverTestParent');
  private readonly hoverTestChildARef = viewChild<TemplateRef<object>>('hoverTestChildA');
  private readonly hoverTestChildBRef = viewChild<TemplateRef<object>>('hoverTestChildB');
  private readonly hoverTestChildCRef = viewChild<TemplateRef<object>>('hoverTestChildC');
  private readonly hoverTestGrandchildRef =
    viewChild<TemplateRef<{ name: string }>>('hoverTestGrandchild');

  private nestedTestParentOverlay: OverlayRef | null = null;
  private nestedTestChildOverlay: OverlayRef | null = null;
  private nestedTestGrandchildOverlay: OverlayRef | null = null;

  private hoverTestParentOverlay: OverlayRef | null = null;
  private hoverTestChildOverlay: OverlayRef | null = null;
  private hoverTestGrandchildOverlay: OverlayRef | null = null;
  private hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;

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

  // ===== Nested Test Methods =====

  openNestedTest(): void {
    const template = this.nestedTestParentRef();
    if (!template) return;

    const spec = Overlay.define<object>((b) => {
      b.content((c) => c.fromTemplate(template));
      b.anchor({ kind: 'virtual', placement: 'center' });
      b.position({ placement: 'bottom' });
    });

    this.nestedTestParentOverlay = this.overlayService.open(spec, {});
  }

  openChildA(button: HTMLElement): void {
    this.openChildOverlay(button, this.nestedTestChildARef());
  }

  openChildB(button: HTMLElement): void {
    this.openChildOverlay(button, this.nestedTestChildBRef());
  }

  openChildC(button: HTMLElement): void {
    this.openChildOverlay(button, this.nestedTestChildCRef());
  }

  private openChildOverlay(button: HTMLElement, template: TemplateRef<object> | undefined): void {
    if (!template || !this.nestedTestParentOverlay) return;

    const spec = Overlay.define<object>((b) => {
      b.content((c) => c.fromTemplate(template));
      b.anchor({ kind: 'element', element: button });
      b.position({ placement: 'right-start', offset: 8 });
    });

    // Create the new child
    const newChild = this.overlayService.openChild(this.nestedTestParentOverlay, spec, {});

    // Close siblings (all other children except the new one)
    this.nestedTestParentOverlay.closeChildren(newChild);

    this.nestedTestChildOverlay = newChild;
  }

  openGrandchildA1(button: HTMLElement): void {
    this.openGrandchildOverlay(button, 'Grandchild A1');
  }

  openGrandchildA2(button: HTMLElement): void {
    this.openGrandchildOverlay(button, 'Grandchild A2');
  }

  openGrandchildB1(button: HTMLElement): void {
    this.openGrandchildOverlay(button, 'Grandchild B1');
  }

  openGrandchildB2(button: HTMLElement): void {
    this.openGrandchildOverlay(button, 'Grandchild B2');
  }

  private openGrandchildOverlay(button: HTMLElement, name: string): void {
    const template = this.nestedTestGrandchildRef();
    if (!template || !this.nestedTestChildOverlay) return;

    const spec = Overlay.define<{ name: string }>((b) => {
      b.content((c) => c.fromTemplate(template));
      b.anchor({ kind: 'element', element: button });
      b.position({ placement: 'right-start', offset: 8 });
    });

    // Create the new grandchild
    const newGrandchild = this.overlayService.openChild(this.nestedTestChildOverlay, spec, {
      name,
    });

    // Close siblings (all other grandchildren except the new one)
    this.nestedTestChildOverlay.closeChildren(newGrandchild);

    this.nestedTestGrandchildOverlay = newGrandchild;
  }

  // =============================================
  // Hover-based nested overlay test (menu-like)
  // =============================================

  openHoverTest(): void {
    const template = this.hoverTestParentRef();
    if (!template) return;

    const spec = Overlay.define<object>((b: OverlayBuilder) => {
      b.content((c: ContentBuilder) => c.fromTemplate(template));
      b.anchor({ kind: 'virtual', placement: 'center' });
      b.backdrop({ kind: 'modal', closeOnBackdropClick: true });
      b.dismiss({ escapeKey: true });
    }, coarHoverMenuPreset);

    this.hoverTestParentOverlay = this.overlayService.open(spec, {});
  }

  scheduleClose(): void {
    // Cancel any existing timer when hovering over new items
    if (this.hoverCloseTimer) {
      clearTimeout(this.hoverCloseTimer);
      this.hoverCloseTimer = null;
    }
    // Delay to allow moving between menu and submenu
    // this.hoverCloseTimer = setTimeout(() => {
    //   // Close child and grandchild when leaving menu area
    //   this.hoverTestGrandchildOverlay?.close();
    //   this.hoverTestGrandchildOverlay = null;
    //   this.hoverTestChildOverlay?.close();
    //   this.hoverTestChildOverlay = null;
    // }, 300);
  }

  private cancelScheduledClose(): void {
    if (this.hoverCloseTimer) {
      clearTimeout(this.hoverCloseTimer);
      this.hoverCloseTimer = null;
    }
  }

  openHoverChildA(anchor: HTMLElement): void {
    this.cancelScheduledClose();
    this.openHoverChildOverlay(this.hoverTestParentOverlay, anchor, this.hoverTestChildARef());
  }

  openHoverChildB(anchor: HTMLElement): void {
    this.cancelScheduledClose();
    this.openHoverChildOverlay(this.hoverTestParentOverlay, anchor, this.hoverTestChildBRef());
  }

  openHoverChildC(anchor: HTMLElement): void {
    this.cancelScheduledClose();
    this.openHoverChildOverlay(this.hoverTestParentOverlay, anchor, this.hoverTestChildCRef());
  }

  private openHoverChildOverlay(
    parent: OverlayRef | null,
    anchor: HTMLElement,
    template: TemplateRef<object> | undefined
  ): void {
    if (!parent || !template) return;

    const spec = Overlay.define<object>((b: OverlayBuilder) => {
      b.content((c: ContentBuilder) => c.fromTemplate(template));
      b.anchor({ kind: 'element', element: anchor });
      b.position({ placement: 'right-start', offset: -4, flip: true });
    }, coarHoverMenuPreset);

    // Create new child first
    this.hoverTestChildOverlay = this.overlayService.openChild(parent, spec, {});
    // Then close siblings, excluding the new one
    parent.closeChildren(this.hoverTestChildOverlay);
  }

  openHoverGrandchildA1(anchor: HTMLElement): void {
    this.cancelScheduledClose();
    this.openHoverGrandchildOverlay(this.hoverTestChildOverlay, anchor, 'Subitem A1');
  }

  openHoverGrandchildA2(anchor: HTMLElement): void {
    this.cancelScheduledClose();
    this.openHoverGrandchildOverlay(this.hoverTestChildOverlay, anchor, 'Subitem A2');
  }

  openHoverGrandchildB1(anchor: HTMLElement): void {
    this.cancelScheduledClose();
    this.openHoverGrandchildOverlay(this.hoverTestChildOverlay, anchor, 'Subitem B1');
  }

  openHoverGrandchildB2(anchor: HTMLElement): void {
    this.cancelScheduledClose();
    this.openHoverGrandchildOverlay(this.hoverTestChildOverlay, anchor, 'Subitem B2');
  }

  private openHoverGrandchildOverlay(
    parent: OverlayRef | null,
    anchor: HTMLElement,
    name: string
  ): void {
    if (!parent) return;

    const template = this.hoverTestGrandchildRef();
    if (!template) return;

    const spec = Overlay.define<{ name: string }>((b: OverlayBuilder) => {
      b.content((c: ContentBuilder) => c.fromTemplate(template));
      b.anchor({ kind: 'element', element: anchor });
      b.position({ placement: 'right-start', offset: -4, flip: true });
    }, coarHoverMenuPreset);

    // Create new grandchild first
    this.hoverTestGrandchildOverlay = this.overlayService.openChild(parent, spec, { name });
    // Then close siblings, excluding the new one
    parent.closeChildren(this.hoverTestGrandchildOverlay);
  }

  private closeHoverTest(): void {
    this.cancelScheduledClose();
    this.hoverTestParentOverlay?.close();
    this.hoverTestParentOverlay = null;
    this.hoverTestChildOverlay = null;
    this.hoverTestGrandchildOverlay = null;
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
}
