import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CoarNavbarComponent } from './coar-navbar.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarNavbarComponent],
  template: `
    <coar-navbar [elevated]="elevated" [bordered]="bordered">
      <div coar-navbar-start>Logo</div>
      <nav coar-navbar-center>Links</nav>
      <div coar-navbar-end>Actions</div>
    </coar-navbar>
  `,
})
class TestHostComponent {
  elevated = true;
  bordered = false;
}

describe('CoarNavbarComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostElement: HTMLElement;

  function createFixture(overrides: Partial<TestHostComponent> = {}): void {
    fixture = TestBed.createComponent(TestHostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    hostElement = fixture.nativeElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  function getNavbar(): HTMLElement | null {
    return hostElement.querySelector('coar-navbar');
  }

  describe('defaults', () => {
    beforeEach(() => createFixture());

    it('should create', () => {
      expect(getNavbar()).toBeTruthy();
    });

    it('should have role banner', () => {
      expect(getNavbar()?.getAttribute('role')).toBe('banner');
    });

    it('should have coar-navbar class', () => {
      expect(getNavbar()?.classList.contains('coar-navbar')).toBe(true);
    });
  });

  describe('content projection', () => {
    beforeEach(() => createFixture());

    it('should project start content', () => {
      const start = hostElement.querySelector('[coar-navbar-start]');
      expect(start?.textContent).toContain('Logo');
    });

    it('should project center content', () => {
      const center = hostElement.querySelector('[coar-navbar-center]');
      expect(center?.textContent).toContain('Links');
    });

    it('should project end content', () => {
      const end = hostElement.querySelector('[coar-navbar-end]');
      expect(end?.textContent).toContain('Actions');
    });
  });

  describe('elevated variant', () => {
    it('should apply elevated class by default', () => {
      createFixture();
      expect(getNavbar()?.classList.contains('coar-navbar--elevated')).toBe(true);
    });

    it('should remove elevated class when set to false', () => {
      createFixture({ elevated: false });
      expect(getNavbar()?.classList.contains('coar-navbar--elevated')).toBe(false);
    });
  });

  describe('bordered variant', () => {
    it('should not apply bordered class by default', () => {
      createFixture();
      expect(getNavbar()?.classList.contains('coar-navbar--bordered')).toBe(false);
    });

    it('should apply bordered class when set to true', () => {
      createFixture({ bordered: true });
      expect(getNavbar()?.classList.contains('coar-navbar--bordered')).toBe(true);
    });
  });
});

describe('CoarNavbarComponent standalone', () => {
  let fixture: ComponentFixture<CoarNavbarComponent>;
  let component: CoarNavbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarNavbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default elevated to true', () => {
    expect(component.elevated()).toBe(true);
  });

  it('should default bordered to false', () => {
    expect(component.bordered()).toBe(false);
  });
});
