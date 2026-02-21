import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CoarOverlayService } from './overlay-service';
import { COAR_OVERLAY_SPEC_RESOLVERS } from './overlay-spec';
import { createOverlayBuilder } from './create-overlay-builder';
import { coarMenuPreset } from './overlay-settings';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #tpl let-text="text">
      <span class="from-template">{{ text }}</span>
    </ng-template>
  `,
})
class TestHostComponent {
  @ViewChild('tpl', { static: true })
  templateRef!: TemplateRef<{ text: string }>;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="from-component">{{ text }}</span>`,
})
class TestOverlayComponent {
  @Input() text = '';
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #tpl>
      <input id="first" />
      <button id="second" type="button">Second</button>
      <button id="third" type="button">Third</button>
    </ng-template>
  `,
})
class FocusTrapHostComponent {
  @ViewChild('tpl', { static: true })
  templateRef!: TemplateRef<unknown>;
}

describe('CoarOverlayService', () => {
  afterEach(() => {
    try {
      TestBed.inject(CoarOverlayService).closeAll();
    } catch {
      // noop
    }

    for (const el of Array.from(
      document.body.querySelectorAll('.coar-overlay-host, .coar-overlay-backdrop')
    )) {
      el.remove();
    }
  });

  it('throws when opening a text overlay without text', () => {
    const opener = TestBed.runInInjectionContext(() => createOverlayBuilder().fromText());

    expect(() => opener.open({} as { text: string })).toThrowError(
      'Text overlay requires inputs: { text: string }'
    );
  });

  it('opens and closes a text overlay', async () => {
    const service = TestBed.inject(CoarOverlayService);

    const opener = TestBed.runInInjectionContext(() => createOverlayBuilder().fromText());

    const closeSpy = vi.fn();
    const ref = opener.open({ text: 'Hello' });
    ref.afterClosed$.subscribe(closeSpy);

    const host = document.body.querySelector('.coar-overlay-host');
    expect(host?.textContent).toContain('Hello');

    ref.close('done');
    expect(document.body.querySelector('.coar-overlay-host')).toBeNull();

    expect(closeSpy).toHaveBeenCalledWith('done');
  });

  it('supports content-last builder style for template overlays', () => {
    const service = TestBed.inject(CoarOverlayService);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const builder = TestBed.runInInjectionContext(() =>
      createOverlayBuilder().anchor({ kind: 'point', x: 10, y: 10 })
    );

    const ref = TestBed.runInInjectionContext(() =>
      builder.fromTemplate(fixture.componentInstance.templateRef).open({ text: 'Hello' })
    );

    expect(document.body.querySelector('.coar-overlay-host .from-template')?.textContent).toBe(
      'Hello'
    );
    ref.close();
    service.closeAll();
  });

  it('supports providing initial settings to createOverlayBuilder', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder(coarMenuPreset).fromText()
    );
    const ref = opener.open({ text: 'Hello' });

    const host = document.body.querySelector<HTMLElement>('.coar-overlay-host');
    expect(host?.getAttribute('role')).toBe('menu');
    ref.close();

    const overridden = TestBed.runInInjectionContext(() =>
      createOverlayBuilder(coarMenuPreset).a11y({ role: 'dialog' }).fromText()
    );
    const ref2 = overridden.open({ text: 'Hello' });

    const host2 = document.body.querySelector<HTMLElement>('.coar-overlay-host');
    expect(host2?.getAttribute('role')).toBe('dialog');
    ref2.close();
  });

  it('allows shared settings to be reused regardless of content kind', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const builder = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .dismiss({ outsideClick: false, escapeKey: true })
    );

    const ref = TestBed.runInInjectionContext(() =>
      builder.fromTemplate(fixture.componentInstance.templateRef).open({ text: 'Hello' })
    );

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    outside.remove();

    // outsideClick is disabled, so the overlay should still be open.
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);
    ref.close();
  });

  it('opens and closes a template overlay', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).createComponent(TestHostComponent);

    fixture.detectChanges();

    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder().fromTemplate(fixture.componentInstance.templateRef)
    );

    const ref = opener.open({ text: 'From template' });

    const host = document.body.querySelector('.coar-overlay-host');
    expect(host?.textContent).toContain('From template');

    ref.close();
    expect(document.body.querySelector('.coar-overlay-host')).toBeNull();
  });

  it('opens and closes a component overlay', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder().fromComponent(TestOverlayComponent)
    );

    const ref = opener.open({
      text: 'From component',
    } as unknown as Partial<TestOverlayComponent>);

    const host = document.body.querySelector('.coar-overlay-host');
    expect(host?.textContent).toContain('From component');

    ref.close();
    expect(document.body.querySelector('.coar-overlay-host')).toBeNull();
  });

  it("applies size.minWidth='anchor' for element-anchored overlays", () => {
    const origin = document.createElement('button');
    document.body.appendChild(origin);
    (origin as unknown as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect = () =>
      ({
        left: 10,
        top: 10,
        right: 210,
        bottom: 30,
        width: 200,
        height: 20,
        x: 10,
        y: 10,
        toJSON: () => ({}),
      }) as unknown as DOMRect;

    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'element', element: origin })
        .size({ minWidth: 'anchor', maxHeight: 200 })
        .fromText()
    );

    const ref = opener.open({ text: 'Hello' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.style.minWidth).toBe('200px');

    ref.close();
    origin.remove();
  });

  it('applies resolveSpec overrides via DI when fields are missing (e.g. default scroll strategy)', () => {
    TestBed.resetTestingModule();

    const service = TestBed.configureTestingModule({
      providers: [
        {
          provide: COAR_OVERLAY_SPEC_RESOLVERS,
          multi: true,
          useValue: (spec: { scroll?: unknown }) => {
            // Only fill missing scroll config.
            if (spec.scroll) return spec as unknown;
            return { ...(spec as object), scroll: { strategy: 'close' } } as unknown;
          },
        },
      ],
    }).inject(CoarOverlayService);

    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder().anchor({ kind: 'point', x: 10, y: 10 }).fromText()
    );

    opener.open({ text: 'Menu' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    window.dispatchEvent(new Event('scroll'));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);
  });

  it('does not override explicit configuration in resolveSpec DI resolvers', () => {
    TestBed.resetTestingModule();

    const service = TestBed.configureTestingModule({
      providers: [
        {
          provide: COAR_OVERLAY_SPEC_RESOLVERS,
          multi: true,
          useValue: (spec: { scroll?: unknown }) => {
            // Would set close, but must not override explicit scroll config.
            if (spec.scroll) return spec as unknown;
            return { ...(spec as object), scroll: { strategy: 'close' } } as unknown;
          },
        },
      ],
    }).inject(CoarOverlayService);

    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .scroll({ strategy: 'noop' })
        .fromText()
    );

    opener.open({ text: 'Noop' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    window.dispatchEvent(new Event('scroll'));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);
  });

  it('applies a11y.role and aria labels onto the host', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .a11y({ role: 'menu', label: 'Actions', labelledBy: 'titleId', describedBy: 'descId' })
        .fromText()
    );

    opener.open({ text: 'Menu' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.getAttribute('role')).toBe('menu');
    expect(host.getAttribute('aria-label')).toBe('Actions');
    expect(host.getAttribute('aria-labelledby')).toBe('titleId');
    expect(host.getAttribute('aria-describedby')).toBe('descId');
  });

  it('sets aria-modal=true for modal dialogs', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .backdrop({ kind: 'modal' })
        .a11y({ role: 'dialog', label: 'Dialog' })
        .fromText()
    );

    opener.open({ text: 'Dialog' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.getAttribute('role')).toBe('dialog');
    expect(host.getAttribute('aria-modal')).toBe('true');
  });

  it('closes the topmost overlay on outside pointerdown', () => {
    const opener = TestBed.runInInjectionContext(() => createOverlayBuilder().fromText());

    const ref1 = opener.open({ text: 'One' });
    const ref2 = opener.open({ text: 'Two' });

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(2);

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);

    outside.remove();
    ref2.close();
    ref1.close();
  });

  it('does not close overlays when clicking inside any overlay', () => {
    const opener = TestBed.runInInjectionContext(() => createOverlayBuilder().fromText());

    opener.open({ text: 'One' });
    opener.open({ text: 'Two' });

    const hosts = Array.from(document.body.querySelectorAll('.coar-overlay-host'));
    expect(hosts).toHaveLength(2);

    hosts[1].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(2);
  });

  it('closes child overlays when interacting with the parent overlay', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder().anchor({ kind: 'point', x: 10, y: 10 }).fromText()
    );

    const parent = opener.open({ text: 'Parent' });
    opener.openAsChild(parent, { text: 'Child' });

    const hosts = Array.from(document.body.querySelectorAll('.coar-overlay-host')) as HTMLElement[];
    expect(hosts).toHaveLength(2);

    // Pointer down inside the parent should close its child (submenu-style behavior).
    hosts[0].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);
  });

  it('closes the full overlay tree on outside click', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder().anchor({ kind: 'point', x: 10, y: 10 }).fromText()
    );

    const parent = opener.open({ text: 'Parent' });
    opener.openAsChild(parent, { text: 'Child' });

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(2);

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);
    outside.remove();
  });

  it('closes child overlays when the parent is closed', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder().anchor({ kind: 'point', x: 10, y: 10 }).fromText()
    );

    const parent = opener.open({ text: 'Parent' });
    opener.openAsChild(parent, { text: 'Child' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(2);

    parent.close();
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);
  });

  it('closes the topmost overlay on Escape', () => {
    const opener = TestBed.runInInjectionContext(() => createOverlayBuilder().fromText());

    opener.open({ text: 'One' });
    opener.open({ text: 'Two' });

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(2);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);
  });

  it('inherits dismiss.hoverTree from the parent when opening a child overlay', () => {
    vi.useFakeTimers();

    const anchor = document.createElement('button');
    document.body.appendChild(anchor);

    const parentOpener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'element', element: anchor })
        .dismiss({ outsideClick: true, escapeKey: true, hoverTree: { enabled: true, delayMs: 10 } })
        .fromText()
    );

    // Child does NOT set hoverTree.
    const childOpener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .dismiss({ outsideClick: true, escapeKey: true })
        .fromText()
    );

    const parent = parentOpener.open({ text: 'Parent' });
    childOpener.openAsChild(parent, { text: 'Child' });

    const hosts = Array.from(document.body.querySelectorAll('.coar-overlay-host')) as HTMLElement[];
    expect(hosts).toHaveLength(2);

    // Leaving the child should schedule close for the child and its parents.
    hosts[1].dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(11);

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);

    anchor.remove();
    vi.useRealTimers();
  });

  it("closes the overlay on window scroll when scroll.strategy is 'close' (point anchor)", () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .scroll({ strategy: 'close' })
        .fromText()
    );

    opener.open({ text: 'Menu' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    window.dispatchEvent(new Event('scroll'));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);
  });

  it("closes the overlay when a scroll container scrolls (point anchor + scroll.strategy 'close')", () => {
    const scrollParent = document.createElement('div');
    scrollParent.style.overflowY = 'auto';
    scrollParent.style.height = '100px';
    document.body.appendChild(scrollParent);

    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .scroll({ strategy: 'close' })
        .fromText()
    );

    opener.open({ text: 'Menu' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    scrollParent.dispatchEvent(new Event('scroll'));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);

    scrollParent.remove();
  });

  it("closes the overlay on scroll parent scroll when scroll.strategy is 'close' (element anchor)", () => {
    const scrollParent = document.createElement('div');
    scrollParent.style.overflowY = 'auto';
    scrollParent.style.height = '100px';

    const origin = document.createElement('button');
    origin.type = 'button';
    origin.textContent = 'Origin';
    scrollParent.appendChild(origin);
    document.body.appendChild(scrollParent);

    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'element', element: origin })
        .scroll({ strategy: 'close' })
        .fromText()
    );

    opener.open({ text: 'Anchored' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    scrollParent.dispatchEvent(new Event('scroll'));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);

    scrollParent.remove();
  });

  it('applies SizeSpec maxWidth/maxHeight', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .size({ maxWidth: 123, maxHeight: 456 })
        .fromText()
    );

    opener.open({ text: 'Clamped' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.style.maxWidth).toBe('123px');
    expect(host.style.maxHeight).toBe('456px');
    expect(host.style.width).toBe('');
    expect(host.style.height).toBe('');
    expect(host.style.overflow).toBe('hidden');
  });

  it('supports CSS length strings in SizeSpec', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .size({ maxWidth: '90%', maxHeight: '50vh' })
        .fromText()
    );

    opener.open({ text: 'Clamped CSS' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.style.maxWidth).toBe('90%');
    expect(host.style.maxHeight).toBe('50vh');
    expect(host.style.overflow).toBe('hidden');
  });

  it('applies SizeSpec width/height', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .size({ width: 111, height: 222 })
        .fromText()
    );

    opener.open({ text: 'Fixed' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.style.width).toBe('111px');
    expect(host.style.height).toBe('222px');
    expect(host.style.overflow).toBe('hidden');
  });

  it('applies max constraints alongside width/height (CSS clamp semantics)', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .size({ width: 111, height: 222, maxWidth: 333, maxHeight: 444 })
        .fromText()
    );

    opener.open({ text: 'Fixed precedence' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.style.width).toBe('111px');
    expect(host.style.height).toBe('222px');
    expect(host.style.maxWidth).toBe('333px');
    expect(host.style.maxHeight).toBe('444px');
  });

  it('supports CSS length strings for width/height', () => {
    const opener = TestBed.runInInjectionContext(() =>
      createOverlayBuilder()
        .anchor({ kind: 'point', x: 10, y: 10 })
        .size({ width: '90vw', height: '100vh' })
        .fromText()
    );

    opener.open({ text: 'Fixed CSS' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.style.width).toBe('90vw');
    expect(host.style.height).toBe('100vh');
    expect(host.style.overflow).toBe('hidden');
  });

  it('traps focus with Tab and Shift+Tab for the topmost trapping overlay', () => {
    const originalRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }) as unknown as typeof requestAnimationFrame;

    try {
      const fixture = TestBed.configureTestingModule({
        imports: [FocusTrapHostComponent],
      }).createComponent(FocusTrapHostComponent);

      fixture.detectChanges();

      const opener = TestBed.runInInjectionContext(() =>
        createOverlayBuilder()
          .focus({ trap: true, restore: false })
          .fromTemplate(fixture.componentInstance.templateRef)
      );

      opener.open({});

      const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
      const first = host.querySelector('#first') as HTMLElement;
      const third = host.querySelector('#third') as HTMLElement;

      // Wrap: last -> first
      third.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(document.activeElement).toBe(first);

      // Wrap: first -> last
      first.focus();
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
      );
      expect(document.activeElement).toBe(third);
    } finally {
      globalThis.requestAnimationFrame = originalRaf;
    }
  });

  it('brings focus into the overlay when focus is outside and Tab is pressed', () => {
    const originalRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }) as unknown as typeof requestAnimationFrame;

    try {
      const fixture = TestBed.configureTestingModule({
        imports: [FocusTrapHostComponent],
      }).createComponent(FocusTrapHostComponent);

      fixture.detectChanges();

      const outside = document.createElement('button');
      outside.type = 'button';
      outside.textContent = 'Outside';
      document.body.appendChild(outside);

      const opener = TestBed.runInInjectionContext(() =>
        createOverlayBuilder()
          .focus({ trap: true, restore: false })
          .fromTemplate(fixture.componentInstance.templateRef)
      );

      opener.open({});

      const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
      const first = host.querySelector('#first') as HTMLElement;

      outside.focus();
      expect(document.activeElement).toBe(outside);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(document.activeElement).toBe(first);

      outside.remove();
    } finally {
      globalThis.requestAnimationFrame = originalRaf;
    }
  });
});
