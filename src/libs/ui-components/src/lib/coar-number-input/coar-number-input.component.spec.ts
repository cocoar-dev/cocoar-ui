import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, InjectionToken } from '@angular/core';
import { vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  CoarNumberInputComponent,
  CoarNumberInputSize,
  CoarNumberInputStepperButtons,
} from './coar-number-input.component';
import { COAR_LOCALE_SERVICE, NumberFormatConfig } from '../services/locale.service';

// Mock locale service
class MockLocaleService {
  getNumberFormat(locale?: string): NumberFormatConfig {
    return { decimal: '.', thousand: '' };
  }
}

// Test host component
@Component({
  standalone: true,
  imports: [CoarNumberInputComponent],
  template: `
    <coar-number-input
      [label]="label"
      [placeholder]="placeholder"
      [(value)]="value"
      [size]="size"
      [min]="min"
      [max]="max"
      [step]="step"
      [decimals]="decimals"
      [disabled]="disabled"
      [readonly]="readonly"
      [required]="required"
      [error]="error"
      [hint]="hint"
      [clearable]="clearable"
      [stepperButtons]="stepperButtons"
      [prefix]="prefix"
      [suffix]="suffix"
      [id]="inputId"
      [name]="name"
      (valueChange)="onValueChange($event)"
      (focused)="onFocused($event)"
      (blurred)="onBlurred($event)"
      (clear)="onClear()"
    />
  `,
})
class TestHostComponent {
  label = '';
  placeholder = '';
  value: number | null = null;
  size: CoarNumberInputSize = 'md';
  min: number | undefined = undefined;
  max: number | undefined = undefined;
  step = 1;
  decimals = 0;
  disabled = false;
  readonly = false;
  required = false;
  error = '';
  hint = '';
  clearable = true;
  stepperButtons: CoarNumberInputStepperButtons = 'none';
  prefix = '';
  suffix = '';
  inputId = '';
  name = '';

  valueChangeEvents: (number | null)[] = [];
  focusEvents: FocusEvent[] = [];
  blurEvents: FocusEvent[] = [];
  clearCount = 0;

  onValueChange(value: number | null): void {
    this.valueChangeEvents.push(value);
  }
  onFocused(event: FocusEvent): void {
    this.focusEvents.push(event);
  }
  onBlurred(event: FocusEvent): void {
    this.blurEvents.push(event);
  }
  onClear(): void {
    this.clearCount++;
  }
}

describe('CoarNumberInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: COAR_LOCALE_SERVICE, useClass: MockLocaleService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    hostElement = fixture.nativeElement;
  });

  function getInputElement(): HTMLInputElement | null {
    return hostElement.querySelector('input');
  }

  function getLabelElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-number-input-label');
  }

  function getClearButton(): HTMLElement | null {
    return hostElement.querySelector(
      '.coar-number-input-clear:not(.coar-number-input-clear--hidden)'
    );
  }

  function getMessageElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-number-input-message');
  }

  function getContainerElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-number-input-container');
  }

  function getIncrementButton(): HTMLButtonElement | null {
    return hostElement.querySelector('.coar-number-input-button--increment');
  }

  function getDecrementButton(): HTMLButtonElement | null {
    return hostElement.querySelector('.coar-number-input-button--decrement');
  }

  describe('rendering', () => {
    it('should create', () => {
      const component = hostElement.querySelector('coar-number-input');
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
      hostComponent.label = 'Quantity';
      fixture.detectChanges();
      expect(getLabelElement()?.textContent).toContain('Quantity');
    });

    it('should show required indicator when required', () => {
      hostComponent.label = 'Quantity';
      hostComponent.required = true;
      fixture.detectChanges();
      expect(getLabelElement()?.textContent).toContain('*');
    });
  });

  describe('sizes', () => {
    it('should apply md size class by default', () => {
      const component = hostElement.querySelector('coar-number-input');
      expect(component?.classList.contains('coar-number-input--md')).toBe(true);
    });

    it('should apply xs size class', () => {
      hostComponent.size = 'xs';
      fixture.detectChanges();
      const component = hostElement.querySelector('coar-number-input');
      expect(component?.classList.contains('coar-number-input--xs')).toBe(true);
    });

    it('should apply sm size class', () => {
      hostComponent.size = 'sm';
      fixture.detectChanges();
      const component = hostElement.querySelector('coar-number-input');
      expect(component?.classList.contains('coar-number-input--sm')).toBe(true);
    });

    it('should apply lg size class', () => {
      hostComponent.size = 'lg';
      fixture.detectChanges();
      const component = hostElement.querySelector('coar-number-input');
      expect(component?.classList.contains('coar-number-input--lg')).toBe(true);
    });
  });

  describe('stepper buttons', () => {
    it('should not show buttons by default', () => {
      expect(getIncrementButton()).toBeNull();
      expect(getDecrementButton()).toBeNull();
    });

    it('should show both buttons when stepperButtons is both', () => {
      hostComponent.stepperButtons = 'both';
      fixture.detectChanges();
      expect(getIncrementButton()).toBeTruthy();
      expect(getDecrementButton()).toBeTruthy();
    });

    it('should show only increment button', () => {
      hostComponent.stepperButtons = 'increment';
      fixture.detectChanges();
      expect(getIncrementButton()).toBeTruthy();
      expect(getDecrementButton()).toBeNull();
    });

    it('should show only decrement button', () => {
      hostComponent.stepperButtons = 'decrement';
      fixture.detectChanges();
      expect(getDecrementButton()).toBeTruthy();
      expect(getIncrementButton()).toBeNull();
    });

    it('should increment value when clicking increment button', () => {
      hostComponent.value = 5;
      hostComponent.stepperButtons = 'both';
      fixture.detectChanges();

      getIncrementButton()?.click();
      fixture.detectChanges();

      expect(hostComponent.value).toBe(6);
    });

    it('should decrement value when clicking decrement button', () => {
      hostComponent.value = 5;
      hostComponent.stepperButtons = 'both';
      fixture.detectChanges();

      getDecrementButton()?.click();
      fixture.detectChanges();

      expect(hostComponent.value).toBe(4);
    });

    it('should respect step value', () => {
      hostComponent.value = 10;
      hostComponent.step = 5;
      hostComponent.stepperButtons = 'both';
      fixture.detectChanges();

      getIncrementButton()?.click();
      fixture.detectChanges();

      expect(hostComponent.value).toBe(15);
    });

    it('should disable increment when at max', () => {
      hostComponent.value = 10;
      hostComponent.max = 10;
      hostComponent.stepperButtons = 'both';
      fixture.detectChanges();

      expect(getIncrementButton()?.disabled).toBe(true);
    });

    it('should disable decrement when at min', () => {
      hostComponent.value = 0;
      hostComponent.min = 0;
      hostComponent.stepperButtons = 'both';
      fixture.detectChanges();

      expect(getDecrementButton()?.disabled).toBe(true);
    });
  });

  describe('min/max constraints', () => {
    it('should clamp value to max', fakeAsync(() => {
      hostComponent.max = 100;
      hostComponent.value = 50;
      hostComponent.stepperButtons = 'both';
      fixture.detectChanges();

      // Click increment many times
      for (let i = 0; i < 60; i++) {
        getIncrementButton()?.click();
        fixture.detectChanges();
      }

      expect(hostComponent.value).toBe(100);
    }));

    it('should clamp value to min', fakeAsync(() => {
      hostComponent.min = 0;
      hostComponent.value = 10;
      hostComponent.stepperButtons = 'both';
      fixture.detectChanges();

      // Click decrement many times
      for (let i = 0; i < 20; i++) {
        getDecrementButton()?.click();
        fixture.detectChanges();
      }

      expect(hostComponent.value).toBe(0);
    }));
  });

  describe('disabled state', () => {
    it('should disable input when disabled is true', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();
      expect(getInputElement()?.disabled).toBe(true);
    });

    it('should not show stepper buttons when disabled', () => {
      hostComponent.stepperButtons = 'both';
      hostComponent.disabled = true;
      fixture.detectChanges();
      expect(getIncrementButton()).toBeNull();
      expect(getDecrementButton()).toBeNull();
    });
  });

  describe('readonly state', () => {
    it('should set readonly on input', () => {
      hostComponent.readonly = true;
      fixture.detectChanges();
      expect(getInputElement()?.readOnly).toBe(true);
    });

    it('should not show stepper buttons when readonly', () => {
      hostComponent.stepperButtons = 'both';
      hostComponent.readonly = true;
      fixture.detectChanges();
      expect(getIncrementButton()).toBeNull();
      expect(getDecrementButton()).toBeNull();
    });
  });

  describe('error and hint messages', () => {
    it('should display hint message', () => {
      hostComponent.hint = 'Enter a number between 1 and 100';
      fixture.detectChanges();
      expect(getMessageElement()?.textContent).toContain('Enter a number between 1 and 100');
    });

    it('should display error message over hint', () => {
      hostComponent.hint = 'This is a hint';
      hostComponent.error = 'Value is required';
      fixture.detectChanges();
      expect(getMessageElement()?.textContent).toContain('Value is required');
      expect(getMessageElement()?.textContent).not.toContain('This is a hint');
    });

    it('should add error styling when error is present', () => {
      hostComponent.error = 'Error!';
      fixture.detectChanges();
      const container = getContainerElement();
      expect(container?.classList.contains('coar-number-input-error')).toBe(true);
    });
  });

  describe('focus events', () => {
    it('should emit focused event on focus', () => {
      getInputElement()?.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(hostComponent.focusEvents.length).toBe(1);
    });

    it('should emit blurred event on blur', () => {
      getInputElement()?.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(hostComponent.blurEvents.length).toBe(1);
    });
  });

  describe('prefix and suffix', () => {
    it('should render prefix when provided', () => {
      hostComponent.prefix = '$';
      fixture.detectChanges();
      const prefix = hostElement.querySelector('.coar-number-input-prefix');
      expect(prefix?.textContent).toContain('$');
    });

    it('should render suffix when provided', () => {
      hostComponent.suffix = 'kg';
      fixture.detectChanges();
      const suffix = hostElement.querySelector('.coar-number-input-suffix');
      expect(suffix?.textContent).toContain('kg');
    });
  });

  describe('html attributes', () => {
    it('should set id attribute', () => {
      hostComponent.inputId = 'my-number-input';
      fixture.detectChanges();
      expect(getInputElement()?.id).toBe('my-number-input');
    });

    it('should set name attribute', () => {
      hostComponent.name = 'quantity';
      fixture.detectChanges();
      expect(getInputElement()?.name).toBe('quantity');
    });
  });

  describe('keyboard navigation', () => {
    it('should increment on ArrowUp', () => {
      hostComponent.value = 5;
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      getInputElement()?.dispatchEvent(event);
      fixture.detectChanges();

      expect(hostComponent.value).toBe(6);
    });

    it('should decrement on ArrowDown', () => {
      hostComponent.value = 5;
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      getInputElement()?.dispatchEvent(event);
      fixture.detectChanges();

      expect(hostComponent.value).toBe(4);
    });
  });

  describe('accessibility', () => {
    it('should associate message with input via aria-describedby', () => {
      hostComponent.hint = 'A helpful hint';
      fixture.detectChanges();

      const input = getInputElement();
      const message = getMessageElement();
      expect(input?.getAttribute('aria-describedby')).toBe(message?.id);
    });

    it('should set aria-invalid when error is present', () => {
      hostComponent.error = 'Error message';
      fixture.detectChanges();
      expect(getInputElement()?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-valuemin when min is set', () => {
      hostComponent.min = 0;
      fixture.detectChanges();
      expect(getInputElement()?.getAttribute('aria-valuemin')).toBe('0');
    });

    it('should set aria-valuemax when max is set', () => {
      hostComponent.max = 100;
      fixture.detectChanges();
      expect(getInputElement()?.getAttribute('aria-valuemax')).toBe('100');
    });

    it('should set aria-valuenow when value is set', () => {
      hostComponent.value = 42;
      fixture.detectChanges();
      expect(getInputElement()?.getAttribute('aria-valuenow')).toBe('42');
    });
  });

  describe('clear button', () => {
    it('should clear value when clear icon is clicked', () => {
      hostComponent.value = 50;
      hostComponent.clearable = true;
      fixture.detectChanges();

      // The clear icon is always rendered but hidden via CSS when not applicable
      const clearIcon = hostElement.querySelector('.coar-number-input-clear');
      clearIcon?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(hostComponent.value).toBeNull();
      expect(hostComponent.clearCount).toBe(1);
    });

    it('should focus input after clearing', () => {
      hostComponent.value = 50;
      hostComponent.clearable = true;
      fixture.detectChanges();

      const input = getInputElement();
      const focusSpy = vi.spyOn(input!, 'focus');

      const clearIcon = hostElement.querySelector('.coar-number-input-clear');
      clearIcon?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('label click', () => {
    it('should have label associated with input via for attribute', () => {
      hostComponent.label = 'Test Label';
      fixture.detectChanges();

      const input = getInputElement();
      const label = hostElement.querySelector('.coar-number-input-label');

      expect(label).toBeTruthy();
      expect(label?.getAttribute('for')).toBe(input?.id);
    });
  });

  describe('drag to change value', () => {
    function getLabel(): HTMLElement | null {
      return hostElement.querySelector('.coar-number-input-label');
    }

    it('should not start drag when disabled', () => {
      hostComponent.label = 'Test';
      hostComponent.value = 50;
      hostComponent.disabled = true;
      fixture.detectChanges();

      const label = getLabel();
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Value should remain unchanged since drag should not start
      expect(hostComponent.value).toBe(50);
    });

    it('should not start drag when readonly', () => {
      hostComponent.label = 'Test';
      hostComponent.value = 50;
      hostComponent.readonly = true;
      fixture.detectChanges();

      const label = getLabel();
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Value should remain unchanged since drag should not start
      expect(hostComponent.value).toBe(50);
    });

    it('should set cursor to ew-resize during drag', () => {
      hostComponent.label = 'Test';
      hostComponent.value = 50;
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
      hostComponent.label = 'Test';
      hostComponent.value = 50;
      hostComponent.step = 1;
      fixture.detectChanges();

      const label = getLabel();

      // Start drag at position 100
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Move 30 pixels to the right (should increment by 3 steps with 10px sensitivity)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 130 }));
      fixture.detectChanges();

      expect(hostComponent.value).toBe(53);

      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('should decrement value when dragging left', () => {
      hostComponent.label = 'Test';
      hostComponent.value = 50;
      hostComponent.step = 1;
      fixture.detectChanges();

      const label = getLabel();

      // Start drag at position 100
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Move 20 pixels to the left (should decrement by 2 steps)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 80 }));
      fixture.detectChanges();

      expect(hostComponent.value).toBe(48);

      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('should respect min/max during drag', () => {
      hostComponent.label = 'Test';
      hostComponent.value = 50;
      hostComponent.step = 1;
      hostComponent.max = 52;
      fixture.detectChanges();

      const label = getLabel();

      // Start drag at position 100
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Move 50 pixels to the right (would be 5 steps, but clamped to max)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }));
      fixture.detectChanges();

      expect(hostComponent.value).toBe(52);

      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('should reset cursor on drag end', () => {
      hostComponent.label = 'Test';
      hostComponent.value = 50;
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
      hostComponent.value = 50;
      fixture.detectChanges();

      // Move without starting drag
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200 }));
      fixture.detectChanges();

      // Value should remain unchanged
      expect(hostComponent.value).toBe(50);
    });

    it('should use custom step during drag', () => {
      hostComponent.label = 'Test';
      hostComponent.value = 50;
      hostComponent.step = 5;
      fixture.detectChanges();

      const label = getLabel();

      // Start drag at position 100
      label?.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true }));
      fixture.detectChanges();

      // Move 20 pixels (2 step counts with step=5)
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 120 }));
      fixture.detectChanges();

      expect(hostComponent.value).toBe(60); // 50 + 2*5

      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });
  });
});
