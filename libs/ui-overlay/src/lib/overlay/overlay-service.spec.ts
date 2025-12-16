import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CoarOverlayService } from './overlay-service';
import { Overlay } from './overlay';
import { COAR_OVERLAY_SPEC_RESOLVERS } from './overlay-spec';

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

    for (const el of Array.from(document.body.querySelectorAll('.coar-overlay-host, .coar-overlay-backdrop'))) {
      el.remove();
    }
  });

  it('throws when opening without content', () => {
    const service = TestBed.inject(CoarOverlayService);

    expect(() => service.open({}, undefined as never)).toThrowError('OverlaySpec missing content');
  });

  it('opens and closes a text overlay', async () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
    });

    const closeSpy = vi.fn();
    const ref = service.open(spec, { text: 'Hello' });
    ref.afterClosed$.subscribe(closeSpy);

    const host = document.body.querySelector('.coar-overlay-host');
    expect(host?.textContent).toContain('Hello');

    ref.close('done');
    expect(document.body.querySelector('.coar-overlay-host')).toBeNull();

    expect(closeSpy).toHaveBeenCalledWith('done');
  });

  it('opens and closes a template overlay', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).createComponent(TestHostComponent);

    fixture.detectChanges();

    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromTemplate(fixture.componentInstance.templateRef));
    });

    const ref = service.open(spec, { text: 'From template' });

    const host = document.body.querySelector('.coar-overlay-host');
    expect(host?.textContent).toContain('From template');

    ref.close();
    expect(document.body.querySelector('.coar-overlay-host')).toBeNull();
  });

  it('opens and closes a component overlay', () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromComponent(TestOverlayComponent));
    });

    const ref = service.open(spec, { text: 'From component' } as unknown as Partial<TestOverlayComponent>);

    const host = document.body.querySelector('.coar-overlay-host');
    expect(host?.textContent).toContain('From component');

    ref.close();
    expect(document.body.querySelector('.coar-overlay-host')).toBeNull();
  });

  it("applies size.minWidth='anchor' for element-anchored overlays", () => {
    const service = TestBed.inject(CoarOverlayService);

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

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'element', element: origin });
      b.size({ mode: 'content-clamped', minWidth: 'anchor', maxHeight: 200 });
    });

    const ref = service.open(spec, { text: 'Hello' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.style.minWidth).toBe('200px');

    ref.close();
    origin.remove();
  });

  it("applies resolveSpec overrides via DI when fields are missing (e.g. default scroll strategy)", () => {
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

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'point', x: 10, y: 10 });
      // no explicit scroll spec here
    });

    service.open(spec, { text: 'Menu' });
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

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'point', x: 10, y: 10 });
      b.scroll({ strategy: 'noop' });
    });

    service.open(spec, { text: 'Noop' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    window.dispatchEvent(new Event('scroll'));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);
  });

  it('applies a11y.role and aria labels onto the host', () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.a11y({ role: 'menu', label: 'Actions', labelledBy: 'titleId', describedBy: 'descId' });
    });

    service.open(spec, { text: 'Menu' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.getAttribute('role')).toBe('menu');
    expect(host.getAttribute('aria-label')).toBe('Actions');
    expect(host.getAttribute('aria-labelledby')).toBe('titleId');
    expect(host.getAttribute('aria-describedby')).toBe('descId');
  });

  it('sets aria-modal=true for modal dialogs', () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.backdrop('modal');
      b.a11y({ role: 'dialog', label: 'Dialog' });
    });

    service.open(spec, { text: 'Dialog' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.getAttribute('role')).toBe('dialog');
    expect(host.getAttribute('aria-modal')).toBe('true');
  });

  it('closes the topmost overlay on outside pointerdown', () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
    });

    const ref1 = service.open(spec, { text: 'One' });
    const ref2 = service.open(spec, { text: 'Two' });

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
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
    });

    service.open(spec, { text: 'One' });
    service.open(spec, { text: 'Two' });

    const hosts = Array.from(document.body.querySelectorAll('.coar-overlay-host'));
    expect(hosts).toHaveLength(2);

    hosts[1].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(2);
  });

  it('closes child overlays when interacting with the parent overlay', () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'point', x: 10, y: 10 });
    });

    const parent = service.open(spec, { text: 'Parent' });
    service.openChild(parent, spec, { text: 'Child' });

    const hosts = Array.from(document.body.querySelectorAll('.coar-overlay-host')) as HTMLElement[];
    expect(hosts).toHaveLength(2);

    // Pointer down inside the parent should close its child (submenu-style behavior).
    hosts[0].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);
  });

  it('closes the full overlay tree on outside click', () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'point', x: 10, y: 10 });
    });

    const parent = service.open(spec, { text: 'Parent' });
    service.openChild(parent, spec, { text: 'Child' });

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(2);

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);
    outside.remove();
  });

  it('closes child overlays when the parent is closed', () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'point', x: 10, y: 10 });
    });

    const parent = service.open(spec, { text: 'Parent' });
    service.openChild(parent, spec, { text: 'Child' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(2);

    parent.close();
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);
  });

  it('closes the topmost overlay on Escape', () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
    });

    service.open(spec, { text: 'One' });
    service.open(spec, { text: 'Two' });

    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(2);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);
  });

  it("closes the overlay on window scroll when scroll.strategy is 'close' (point anchor)", () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'point', x: 10, y: 10 });
      b.scroll({ strategy: 'close' });
    });

    service.open(spec, { text: 'Menu' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    window.dispatchEvent(new Event('scroll'));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);
  });

  it("closes the overlay when a scroll container scrolls (point anchor + scroll.strategy 'close')", () => {
    const service = TestBed.inject(CoarOverlayService);

    const scrollParent = document.createElement('div');
    scrollParent.style.overflowY = 'auto';
    scrollParent.style.height = '100px';
    document.body.appendChild(scrollParent);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'point', x: 10, y: 10 });
      b.scroll({ strategy: 'close' });
    });

    service.open(spec, { text: 'Menu' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    scrollParent.dispatchEvent(new Event('scroll'));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);

    scrollParent.remove();
  });

  it("closes the overlay on scroll parent scroll when scroll.strategy is 'close' (element anchor)", () => {
    const service = TestBed.inject(CoarOverlayService);

    const scrollParent = document.createElement('div');
    scrollParent.style.overflowY = 'auto';
    scrollParent.style.height = '100px';

    const origin = document.createElement('button');
    origin.type = 'button';
    origin.textContent = 'Origin';
    scrollParent.appendChild(origin);
    document.body.appendChild(scrollParent);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'element', element: origin });
      b.scroll({ strategy: 'close' });
    });

    service.open(spec, { text: 'Anchored' });
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(1);

    scrollParent.dispatchEvent(new Event('scroll'));
    expect(document.body.querySelectorAll('.coar-overlay-host')).toHaveLength(0);

    scrollParent.remove();
  });

  it("applies SizeSpec in 'content-clamped' mode (maxWidth/maxHeight + overflow)", () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'point', x: 10, y: 10 });
      b.size({ mode: 'content-clamped', maxWidth: 123, maxHeight: 456 });
    });

    service.open(spec, { text: 'Clamped' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.style.maxWidth).toBe('123px');
    expect(host.style.maxHeight).toBe('456px');
    expect(host.style.overflow).toBe('auto');
  });

  it("applies SizeSpec in 'fixed' mode (width/height + overflow)", () => {
    const service = TestBed.inject(CoarOverlayService);

    const spec = Overlay.define((b) => {
      b.content((c) => c.fromText());
      b.anchor({ kind: 'point', x: 10, y: 10 });
      b.size({ mode: 'fixed', maxWidth: 111, maxHeight: 222 });
    });

    service.open(spec, { text: 'Fixed' });

    const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
    expect(host.style.width).toBe('111px');
    expect(host.style.height).toBe('222px');
    expect(host.style.overflow).toBe('auto');
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

      const service = TestBed.inject(CoarOverlayService);

      const spec = Overlay.define((b) => {
        b.content((c) => c.fromTemplate(fixture.componentInstance.templateRef));
        b.focus({ trap: true, restore: false });
      });

      service.open(spec, {});

      const host = document.body.querySelector('.coar-overlay-host') as HTMLElement;
      const first = host.querySelector('#first') as HTMLElement;
      const third = host.querySelector('#third') as HTMLElement;

      // Wrap: last -> first
      third.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(document.activeElement).toBe(first);

      // Wrap: first -> last
      first.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
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

      const service = TestBed.inject(CoarOverlayService);

      const spec = Overlay.define((b) => {
        b.content((c) => c.fromTemplate(fixture.componentInstance.templateRef));
        b.focus({ trap: true, restore: false });
      });

      service.open(spec, {});

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
