import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoarLabelComponent, CoarLabelSize } from './coar-label.component';

describe('CoarLabelComponent', () => {
  let fixture: ComponentFixture<CoarLabelComponent>;
  let component: CoarLabelComponent;
  let labelElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarLabelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    labelElement = fixture.nativeElement;
  });

  describe('rendering', () => {
    it('should create', () => {
      expect(labelElement).toBeTruthy();
    });

    it('should render projected content', () => {
      fixture.componentRef.setInput('text', 'Test Label');
      fixture.detectChanges();
      expect(labelElement.textContent).toContain('Test Label');
    });

    it('should have base class', () => {
      expect(labelElement.classList.contains('coar-label')).toBe(true);
    });
  });

  describe('sizes', () => {
    it('should apply xs size class', () => {
      fixture.componentRef.setInput('size', 'xs');
      fixture.detectChanges();
      expect(labelElement.classList.contains('coar-label--xs')).toBe(true);
    });

    it('should apply sm size class', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(labelElement.classList.contains('coar-label--sm')).toBe(true);
    });

    it('should apply md size class by default', () => {
      expect(labelElement.classList.contains('coar-label--md')).toBe(true);
    });

    it('should apply lg size class', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(labelElement.classList.contains('coar-label--lg')).toBe(true);
    });

    it('should only have one size class at a time', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      const sizeClasses = ['coar-label--xs', 'coar-label--sm', 'coar-label--md', 'coar-label--lg'];
      const activeClasses = sizeClasses.filter((cls) => labelElement.classList.contains(cls));
      expect(activeClasses.length).toBe(1);
      expect(activeClasses[0]).toBe('coar-label--lg');
    });
  });

  describe('required indicator', () => {
    it('should not show required indicator by default', () => {
      const requiredSpan = labelElement.querySelector('.coar-label-required');
      expect(requiredSpan).toBeNull();
    });

    it('should show required indicator when required is true', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const requiredSpan = labelElement.querySelector('.coar-label-required');
      expect(requiredSpan).toBeTruthy();
      expect(requiredSpan?.textContent).toBe('*');
    });

    it('should hide required indicator from screen readers', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const requiredSpan = labelElement.querySelector('.coar-label-required');
      expect(requiredSpan?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('for attribute', () => {
    it('should not have for attribute by default', () => {
      expect(labelElement.getAttribute('for')).toBeNull();
    });

    it('should set for attribute when provided', () => {
      fixture.componentRef.setInput('for', 'my-input');
      fixture.detectChanges();
      expect(labelElement.getAttribute('for')).toBe('my-input');
    });

    it('should update for attribute dynamically', () => {
      fixture.componentRef.setInput('for', 'first-input');
      fixture.detectChanges();
      expect(labelElement.getAttribute('for')).toBe('first-input');

      fixture.componentRef.setInput('for', 'second-input');
      fixture.detectChanges();
      expect(labelElement.getAttribute('for')).toBe('second-input');
    });

    it('should remove for attribute when set to undefined', () => {
      fixture.componentRef.setInput('for', 'my-input');
      fixture.detectChanges();
      expect(labelElement.getAttribute('for')).toBe('my-input');

      fixture.componentRef.setInput('for', undefined);
      fixture.detectChanges();
      expect(labelElement.getAttribute('for')).toBeNull();
    });
  });

  describe('content projection', () => {
    it('should update when content changes', () => {
      fixture.componentRef.setInput('text', 'Test Label');
      fixture.detectChanges();
      expect(labelElement.textContent).toContain('Test Label');

      fixture.componentRef.setInput('text', 'Updated Label');
      fixture.detectChanges();
      expect(labelElement.textContent).toContain('Updated Label');
    });

    it('should handle empty content', () => {
      fixture.componentRef.setInput('text', '');
      fixture.detectChanges();
      expect(labelElement.textContent?.trim()).toBe('');
    });
  });

  describe('default values', () => {
    it('should have default size of md', () => {
      expect(component.size()).toBe('md');
    });

    it('should have default required of false', () => {
      expect(component.required()).toBe(false);
    });

    it('should have default for of undefined', () => {
      expect(component.for()).toBeUndefined();
    });
  });
});
