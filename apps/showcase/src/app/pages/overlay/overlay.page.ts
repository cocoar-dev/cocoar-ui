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
  CoarTextInputComponent,
  CoarCardComponent,
} from '@cocoar/ui-components';

import {
  type OverlayRef,
  coarHoverMenuPreset,
  coarMenuPreset,
  coarModalPreset,
  createOverlayBuilder,
} from '@cocoar/ui-overlay';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    CoarButtonComponent,
    CoarTextInputComponent,
    CoarCodeBlockComponent,
    CoarDividerComponent,
    CoarCardComponent,
  ],
  templateUrl: './overlay.page.html',
  styleUrl: './overlay.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverlayPage {
  private readonly overlay = createOverlayBuilder();
  private readonly destroyRef = inject(DestroyRef);

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

    const base = this.overlay.position({ placement: 'bottom' });
    const opener = base.anchor({ kind: 'element', element: origin }).fromTemplate(template);
    this.openOverlay(() => opener.open({}));
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();

    const template = this.contextMenuTemplateRef();
    if (!template) return;

    this.openMode.set('context-menu');
    this.lastContextMenuPosition.set({ x: event.clientX, y: event.clientY });

    const opener = this.overlay
      .withPreset(coarMenuPreset)
      .anchor({ kind: 'point', x: event.clientX, y: event.clientY })
      .position({ placement: 'bottom' })
      .fromTemplate(template);

    this.openOverlay(() => opener.open({ x: event.clientX, y: event.clientY }));
  }

  openSubmenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const parent = this.overlayRef;
    const template = this.submenuTemplateRef();
    const origin = event.currentTarget;
    if (!parent || !template || !(origin instanceof Element)) return;

    const opener = this.overlay
      .withPreset(coarMenuPreset)
      .anchor({ kind: 'element', element: origin })
      .position({ placement: 'right', offset: 4, flip: true, shift: true })
      .fromTemplate(template);

    opener.openAsChild(parent, {});
  }

  openCentered(): void {
    const template = this.centeredTemplateRef();
    if (!template) return;

    this.openMode.set('centered');

    const opener = this.overlay.withPreset(coarModalPreset).fromTemplate(template);
    this.openOverlay(() => opener.open({}));
  }

  openResolvedMenu(): void {
    const template = this.resolvedMenuTemplateRef();
    const origin = this.resolvedMenuOriginRef()?.nativeElement;
    if (!template || !origin) return;

    this.openMode.set('context-menu');

    const opener = this.overlay
      .withPreset(coarMenuPreset)
      .anchor({ kind: 'element', element: origin })
      .a11y({ role: 'menu', label: 'Resolved menu' })
      .position({ placement: 'bottom', offset: 4, flip: true, shift: true })
      .fromTemplate(template);

    this.openOverlay(() => opener.open({}));
  }

  openParentAttached(): void {
    const template = this.parentAttachedTemplateRef();
    const container = this.containerBoxRef()?.nativeElement;
    const trigger = this.containerTriggerRef()?.nativeElement;
    if (!template || !container || !trigger) return;

    this.openMode.set('connected');

    const opener = this.overlay
      .anchor({ kind: 'element', element: trigger })
      .position({ placement: 'right', offset: 8, flip: true, shift: true })
      .attachment({ strategy: 'parent', container })
      .dismiss({ outsideClick: true, escapeKey: true })
      .fromTemplate(template);

    this.openOverlay(() => opener.open({}));
  }

  close(): void {
    this.closeExistingOverlay();
    this.openMode.set(null);
  }

  private openOverlay(open: () => OverlayRef): void {
    this.closeExistingOverlay();
    this.overlayRef = open();
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

    const opener = this.overlay
      .anchor({ kind: 'virtual', placement: 'center' })
      .position({ placement: 'bottom' })
      .fromTemplate(template);

    this.nestedTestParentOverlay = opener.open({});
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

    const opener = this.overlay
      .anchor({ kind: 'element', element: button })
      .position({ placement: 'right-start', offset: 8 })
      .fromTemplate(template);

    this.nestedTestChildOverlay = opener.openAsChild(
      this.nestedTestParentOverlay,
      {},
      { closeSiblings: true }
    );
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

    const opener = this.overlay
      .anchor({ kind: 'element', element: button })
      .position({ placement: 'right-start', offset: 8 })
      .fromTemplate(template);

    this.nestedTestGrandchildOverlay = opener.openAsChild(
      this.nestedTestChildOverlay,
      { name },
      { closeSiblings: true }
    );
  }

  // =============================================
  // Hover-based nested overlay test (menu-like)
  // =============================================

  openHoverTest(): void {
    const template = this.hoverTestParentRef();
    if (!template) return;

    const opener = this.overlay
      .withPreset(coarHoverMenuPreset)
      .anchor({ kind: 'virtual', placement: 'center' })
      .backdrop({ kind: 'modal', closeOnBackdropClick: true })
      .fromTemplate(template);

    this.hoverTestParentOverlay = opener.open({});
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

    const opener = this.overlay
      .withPreset(coarHoverMenuPreset)
      .anchor({ kind: 'element', element: anchor })
      .position({ placement: 'right-start', offset: -4, flip: true })
      .fromTemplate(template);

    this.hoverTestChildOverlay = opener.openAsChild(parent, {}, { closeSiblings: true });
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

    const opener = this.overlay
      .withPreset(coarHoverMenuPreset)
      .anchor({ kind: 'element', element: anchor })
      .position({ placement: 'right-start', offset: -4, flip: true })
      .fromTemplate(template);

    this.hoverTestGrandchildOverlay = opener.openAsChild(parent, { name }, { closeSiblings: true });
  }

  private closeHoverTest(): void {
    this.cancelScheduledClose();
    this.hoverTestParentOverlay?.close();
    this.hoverTestParentOverlay = null;
    this.hoverTestChildOverlay = null;
    this.hoverTestGrandchildOverlay = null;
  }

  protected readonly codeExamples = {
    defineTemplate: `@ViewChild('tpl') tpl!: TemplateRef<object>;

// <ng-template #tpl> ... </ng-template>`,
    openConnected: `const overlay = createOverlayBuilder().position({ placement: 'bottom' });

const ref = overlay
  .anchor({ kind: 'element', element: originElement })
  .fromTemplate(tpl)
  .open({});`,

    openAtPoint: `const ref = createOverlayBuilder()
  .withPreset(coarMenuPreset)
  .anchor({ kind: 'point', x: event.clientX, y: event.clientY })
  .position({ placement: 'bottom' })
  .fromTemplate(tpl)
  .open({ x: event.clientX, y: event.clientY });`,

    globalCenter: `const ref = createOverlayBuilder()
  .withPreset(coarModalPreset)
  .fromTemplate(tpl)
  .open({});`,

    resolveViaDi: `// app.config.ts
import { COAR_OVERLAY_SPEC_RESOLVERS, type OverlaySpec } from '@cocoar/ui-overlay';

{
  provide: COAR_OVERLAY_SPEC_RESOLVERS,
  multi: true,
  useValue: (spec: OverlaySpec<unknown>) => {
    if (spec.scroll) return spec;
    if (spec.a11y?.role !== 'menu') return spec;
    return { ...spec, scroll: { strategy: 'close' } };
  },
}`,

    parentAttached: `// Attach overlay to a parent container with overflow:hidden
const ref = createOverlayBuilder()
  .anchor({ kind: 'element', element: trigger })
  .position({ placement: 'right', offset: 8, flip: true, shift: true })
  .attachment({ strategy: 'parent', container: containerEl })
  .fromTemplate(tpl)
  .open({});`,

    stickyOverlay: `// A sticky overlay stays at a fixed viewport location.
// Use scroll.strategy = 'noop' and a point/virtual anchor.
const ref = createOverlayBuilder()
  .anchor({ kind: 'point', x: 24, y: 24 })
  .position({ placement: 'bottom', offset: 8, flip: false, shift: true })
  .scroll({ strategy: 'noop' })
  .fromText()
  .open({ text: 'Sticky panel' });`,

    submenu: `// Open a submenu as a child overlay.
const parentRef = createOverlayBuilder()
  .withPreset(coarMenuPreset)
  .fromTemplate(parentTpl)
  .open({});

createOverlayBuilder()
  .withPreset(coarMenuPreset)
  .anchor({ kind: 'element', element: menuItemEl })
  .position({ placement: 'right', offset: 4, flip: true, shift: true })
  .fromTemplate(submenuTpl)
  .openAsChild(parentRef, {});`,
  };
}
