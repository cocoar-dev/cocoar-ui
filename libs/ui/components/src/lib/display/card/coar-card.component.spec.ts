import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CoarCardComponent, CardVariant, CardPadding } from './coar-card.component';

describe('CoarCardComponent', () => {
  let component: CoarCardComponent;
  let fixture: ComponentFixture<CoarCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have neutral variant by default', () => {
      expect(component.variant()).toBe('neutral');
    });

    it('should have m padding by default', () => {
      expect(component.padding()).toBe('m');
    });

    it('should not be elevated by default', () => {
      expect(component.elevated()).toBe(false);
    });

    it('should not be borderless by default (cards have borders)', () => {
      expect(component.borderless()).toBe(false);
    });

    it('should have coar-card base class', () => {
      expect(fixture.nativeElement.classList).toContain('coar-card');
    });
  });

  describe('variant options', () => {
    it.each(['neutral', 'success', 'warning', 'error', 'info', 'accent'] as CardVariant[])(
      'should apply %s variant class',
      (variant) => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-card--${variant}`);
      }
    );
  });

  describe('padding variants', () => {
    it.each(['none', 's', 'm', 'l'] as CardPadding[])(
      'should apply %s padding class',
      (padding) => {
        fixture.componentRef.setInput('padding', padding);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-card--padding-${padding}`);
      }
    );
  });

  describe('elevated', () => {
    it('should not have elevated class when elevated is false', () => {
      fixture.componentRef.setInput('elevated', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).not.toContain('coar-card--elevated');
    });

    it('should have elevated class when elevated is true', () => {
      fixture.componentRef.setInput('elevated', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-card--elevated');
    });
  });

  describe('borderless', () => {
    it('should not have borderless class when borderless is false', () => {
      fixture.componentRef.setInput('borderless', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).not.toContain('coar-card--borderless');
    });

    it('should have borderless class when borderless is true', () => {
      fixture.componentRef.setInput('borderless', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-card--borderless');
    });
  });

  describe('combinations', () => {
    it('should support elevated borderless cards', () => {
      fixture.componentRef.setInput('elevated', true);
      fixture.componentRef.setInput('borderless', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-card--elevated');
      expect(fixture.nativeElement.classList).toContain('coar-card--borderless');
    });

    it('should support variant elevated cards', () => {
      fixture.componentRef.setInput('variant', 'success');
      fixture.componentRef.setInput('elevated', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-card--success');
      expect(fixture.nativeElement.classList).toContain('coar-card--elevated');
    });
  });
});

@Component({
  standalone: true,
  imports: [CoarCardComponent],
  template: `<coar-card>Test Content</coar-card>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {}

describe('CoarCardComponent with content', () => {
  it('should render projected content', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('coar-card');
    expect(card.textContent).toContain('Test Content');
  });
});
