import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoarMenuItemComponent, CoarMenuItemClickEvent } from './coar-menu-item.component';
import { COAR_MENU_PARENT } from '@cocoar/ui/overlay';
import type { OverlayRef } from '@cocoar/ui/overlay';
import { vi } from 'vitest';

describe('CoarMenuItemComponent', () => {
  let fixture: ComponentFixture<CoarMenuItemComponent>;
  let component: CoarMenuItemComponent;

  function getIconElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-menu-item__icon');
  }

  function getLabelElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-menu-item__label');
  }

  function createMockOverlayRef(): OverlayRef {
    const rootOverlay: OverlayRef = {
      close: vi.fn(),
      updatePosition: vi.fn(),
      closeChildren: vi.fn(),
      afterClosed$: {} as never,
      isClosed: false,
      getRoot() {
        return rootOverlay;
      },
    };
    return {
      close: vi.fn(),
      updatePosition: vi.fn(),
      closeChildren: vi.fn(),
      afterClosed$: {} as never,
      isClosed: false,
      getRoot: vi.fn(() => rootOverlay),
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarMenuItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarMenuItemComponent);
    component = fixture.componentInstance;
  });

  describe('Rendering', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render label from input', () => {
      fixture.componentRef.setInput('label', 'Save');
      fixture.detectChanges();

      const label = getLabelElement();
      expect(label?.textContent?.trim()).toBe('Save');
    });

    it('should render projected content when no label input', () => {
      const contentNode = document.createTextNode('Projected Text');
      fixture.nativeElement.querySelector('.coar-menu-item__label')?.appendChild(contentNode);
      fixture.detectChanges();

      const label = getLabelElement();
      expect(label?.textContent?.trim()).toContain('Projected Text');
    });

    it('should render icon element', () => {
      fixture.componentRef.setInput('icon', 'copy');
      fixture.detectChanges();

      const icon = getIconElement();
      expect(icon).toBeTruthy();
      const coarIcon = icon?.querySelector('coar-icon');
      expect(coarIcon?.getAttribute('icon-name')).toBe('copy');
    });

    it('should render placeholder icon when no icon specified', () => {
      fixture.detectChanges();

      const icon = getIconElement();
      const coarIcon = icon?.querySelector('coar-icon');
      expect(coarIcon?.getAttribute('icon-name')).toBe('square-rounded-dashed');
    });
  });

  describe('Interaction', () => {
    it('should emit itemClick on click', () => {
      fixture.detectChanges();
      let emitted: CoarMenuItemClickEvent | undefined;
      component.itemClick.subscribe((e) => (emitted = e));

      fixture.nativeElement.click();

      expect(emitted).toBeDefined();
      expect(emitted!.event).toBeInstanceOf(MouseEvent);
    });

    it('should emit itemClick on Enter key', () => {
      fixture.detectChanges();
      let emitted = false;
      component.itemClick.subscribe(() => (emitted = true));

      fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(emitted).toBe(true);
    });

    it('should emit itemClick on Space key', () => {
      fixture.detectChanges();
      let emitted = false;
      component.itemClick.subscribe(() => (emitted = true));

      fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

      expect(emitted).toBe(true);
    });

    it('should emit itemHover on mouseenter', () => {
      fixture.detectChanges();
      let emitted = false;
      component.itemHover.subscribe(() => (emitted = true));

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));

      expect(emitted).toBe(true);
    });

    it('should not emit itemClick when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      let emitted = false;
      component.itemClick.subscribe(() => (emitted = true));

      fixture.nativeElement.click();

      expect(emitted).toBe(false);
    });

    it('should not emit itemHover when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      let emitted = false;
      component.itemHover.subscribe(() => (emitted = true));

      fixture.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));

      expect(emitted).toBe(false);
    });

    it('should stop propagation on click', () => {
      fixture.detectChanges();
      const event = new MouseEvent('click', { bubbles: true });
      const stopSpy = vi.spyOn(event, 'stopPropagation');

      fixture.nativeElement.dispatchEvent(event);

      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('keepMenuOpen', () => {
    it('should NOT close overlay when keepMenuOpen() is called', async () => {
      const mockOverlay = createMockOverlayRef();

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CoarMenuItemComponent],
        providers: [{ provide: COAR_MENU_PARENT, useValue: mockOverlay }],
      }).compileComponents();

      fixture = TestBed.createComponent(CoarMenuItemComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.itemClick.subscribe((e: CoarMenuItemClickEvent) => {
        e.keepMenuOpen();
      });

      fixture.nativeElement.click();

      // Wait for any potential microtasks
      await new Promise<void>((resolve) => queueMicrotask(resolve));

      expect(mockOverlay.getRoot).not.toHaveBeenCalled();
    });
  });

  describe('Close overlay', () => {
    it('should close root overlay on click via queueMicrotask', async () => {
      const mockOverlay = createMockOverlayRef();

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CoarMenuItemComponent],
        providers: [{ provide: COAR_MENU_PARENT, useValue: mockOverlay }],
      }).compileComponents();

      fixture = TestBed.createComponent(CoarMenuItemComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      fixture.nativeElement.click();

      // close happens in a microtask
      await new Promise<void>((resolve) => queueMicrotask(resolve));

      const rootOverlay = mockOverlay.getRoot();
      expect(mockOverlay.getRoot).toHaveBeenCalled();
      expect(rootOverlay.close).toHaveBeenCalled();
    });

    it('should close root overlay on keyboard activate', async () => {
      const mockOverlay = createMockOverlayRef();

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CoarMenuItemComponent],
        providers: [{ provide: COAR_MENU_PARENT, useValue: mockOverlay }],
      }).compileComponents();

      fixture = TestBed.createComponent(CoarMenuItemComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      await new Promise<void>((resolve) => queueMicrotask(resolve));

      expect(mockOverlay.getRoot).toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
    });

    it('should add disabled CSS class', () => {
      expect(fixture.nativeElement.classList.contains('coar-menu-item--disabled')).toBe(true);
    });

    it('should set aria-disabled attribute', () => {
      expect(fixture.nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should set tabindex to -1', () => {
      expect(fixture.nativeElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should prevent click when disabled', () => {
      const event = new MouseEvent('click', { cancelable: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');

      fixture.nativeElement.dispatchEvent(event);

      expect(preventSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have role="menuitem"', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('role')).toBe('menuitem');
    });

    it('should be focusable (tabindex=0) when not disabled', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('tabindex')).toBe('0');
    });
  });
});
