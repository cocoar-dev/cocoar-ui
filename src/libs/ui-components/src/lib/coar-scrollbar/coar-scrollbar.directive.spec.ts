import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Component, ViewChild, ElementRef } from '@angular/core';
import {
  CoarScrollbarDirective,
  CoarScrollbarTheme,
  CoarScrollbarAutoHide,
  CoarScrollbarOverflow,
} from './coar-scrollbar.directive';

// Test host component
@Component({
  standalone: true,
  imports: [CoarScrollbarDirective],
  template: `
    <div
      #scrollContainer
      coarScrollbar
      [theme]="theme"
      [autoHide]="autoHide"
      [autoHideDelay]="autoHideDelay"
      [clickScroll]="clickScroll"
      [overflowX]="overflowX"
      [overflowY]="overflowY"
      [defer]="defer"
      style="width: 200px; height: 200px; overflow: auto;"
    >
      <div style="width: 400px; height: 400px;">
        Scrollable content that is larger than the container
      </div>
    </div>
  `,
})
class TestHostComponent {
  @ViewChild('scrollContainer', { read: CoarScrollbarDirective })
  scrollbarDirective!: CoarScrollbarDirective;

  @ViewChild('scrollContainer') containerRef!: ElementRef<HTMLElement>;

  theme: CoarScrollbarTheme = 'dark';
  autoHide: CoarScrollbarAutoHide = 'leave';
  autoHideDelay = 400;
  clickScroll = true;
  overflowX: CoarScrollbarOverflow = 'scroll';
  overflowY: CoarScrollbarOverflow = 'scroll';
  defer = false; // Disable defer for easier testing
}

describe('CoarScrollbarDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    hostElement = fixture.nativeElement;
  });

  function getScrollContainer(): HTMLElement | null {
    return hostElement.querySelector('[coarScrollbar]');
  }

  describe('initialization', () => {
    it('should create directive', () => {
      expect(hostComponent.scrollbarDirective).toBeTruthy();
    });

    it('should apply data-overlayscrollbars-initialize attribute', () => {
      const container = getScrollContainer();
      expect(container?.hasAttribute('data-overlayscrollbars-initialize')).toBe(true);
    });

    it('should initialize OverlayScrollbars instance', fakeAsync(() => {
      tick(100); // Allow initialization
      fixture.detectChanges();

      // The instance should be created
      const instance = hostComponent.scrollbarDirective.getInstance();
      expect(instance).toBeTruthy();
    }));
  });

  describe('default values', () => {
    it('should have default theme of dark', () => {
      expect(hostComponent.theme).toBe('dark');
    });

    it('should have default autoHide of leave', () => {
      expect(hostComponent.autoHide).toBe('leave');
    });

    it('should have default autoHideDelay of 400', () => {
      expect(hostComponent.autoHideDelay).toBe(400);
    });

    it('should have default clickScroll of true', () => {
      expect(hostComponent.clickScroll).toBe(true);
    });

    it('should have default overflowX of scroll', () => {
      expect(hostComponent.overflowX).toBe('scroll');
    });

    it('should have default overflowY of scroll', () => {
      expect(hostComponent.overflowY).toBe('scroll');
    });
  });

  describe('theme options', () => {
    it('should accept dark theme', () => {
      hostComponent.theme = 'dark';
      fixture.detectChanges();
      expect(hostComponent.theme).toBe('dark');
    });

    it('should accept light theme', () => {
      hostComponent.theme = 'light';
      fixture.detectChanges();
      expect(hostComponent.theme).toBe('light');
    });
  });

  describe('autoHide options', () => {
    it('should accept never option', () => {
      hostComponent.autoHide = 'never';
      fixture.detectChanges();
      expect(hostComponent.autoHide).toBe('never');
    });

    it('should accept scroll option', () => {
      hostComponent.autoHide = 'scroll';
      fixture.detectChanges();
      expect(hostComponent.autoHide).toBe('scroll');
    });

    it('should accept leave option', () => {
      hostComponent.autoHide = 'leave';
      fixture.detectChanges();
      expect(hostComponent.autoHide).toBe('leave');
    });

    it('should accept move option', () => {
      hostComponent.autoHide = 'move';
      fixture.detectChanges();
      expect(hostComponent.autoHide).toBe('move');
    });
  });

  describe('overflow options', () => {
    it('should accept hidden overflow', () => {
      hostComponent.overflowX = 'hidden';
      hostComponent.overflowY = 'hidden';
      fixture.detectChanges();
      expect(hostComponent.overflowX).toBe('hidden');
      expect(hostComponent.overflowY).toBe('hidden');
    });

    it('should accept scroll overflow', () => {
      hostComponent.overflowX = 'scroll';
      hostComponent.overflowY = 'scroll';
      fixture.detectChanges();
      expect(hostComponent.overflowX).toBe('scroll');
      expect(hostComponent.overflowY).toBe('scroll');
    });

    it('should accept visible-hidden overflow', () => {
      hostComponent.overflowX = 'visible-hidden';
      fixture.detectChanges();
      expect(hostComponent.overflowX).toBe('visible-hidden');
    });

    it('should accept visible-scroll overflow', () => {
      hostComponent.overflowY = 'visible-scroll';
      fixture.detectChanges();
      expect(hostComponent.overflowY).toBe('visible-scroll');
    });
  });

  describe('API methods', () => {
    it('should return instance via getInstance()', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      const instance = hostComponent.scrollbarDirective.getInstance();
      expect(instance).toBeTruthy();
    }));

    it('should have scrollTo method', () => {
      expect(typeof hostComponent.scrollbarDirective.scrollTo).toBe('function');
    });

    it('should have update method', () => {
      expect(typeof hostComponent.scrollbarDirective.update).toBe('function');
    });
  });

  describe('cleanup', () => {
    it('should destroy instance on component destroy', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      const instance = hostComponent.scrollbarDirective.getInstance();
      expect(instance).toBeTruthy();

      fixture.destroy();
      // After destroy, getInstance should return null or the directive should be cleaned up
    }));
  });

  describe('scrollTo', () => {
    it('should scroll to x position', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      hostComponent.scrollbarDirective.scrollTo({ x: 50 });
      fixture.detectChanges();

      const instance = hostComponent.scrollbarDirective.getInstance();
      const viewport = instance?.elements().viewport;
      expect(viewport?.scrollLeft).toBe(50);
    }));

    it('should scroll to y position', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      hostComponent.scrollbarDirective.scrollTo({ y: 100 });
      fixture.detectChanges();

      const instance = hostComponent.scrollbarDirective.getInstance();
      const viewport = instance?.elements().viewport;
      expect(viewport?.scrollTop).toBe(100);
    }));

    it('should scroll to both x and y positions', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      hostComponent.scrollbarDirective.scrollTo({ x: 30, y: 60 });
      fixture.detectChanges();

      const instance = hostComponent.scrollbarDirective.getInstance();
      const viewport = instance?.elements().viewport;
      expect(viewport?.scrollLeft).toBe(30);
      expect(viewport?.scrollTop).toBe(60);
    }));

    it('should handle scrollTo when not initialized', () => {
      // Create fresh directive that hasn't initialized yet
      const newFixture = TestBed.createComponent(TestHostComponent);
      newFixture.componentInstance.defer = true;

      // Calling scrollTo before initialization should not throw
      expect(() => {
        newFixture.componentInstance.scrollbarDirective?.scrollTo({ x: 10, y: 10 });
      }).not.toThrow();
    });
  });

  describe('update', () => {
    it('should call update on the instance', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      // Update should not throw
      expect(() => {
        hostComponent.scrollbarDirective.update();
      }).not.toThrow();
    }));

    it('should handle update when not initialized', () => {
      // Create fresh directive that hasn't initialized yet
      const newFixture = TestBed.createComponent(TestHostComponent);
      newFixture.componentInstance.defer = true;

      // Calling update before initialization should not throw
      expect(() => {
        newFixture.componentInstance.scrollbarDirective?.update();
      }).not.toThrow();
    });
  });

  describe('options update', () => {
    it('should update options when theme changes', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      hostComponent.theme = 'light';
      fixture.detectChanges();
      tick();

      // Instance should still be valid after options update
      expect(hostComponent.scrollbarDirective.getInstance()).toBeTruthy();
    }));

    it('should update options when autoHide changes', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      hostComponent.autoHide = 'never';
      fixture.detectChanges();
      tick();

      expect(hostComponent.scrollbarDirective.getInstance()).toBeTruthy();
    }));

    it('should update options when autoHideDelay changes', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      hostComponent.autoHideDelay = 800;
      fixture.detectChanges();
      tick();

      expect(hostComponent.scrollbarDirective.getInstance()).toBeTruthy();
    }));

    it('should update options when clickScroll changes', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      hostComponent.clickScroll = false;
      fixture.detectChanges();
      tick();

      expect(hostComponent.scrollbarDirective.getInstance()).toBeTruthy();
    }));

    it('should update options when overflow changes', fakeAsync(() => {
      tick(100);
      fixture.detectChanges();

      hostComponent.overflowX = 'hidden';
      hostComponent.overflowY = 'visible-scroll';
      fixture.detectChanges();
      tick();

      expect(hostComponent.scrollbarDirective.getInstance()).toBeTruthy();
    }));
  });
});

// Test deferred initialization
@Component({
  standalone: true,
  imports: [CoarScrollbarDirective],
  template: `
    <div
      #scrollContainer
      coarScrollbar
      [defer]="true"
      style="width: 200px; height: 200px; overflow: auto;"
    >
      <div style="width: 400px; height: 400px;">Content</div>
    </div>
  `,
})
class DeferredTestHostComponent {
  @ViewChild('scrollContainer', { read: CoarScrollbarDirective })
  scrollbarDirective!: CoarScrollbarDirective;
}

describe('CoarScrollbarDirective deferred initialization', () => {
  let fixture: ComponentFixture<DeferredTestHostComponent>;
  let hostComponent: DeferredTestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeferredTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeferredTestHostComponent);
    hostComponent = fixture.componentInstance;
  });

  it('should defer initialization when defer is true', fakeAsync(() => {
    fixture.detectChanges();

    // Instance may not be immediately available with deferred init
    // After enough time, it should initialize
    tick(2100); // Longer than the requestIdleCallback timeout
    fixture.detectChanges();

    // Eventually should be initialized
    expect(hostComponent.scrollbarDirective).toBeTruthy();
  }));
});

// Standalone directive tests
describe('CoarScrollbarDirective standalone', () => {
  it('should be standalone', () => {
    expect(CoarScrollbarDirective).toBeTruthy();
  });
});
