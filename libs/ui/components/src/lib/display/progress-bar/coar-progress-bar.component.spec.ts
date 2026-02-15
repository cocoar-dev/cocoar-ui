import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CoarProgressBarComponent,
  CoarProgressBarVariant,
  CoarProgressBarSize,
} from './coar-progress-bar.component';

describe('CoarProgressBarComponent', () => {
  let component: CoarProgressBarComponent;
  let fixture: ComponentFixture<CoarProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have 0 value by default', () => {
      expect(component.value()).toBe(0);
    });

    it('should have 100 max by default', () => {
      expect(component.max()).toBe(100);
    });

    it('should have accent variant by default', () => {
      expect(component.variant()).toBe('accent');
    });

    it('should have m size by default', () => {
      expect(component.size()).toBe('m');
    });

    it('should not be indeterminate by default', () => {
      expect(component.indeterminate()).toBe(false);
    });

    it('should have empty label by default', () => {
      expect(component.label()).toBe('');
    });

    it('should not show value by default', () => {
      expect(component.showValue()).toBe(false);
    });
  });

  describe('size variants', () => {
    it.each(['s', 'm', 'l'] as CoarProgressBarSize[])(
      'should apply %s size class',
      (size) => {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-progress-bar--${size}`);
      }
    );
  });

  describe('variant classes', () => {
    it.each(['accent', 'success', 'warning', 'error'] as CoarProgressBarVariant[])(
      'should apply %s variant class',
      (variant) => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-progress-bar--${variant}`);
      }
    );
  });

  describe('progress value', () => {
    it('should set fill width based on value', () => {
      fixture.componentRef.setInput('value', 50);
      fixture.detectChanges();

      const fill = fixture.nativeElement.querySelector('.coar-progress-bar-fill') as HTMLElement;
      expect(fill.style.width).toBe('50%');
    });

    it('should clamp value to 0', () => {
      fixture.componentRef.setInput('value', -10);
      fixture.detectChanges();

      const fill = fixture.nativeElement.querySelector('.coar-progress-bar-fill') as HTMLElement;
      expect(fill.style.width).toBe('0%');
    });

    it('should clamp value to 100', () => {
      fixture.componentRef.setInput('value', 150);
      fixture.detectChanges();

      const fill = fixture.nativeElement.querySelector('.coar-progress-bar-fill') as HTMLElement;
      expect(fill.style.width).toBe('100%');
    });

    it('should support custom max', () => {
      fixture.componentRef.setInput('value', 25);
      fixture.componentRef.setInput('max', 50);
      fixture.detectChanges();

      const fill = fixture.nativeElement.querySelector('.coar-progress-bar-fill') as HTMLElement;
      expect(fill.style.width).toBe('50%');
    });
  });

  describe('show value', () => {
    it('should not display percentage text by default', () => {
      const valueEl = fixture.nativeElement.querySelector('.coar-progress-bar-value');
      expect(valueEl).toBeFalsy();
    });

    it('should display percentage text when showValue is true', () => {
      fixture.componentRef.setInput('showValue', true);
      fixture.componentRef.setInput('value', 75);
      fixture.detectChanges();

      const valueEl = fixture.nativeElement.querySelector('.coar-progress-bar-value');
      expect(valueEl).toBeTruthy();
      expect(valueEl.textContent).toContain('75%');
    });

    it('should not display percentage text when indeterminate', () => {
      fixture.componentRef.setInput('showValue', true);
      fixture.componentRef.setInput('indeterminate', true);
      fixture.detectChanges();

      const valueEl = fixture.nativeElement.querySelector('.coar-progress-bar-value');
      expect(valueEl).toBeFalsy();
    });
  });

  describe('indeterminate', () => {
    it('should apply indeterminate class', () => {
      fixture.componentRef.setInput('indeterminate', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-progress-bar--indeterminate');
    });

    it('should not set aria-valuenow when indeterminate', () => {
      fixture.componentRef.setInput('indeterminate', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-valuenow')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should have progressbar role', () => {
      expect(fixture.nativeElement.getAttribute('role')).toBe('progressbar');
    });

    it('should set aria-valuenow', () => {
      fixture.componentRef.setInput('value', 42);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-valuenow')).toBe('42');
    });

    it('should set aria-valuemin to 0', () => {
      expect(fixture.nativeElement.getAttribute('aria-valuemin')).toBe('0');
    });

    it('should set aria-valuemax', () => {
      fixture.componentRef.setInput('max', 200);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-valuemax')).toBe('200');
    });

    it('should set aria-label when provided', () => {
      fixture.componentRef.setInput('label', 'Upload progress');
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Upload progress');
    });

    it('should not set aria-label when empty', () => {
      expect(fixture.nativeElement.getAttribute('aria-label')).toBeNull();
    });
  });
});
