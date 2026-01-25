import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, InjectionToken } from '@angular/core';
import { vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  CoarNumberInputComponent,
  CoarNumberInputSize,
  CoarNumberInputStepperButtons,
} from './coar-number-input.component';
import { provideCoarLocalization } from '@cocoar/localization';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CoarNumberInputComponent],
  template: ` <coar-number-input [formControl]="control" /> `,
})
class TestReactiveFormsHostComponent {
  control = new FormControl<number | null>(null);
}

describe('CoarNumberInputComponent', () => {
  let fixture: ComponentFixture<CoarNumberInputComponent>;
  let component: CoarNumberInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarNumberInputComponent, TestReactiveFormsHostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideCoarLocalization({ availableLanguages: ['en'], defaultLanguage: 'en' }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarNumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getInputElement(): HTMLInputElement | null {
    return fixture.nativeElement.querySelector('input');
  }

  function getLabelElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-number-input-label');
  }

  function getClearButton(): HTMLElement | null {
    return fixture.nativeElement.querySelector(
      '.coar-number-input-clear:not(.coar-number-input-clear--hidden)'
    );
  }

  function getMessageElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-form-field-message');
  }

  function getContainerElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-number-input-container');
  }

  function getIncrementButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.coar-number-input-button--increment');
  }

  function getDecrementButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.coar-number-input-button--decrement');
  }

  describe('ControlValueAccessor (Reactive Forms)', () => {
    let reactiveFixture: ComponentFixture<TestReactiveFormsHostComponent>;
    let reactiveHost: TestReactiveFormsHostComponent;

    beforeEach(async () => {
      reactiveFixture = TestBed.createComponent(TestReactiveFormsHostComponent);
      reactiveHost = reactiveFixture.componentInstance;
      reactiveFixture.detectChanges();
    });

    function getReactiveInput(): HTMLInputElement {
      const el = reactiveFixture.nativeElement.querySelector('input') as HTMLInputElement | null;
      if (!el) throw new Error('Expected input element');
      return el;
    }

    it('should write control value into the input display', () => {
      reactiveHost.control.setValue(12);
      reactiveFixture.detectChanges();
      expect(getReactiveInput().value).toBe('12');
    });

    it('should propagate typed value into the control on blur', () => {
      const input = getReactiveInput();
      input.value = '42';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new FocusEvent('blur'));
      reactiveFixture.detectChanges();
      expect(reactiveHost.control.value).toBe(42);
    });

    it('should mark control as touched on blur', () => {
      const input = getReactiveInput();
      input.dispatchEvent(new FocusEvent('blur'));
      reactiveFixture.detectChanges();
      expect(reactiveHost.control.touched).toBe(true);
    });

    it('should disable the input when the control is disabled', () => {
      reactiveHost.control.disable();
      reactiveFixture.detectChanges();
      expect(getReactiveInput().disabled).toBe(true);
    });
  });

  describe('rendering', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render input element', () => {
      expect(getInputElement()).toBeTruthy();
    });

    it('should have inputmode decimal for mobile keyboards', () => {
      expect(getInputElement()?.inputMode).toBe('decimal');
    });
  });

  describe('label', () => {
    it('should not render label when empty', () => {
      expect(getLabelElement()).toBeNull();
    });

    it('should render label when provided', () => {
      fixture.componentRef.setInput('label', 'Quantity');
      fixture.detectChanges();
      expect(getLabelElement()?.textContent).toContain('Quantity');
    });

    it('should show required indicator when required', () => {
      fixture.componentRef.setInput('label', 'Quantity');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      expect(getLabelElement()?.textContent).toContain('*');
    });
  });

  describe('sizes', () => {
    it('should apply md size class by default', () => {
      expect(fixture.nativeElement.classList.contains('coar-number-input--md')).toBe(true);
    });

    it('should apply xs size class', () => {
      fixture.componentRef.setInput('size', 'xs');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-number-input--xs')).toBe(true);
    });

    it('should apply sm size class', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-number-input--sm')).toBe(true);
    });

    it('should apply lg size class', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-number-input--lg')).toBe(true);
    });
  });

  describe('stepper buttons', () => {
    it('should not show buttons by default', () => {
      expect(getIncrementButton()).toBeNull();
      expect(getDecrementButton()).toBeNull();
    });

    it('should show both buttons when stepperButtons is both', () => {
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.detectChanges();
      expect(getIncrementButton()).toBeTruthy();
      expect(getDecrementButton()).toBeTruthy();
    });

    it('should show only increment button', () => {
      fixture.componentRef.setInput('stepperButtons', 'increment');
      fixture.detectChanges();
      expect(getIncrementButton()).toBeTruthy();
      expect(getDecrementButton()).toBeNull();
    });

    it('should show only decrement button', () => {
      fixture.componentRef.setInput('stepperButtons', 'decrement');
      fixture.detectChanges();
      expect(getDecrementButton()).toBeTruthy();
      expect(getIncrementButton()).toBeNull();
    });

    it('should increment value when clicking increment button', () => {
      fixture.componentRef.setInput('value', 5);
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.detectChanges();

      getIncrementButton()?.click();
      fixture.detectChanges();

      expect(component.value()).toBe(6);
    });

    it('should decrement value when clicking decrement button', () => {
      fixture.componentRef.setInput('value', 5);
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.detectChanges();

      getDecrementButton()?.click();
      fixture.detectChanges();

      expect(component.value()).toBe(4);
    });

    it('should respect step value', () => {
      fixture.componentRef.setInput('value', 10);
      fixture.componentRef.setInput('step', 5);
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.detectChanges();

      getIncrementButton()?.click();
      fixture.detectChanges();

      expect(component.value()).toBe(15);
    });

    it('should disable increment when at max', () => {
      fixture.componentRef.setInput('value', 10);
      fixture.componentRef.setInput('max', 10);
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.detectChanges();

      expect(getIncrementButton()?.disabled).toBe(true);
    });

    it('should disable decrement when at min', () => {
      fixture.componentRef.setInput('value', 0);
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.detectChanges();

      expect(getDecrementButton()?.disabled).toBe(true);
    });
  });

  describe('min/max constraints', () => {
    it('should clamp value to max', fakeAsync(() => {
      fixture.componentRef.setInput('max', 100);
      fixture.componentRef.setInput('value', 50);
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.detectChanges();

      // Click increment many times
      for (let i = 0; i < 60; i++) {
        getIncrementButton()?.click();
        fixture.detectChanges();
      }

      expect(component.value()).toBe(100);
    }));

    it('should clamp value to min', fakeAsync(() => {
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('value', 10);
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.detectChanges();

      // Click decrement many times
      for (let i = 0; i < 20; i++) {
        getDecrementButton()?.click();
        fixture.detectChanges();
      }

      expect(component.value()).toBe(0);
    }));
  });

  describe('disabled state', () => {
    it('should disable input when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(getInputElement()?.disabled).toBe(true);
    });

    it('should not show stepper buttons when disabled', () => {
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(getIncrementButton()).toBeNull();
      expect(getDecrementButton()).toBeNull();
    });
  });

  describe('readonly state', () => {
    it('should set readonly on input', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      expect(getInputElement()?.readOnly).toBe(true);
    });

    it('should not show stepper buttons when readonly', () => {
      fixture.componentRef.setInput('stepperButtons', 'both');
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      expect(getIncrementButton()).toBeNull();
      expect(getDecrementButton()).toBeNull();
    });
  });

  describe('error and hint messages', () => {
    it('should display hint message', () => {
      fixture.componentRef.setInput('hint', 'Enter a number between 1 and 100');
      fixture.detectChanges();
      expect(getMessageElement()?.textContent).toContain('Enter a number between 1 and 100');
    });

    it('should display error message over hint', () => {
      fixture.componentRef.setInput('hint', 'This is a hint');
      fixture.componentRef.setInput('error', 'Value is required');
      fixture.detectChanges();
      expect(getMessageElement()?.textContent).toContain('Value is required');
      expect(getMessageElement()?.textContent).not.toContain('This is a hint');
    });

    it('should add error styling when error is present', () => {
      fixture.componentRef.setInput('error', 'Error!');
      fixture.detectChanges();
      const container = getContainerElement();
      expect(container?.classList.contains('coar-number-input-error')).toBe(true);
    });
  });

  describe('focus events', () => {
    it('should emit focused event on focus', () => {
      const focusedSpy = vi.fn();
      component.focused.subscribe(focusedSpy);

      getInputElement()?.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();

      expect(focusedSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit blurred event on blur', () => {
      const blurredSpy = vi.fn();
      component.blurred.subscribe(blurredSpy);

      getInputElement()?.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();

      expect(blurredSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('prefix and suffix', () => {
    it('should render prefix when provided', () => {
      fixture.componentRef.setInput('prefix', '$');
      fixture.detectChanges();
      const prefix = fixture.nativeElement.querySelector('.coar-number-input-prefix');
      expect(prefix?.textContent).toContain('$');
    });

    it('should render suffix when provided', () => {
      fixture.componentRef.setInput('suffix', 'kg');
      fixture.detectChanges();
      const suffix = fixture.nativeElement.querySelector('.coar-number-input-suffix');
      expect(suffix?.textContent).toContain('kg');
    });
  });

  describe('html attributes', () => {
    it('should set id attribute', () => {
      fixture.componentRef.setInput('id', 'my-number-input');
      fixture.detectChanges();
      expect(getInputElement()?.id).toBe('my-number-input');
    });

    it('should set name attribute', () => {
      fixture.componentRef.setInput('name', 'quantity');
      fixture.detectChanges();
      expect(getInputElement()?.name).toBe('quantity');
    });
  });

  describe('keyboard navigation', () => {
    it('should increment on ArrowUp', () => {
      fixture.componentRef.setInput('value', 5);
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      getInputElement()?.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.value()).toBe(6);
    });

    it('should decrement on ArrowDown', () => {
      fixture.componentRef.setInput('value', 5);
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      getInputElement()?.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.value()).toBe(4);
    });
  });

  describe('accessibility', () => {
    it('should associate message with input via aria-describedby', () => {
      fixture.componentRef.setInput('hint', 'A helpful hint');
      fixture.detectChanges();

      const input = getInputElement();
      const message = getMessageElement();
      expect(input?.getAttribute('aria-describedby')).toBe(message?.id);
    });

    it('should set aria-invalid when error is present', () => {
      fixture.componentRef.setInput('error', 'Error message');
      fixture.detectChanges();
      expect(getInputElement()?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-valuemin when min is set', () => {
      fixture.componentRef.setInput('min', 0);
      fixture.detectChanges();
      expect(getInputElement()?.getAttribute('aria-valuemin')).toBe('0');
    });

    it('should set aria-valuemax when max is set', () => {
      fixture.componentRef.setInput('max', 100);
      fixture.detectChanges();
      expect(getInputElement()?.getAttribute('aria-valuemax')).toBe('100');
    });

    it('should set aria-valuenow when value is set', () => {
      fixture.componentRef.setInput('value', 42);
      fixture.detectChanges();
      expect(getInputElement()?.getAttribute('aria-valuenow')).toBe('42');
    });
  });

  describe('clear button', () => {
    it('should clear value when clear icon is clicked', () => {
      const clearSpy = vi.fn();
      component.clear.subscribe(clearSpy);

      fixture.componentRef.setInput('value', 50);
      fixture.componentRef.setInput('clearable', true);
      fixture.detectChanges();

      // The clear icon is always rendered but hidden via CSS when not applicable
      const clearIcon = fixture.nativeElement.querySelector('.coar-number-input-clear');
      clearIcon?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(component.value()).toBeNull();
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('should focus input after clearing', () => {
      fixture.componentRef.setInput('value', 50);
      fixture.componentRef.setInput('clearable', true);
      fixture.detectChanges();

      const input = getInputElement();
      if (!input) throw new Error('Input element not found');
      const focusSpy = vi.spyOn(input, 'focus');

      const clearIcon = fixture.nativeElement.querySelector('.coar-number-input-clear');
      clearIcon?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('label click', () => {
    it('should have label associated with input via for attribute', () => {
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.detectChanges();

      const input = getInputElement();
      const label = fixture.nativeElement.querySelector('.coar-number-input-label');

      expect(label).toBeTruthy();
      expect(label?.getAttribute('for')).toBe(input?.id);
    });
  });

  describe('drag to change value', () => {
    function getLabel(): HTMLElement | null {
      return fixture.nativeElement.querySelector('.coar-number-input-label');
    }

    it('should not start drag when disabled', () => {
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('value', 50);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const label = getLabel();
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Value should remain unchanged since drag should not start
      expect(component.value()).toBe(50);
    });

    it('should not start drag when readonly', () => {
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('value', 50);
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();

      const label = getLabel();
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Value should remain unchanged since drag should not start
      expect(component.value()).toBe(50);
    });

    it('should set cursor to ew-resize during drag', () => {
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('value', 50);
      fixture.detectChanges();

      const label = getLabel();

      // Start drag
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      expect(document.body.style.cursor).toBe('ew-resize');

      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('should update value based on drag distance', () => {
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('value', 50);
      fixture.componentRef.setInput('step', 1);
      fixture.detectChanges();

      const label = getLabel();

      // Start drag at position 100
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Move 30 pixels to the right (should increment by 3 steps with 10px sensitivity)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 130 }));
      fixture.detectChanges();

      expect(component.value()).toBe(53);

      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('should decrement value when dragging left', () => {
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('value', 50);
      fixture.componentRef.setInput('step', 1);
      fixture.detectChanges();

      const label = getLabel();

      // Start drag at position 100
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Move 20 pixels to the left (should decrement by 2 steps)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 80 }));
      fixture.detectChanges();

      expect(component.value()).toBe(48);

      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('should respect min/max during drag', () => {
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('value', 50);
      fixture.componentRef.setInput('step', 1);
      fixture.componentRef.setInput('max', 52);
      fixture.detectChanges();

      const label = getLabel();

      // Start drag at position 100
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Move 50 pixels to the right (would be 5 steps, but clamped to max)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }));
      fixture.detectChanges();

      expect(component.value()).toBe(52);

      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('should reset cursor on drag end', () => {
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('value', 50);
      fixture.detectChanges();

      const label = getLabel();

      // Start drag
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();
      expect(document.body.style.cursor).toBe('ew-resize');

      // End drag
      document.dispatchEvent(new MouseEvent('mouseup'));
      fixture.detectChanges();

      expect(document.body.style.cursor).toBe('');
    });

    it('should not process mousemove when not dragging', () => {
      fixture.componentRef.setInput('value', 50);
      fixture.detectChanges();

      // Move without starting drag
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200 }));
      fixture.detectChanges();

      // Value should remain unchanged
      expect(component.value()).toBe(50);
    });

    it('should use custom step during drag', () => {
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('value', 50);
      fixture.componentRef.setInput('step', 5);
      fixture.detectChanges();

      const label = getLabel();

      // Start drag at position 100
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Move 20 pixels (2 step counts with step=5)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 120 }));
      fixture.detectChanges();

      expect(component.value()).toBe(60); // 50 + 2*5

      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });
  });
});
