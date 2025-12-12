import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CoarDividerComponent, DividerAlign, DividerVariant } from './coar-divider.component';

describe('CoarDividerComponent', () => {
  let component: CoarDividerComponent;
  let fixture: ComponentFixture<CoarDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarDividerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have center alignment by default', () => {
      expect(component.align()).toBe('center');
    });

    it('should have subtle variant by default', () => {
      expect(component.variant()).toBe('subtle');
    });

    it('should have 90% width by default', () => {
      expect(component.width()).toBe(90);
    });

    it('should have 0 spacing top by default', () => {
      expect(component.spacingTop()).toBe(0);
    });

    it('should have 0 spacing bottom by default', () => {
      expect(component.spacingBottom()).toBe(0);
    });

    it('should have coar-divider base class', () => {
      expect(fixture.nativeElement.classList).toContain('coar-divider');
    });
  });

  describe('alignment', () => {
    it.each(['left', 'center', 'right'] as DividerAlign[])(
      'should apply %s alignment class',
      (align) => {
        fixture.componentRef.setInput('align', align);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-divider--${align}`);
      }
    );
  });

  describe('variants', () => {
    it.each(['subtle', 'strong'] as DividerVariant[])(
      'should apply %s variant class',
      (variant) => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-divider--${variant}`);
      }
    );
  });

  describe('accessibility', () => {
    it('should have separator role', () => {
      expect(fixture.nativeElement.getAttribute('role')).toBe('separator');
    });

    it('should have horizontal aria-orientation', () => {
      expect(fixture.nativeElement.getAttribute('aria-orientation')).toBe('horizontal');
    });
  });

  describe('width', () => {
    it('should accept custom width', () => {
      fixture.componentRef.setInput('width', 50);
      fixture.detectChanges();
      expect(component.width()).toBe(50);
    });
  });

  describe('spacing', () => {
    it('should accept custom spacing top', () => {
      fixture.componentRef.setInput('spacingTop', 24);
      fixture.detectChanges();
      expect(component.spacingTop()).toBe(24);
    });

    it('should accept custom spacing bottom', () => {
      fixture.componentRef.setInput('spacingBottom', 16);
      fixture.detectChanges();
      expect(component.spacingBottom()).toBe(16);
    });
  });
});

@Component({
  standalone: true,
  imports: [CoarDividerComponent],
  template: `<coar-divider>OR</coar-divider>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {}

describe('CoarDividerComponent with content', () => {
  it('should render projected content', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const divider = fixture.nativeElement.querySelector('coar-divider');
    expect(divider.textContent).toContain('OR');
  });
});
