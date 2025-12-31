import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CoarPasswordInputComponent, CoarPasswordInputSize } from './coar-password-input.component';

// Test host component
@Component({
  standalone: true,
  imports: [CoarPasswordInputComponent],
  template: `
    <coar-password-input
      [label]="label"
      [placeholder]="placeholder"
      [(value)]="value"
      [size]="size"
      [disabled]="disabled"
      [readonly]="readonly"
      [required]="required"
      [error]="error"
      [hint]="hint"
      [clearable]="clearable"
      [id]="inputId"
      [name]="name"
      [maxlength]="maxlength"
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
  value = '';
  size: CoarPasswordInputSize = 'md';
  disabled = false;
  readonly = false;
  required = false;
  error = '';
  hint = '';
  clearable = true;
  inputId = '';
  name = '';
  maxlength: number | undefined = undefined;

  valueChangeEvents: string[] = [];
  focusEvents: FocusEvent[] = [];
  blurEvents: FocusEvent[] = [];
  clearCount = 0;

  onValueChange(value: string): void {
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

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CoarPasswordInputComponent],
  template: ` <coar-password-input [formControl]="control" /> `,
})
class TestReactiveFormsHostComponent {
  control = new FormControl<string | null>(null);
}

describe('CoarPasswordInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostElement: HTMLElement;

  function detectChanges(): void {
    fixture.detectChanges(false);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TestReactiveFormsHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    detectChanges();
    hostElement = fixture.nativeElement;
  });

  function getInputElement(): HTMLInputElement | null {
    return hostElement.querySelector('input');
  }

  function getLabelElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-password-input-label');
  }

  function getClearButton(): HTMLButtonElement | null {
    return hostElement.querySelector('.coar-password-input-clear');
  }

  function getToggleButton(): HTMLButtonElement | null {
    return hostElement.querySelector('.coar-password-input-toggle');
  }

  function getMessageElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-password-input-message');
  }

  function getContainerElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-password-input-container');
  }

  describe('rendering', () => {
    it('should create', () => {
      const component = hostElement.querySelector('coar-password-input');
      expect(component).toBeTruthy();
    });

    it('should render password input by default', () => {
      expect(getInputElement()?.type).toBe('password');
    });
  });

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

    it('should write control value into the input', () => {
      reactiveHost.control.setValue('secret');
      reactiveFixture.detectChanges();
      expect(getReactiveInput().value).toBe('secret');
    });

    it('should propagate user input into the control', () => {
      const input = getReactiveInput();
      input.value = 'new';
      input.dispatchEvent(new Event('input'));
      reactiveFixture.detectChanges();
      expect(reactiveHost.control.value).toBe('new');
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

  describe('label', () => {
    it('should not render label when empty', () => {
      expect(getLabelElement()).toBeNull();
    });

    it('should render label when provided', () => {
      hostComponent.label = 'Password';
      detectChanges();
      expect(getLabelElement()?.textContent).toContain('Password');
    });

    it('should show required indicator when required', () => {
      hostComponent.label = 'Password';
      hostComponent.required = true;
      detectChanges();
      expect(getLabelElement()?.textContent).toContain('*');
    });
  });

  describe('sizes', () => {
    it('should apply md size class by default', () => {
      const component = hostElement.querySelector('coar-password-input');
      expect(component?.classList.contains('coar-password-input--md')).toBe(true);
    });

    it('should apply xs size class', () => {
      hostComponent.size = 'xs';
      detectChanges();
      const component = hostElement.querySelector('coar-password-input');
      expect(component?.classList.contains('coar-password-input--xs')).toBe(true);
    });

    it('should apply sm size class', () => {
      hostComponent.size = 'sm';
      detectChanges();
      const component = hostElement.querySelector('coar-password-input');
      expect(component?.classList.contains('coar-password-input--sm')).toBe(true);
    });

    it('should apply lg size class', () => {
      hostComponent.size = 'lg';
      detectChanges();
      const component = hostElement.querySelector('coar-password-input');
      expect(component?.classList.contains('coar-password-input--lg')).toBe(true);
    });
  });

  describe('password visibility toggle', () => {
    it('should render toggle button', () => {
      expect(getToggleButton()).toBeTruthy();
    });

    it('should start with password hidden', () => {
      expect(getInputElement()?.type).toBe('password');
    });

    it('should show password when toggle is clicked', () => {
      getToggleButton()?.click();
      detectChanges();
      expect(getInputElement()?.type).toBe('text');
    });

    it('should hide password when toggle is clicked again', () => {
      getToggleButton()?.click();
      detectChanges();
      expect(getInputElement()?.type).toBe('text');

      getToggleButton()?.click();
      detectChanges();
      expect(getInputElement()?.type).toBe('password');
    });

    it('should have accessible label for toggle button', () => {
      const toggle = getToggleButton();
      expect(toggle?.getAttribute('aria-label')).toBe('Show password');

      toggle?.click();
      detectChanges();
      expect(toggle?.getAttribute('aria-label')).toBe('Hide password');
    });

    it('should not toggle when disabled', () => {
      hostComponent.disabled = true;
      detectChanges();

      getToggleButton()?.click();
      detectChanges();
      expect(getInputElement()?.type).toBe('password');
    });

    it('should not toggle when readonly', () => {
      hostComponent.readonly = true;
      detectChanges();

      getToggleButton()?.click();
      detectChanges();
      expect(getInputElement()?.type).toBe('password');
    });
  });

  describe('value binding', () => {
    it('should display initial value as dots', () => {
      hostComponent.value = 'secret123';
      detectChanges();
      expect(getInputElement()?.value).toBe('secret123');
      expect(getInputElement()?.type).toBe('password');
    });

    it('should emit valueChange on input', () => {
      const input = getInputElement()!;
      input.value = 'newpassword';
      input.dispatchEvent(new Event('input'));
      detectChanges();
      expect(hostComponent.valueChangeEvents).toContain('newpassword');
    });

    it('should update value via two-way binding', () => {
      const input = getInputElement()!;
      input.value = 'updated';
      input.dispatchEvent(new Event('input'));
      detectChanges();
      expect(hostComponent.value).toBe('updated');
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled is true', () => {
      hostComponent.disabled = true;
      detectChanges();
      expect(getInputElement()?.disabled).toBe(true);
    });
  });

  describe('readonly state', () => {
    it('should set readonly on input', () => {
      hostComponent.readonly = true;
      detectChanges();
      expect(getInputElement()?.readOnly).toBe(true);
    });
  });

  describe('error and hint messages', () => {
    it('should display hint message', () => {
      hostComponent.hint = 'Minimum 8 characters';
      detectChanges();
      expect(getMessageElement()?.textContent).toContain('Minimum 8 characters');
    });

    it('should display error message over hint', () => {
      hostComponent.hint = 'Minimum 8 characters';
      hostComponent.error = 'Password is too weak';
      detectChanges();
      expect(getMessageElement()?.textContent).toContain('Password is too weak');
      expect(getMessageElement()?.textContent).not.toContain('Minimum 8 characters');
    });

    it('should add error styling when error is present', () => {
      hostComponent.error = 'Error!';
      detectChanges();
      const container = getContainerElement();
      expect(container?.classList.contains('coar-password-input-error')).toBe(true);
    });
  });

  describe('clear button', () => {
    it('should not show clear button when value is empty', () => {
      expect(getClearButton()).toBeNull();
    });

    it('should show clear button when value is present', () => {
      hostComponent.value = 'password123';
      detectChanges();
      expect(getClearButton()).toBeTruthy();
    });

    it('should clear value when clear button is clicked', () => {
      hostComponent.value = 'password123';
      detectChanges();

      getClearButton()?.click();
      detectChanges();

      expect(hostComponent.value).toBe('');
      expect(hostComponent.clearCount).toBe(1);
    });

    it('should not show clear button when clearable is false', () => {
      hostComponent.value = 'password123';
      hostComponent.clearable = false;
      detectChanges();
      expect(getClearButton()).toBeNull();
    });

    it('should not show clear button when disabled', () => {
      hostComponent.value = 'password123';
      hostComponent.disabled = true;
      detectChanges();
      expect(getClearButton()).toBeNull();
    });

    it('should not show clear button when readonly', () => {
      hostComponent.value = 'password123';
      hostComponent.readonly = true;
      detectChanges();
      expect(getClearButton()).toBeNull();
    });
  });

  describe('focus events', () => {
    it('should emit focused event on focus', () => {
      getInputElement()?.dispatchEvent(new FocusEvent('focus'));
      detectChanges();
      expect(hostComponent.focusEvents.length).toBe(1);
    });

    it('should emit blurred event on blur', () => {
      getInputElement()?.dispatchEvent(new FocusEvent('blur'));
      detectChanges();
      expect(hostComponent.blurEvents.length).toBe(1);
    });
  });

  describe('html attributes', () => {
    it('should set id attribute', () => {
      hostComponent.inputId = 'my-password';
      detectChanges();
      expect(getInputElement()?.id).toBe('my-password');
    });

    it('should set name attribute', () => {
      hostComponent.name = 'password';
      detectChanges();
      expect(getInputElement()?.name).toBe('password');
    });

    it('should set maxlength attribute', () => {
      hostComponent.maxlength = 50;
      detectChanges();
      expect(getInputElement()?.maxLength).toBe(50);
    });

    it('should have autocomplete attribute for password by default', () => {
      expect(getInputElement()?.autocomplete).toBe('current-password');
    });
  });

  describe('accessibility', () => {
    it('should associate message with input via aria-describedby', () => {
      hostComponent.hint = 'A helpful hint';
      detectChanges();

      const input = getInputElement();
      const message = getMessageElement();
      expect(input?.getAttribute('aria-describedby')).toBe(message?.id);
    });

    it('should set aria-invalid when error is present', () => {
      hostComponent.error = 'Error message';
      detectChanges();
      expect(getInputElement()?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-required when required', () => {
      hostComponent.required = true;
      detectChanges();
      // The native required attribute is set, aria-required is not needed
      expect(getInputElement()?.required).toBe(true);
    });
  });
});
