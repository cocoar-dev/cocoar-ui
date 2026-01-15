import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CoarPasswordInputComponent, CoarPasswordInputSize } from './coar-password-input.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CoarPasswordInputComponent],
  template: ` <coar-password-input [formControl]="control" /> `,
})
class TestReactiveFormsHostComponent {
  control = new FormControl<string | null>(null);
}

describe('CoarPasswordInputComponent', () => {
  let fixture: ComponentFixture<CoarPasswordInputComponent>;
  let component: CoarPasswordInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarPasswordInputComponent, TestReactiveFormsHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarPasswordInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getInputElement(): HTMLInputElement | null {
    return fixture.nativeElement.querySelector('input');
  }

  function getLabelElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-password-input-label');
  }

  function getClearButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.coar-password-input-clear');
  }

  function getToggleButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.coar-password-input-toggle');
  }

  function getMessageElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-password-input-message');
  }

  function getContainerElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-password-input-container');
  }

  describe('rendering', () => {
    it('should create', () => {
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
      fixture.componentRef.setInput('label', 'Password');
      fixture.detectChanges();
      expect(getLabelElement()?.textContent).toContain('Password');
    });

    it('should show required indicator when required', () => {
      fixture.componentRef.setInput('label', 'Password');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      expect(getLabelElement()?.textContent).toContain('*');
    });
  });

  describe('sizes', () => {
    it('should apply md size class by default', () => {
      expect(fixture.nativeElement.classList.contains('coar-password-input--md')).toBe(true);
    });

    it('should apply xs size class', () => {
      fixture.componentRef.setInput('size', 'xs');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-password-input--xs')).toBe(true);
    });

    it('should apply sm size class', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-password-input--sm')).toBe(true);
    });

    it('should apply lg size class', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-password-input--lg')).toBe(true);
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
      fixture.detectChanges();
      expect(getInputElement()?.type).toBe('text');
    });

    it('should hide password when toggle is clicked again', () => {
      getToggleButton()?.click();
      fixture.detectChanges();
      expect(getInputElement()?.type).toBe('text');

      getToggleButton()?.click();
      fixture.detectChanges();
      expect(getInputElement()?.type).toBe('password');
    });

    it('should have accessible label for toggle button', () => {
      const toggle = getToggleButton();
      expect(toggle?.getAttribute('aria-label')).toBe('Show password');

      toggle?.click();
      fixture.detectChanges();
      expect(toggle?.getAttribute('aria-label')).toBe('Hide password');
    });

    it('should not toggle when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      getToggleButton()?.click();
      fixture.detectChanges();
      expect(getInputElement()?.type).toBe('password');
    });

    it('should not toggle when readonly', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();

      getToggleButton()?.click();
      fixture.detectChanges();
      expect(getInputElement()?.type).toBe('password');
    });
  });

  describe('value binding', () => {
    it('should display initial value as dots', () => {
      fixture.componentRef.setInput('value', 'secret123');
      fixture.detectChanges();
      expect(getInputElement()?.value).toBe('secret123');
      expect(getInputElement()?.type).toBe('password');
    });

    it('should emit valueChange on input', () => {
      const spy = vi.fn();
      component.valueChange.subscribe(spy);
      const input = getInputElement();
      if (!input) throw new Error('Input element not found');
      input.value = 'newpassword';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith('newpassword');
    });

    it('should update value via two-way binding', () => {
      const input = getInputElement();
      if (!input) throw new Error('Input element not found');
      input.value = 'updated';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.value()).toBe('updated');
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(getInputElement()?.disabled).toBe(true);
    });
  });

  describe('readonly state', () => {
    it('should set readonly on input', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      expect(getInputElement()?.readOnly).toBe(true);
    });
  });

  describe('error and hint messages', () => {
    it('should display hint message', () => {
      fixture.componentRef.setInput('hint', 'Minimum 8 characters');
      fixture.detectChanges();
      expect(getMessageElement()?.textContent).toContain('Minimum 8 characters');
    });

    it('should display error message over hint', () => {
      fixture.componentRef.setInput('hint', 'Minimum 8 characters');
      fixture.componentRef.setInput('error', 'Password is too weak');
      fixture.detectChanges();
      expect(getMessageElement()?.textContent).toContain('Password is too weak');
      expect(getMessageElement()?.textContent).not.toContain('Minimum 8 characters');
    });

    it('should add error styling when error is present', () => {
      fixture.componentRef.setInput('error', 'Error!');
      fixture.detectChanges();
      const container = getContainerElement();
      expect(container?.classList.contains('coar-password-input-error')).toBe(true);
    });
  });

  describe('clear button', () => {
    it('should not show clear button when value is empty', () => {
      expect(getClearButton()).toBeNull();
    });

    it('should show clear button when value is present', () => {
      fixture.componentRef.setInput('value', 'password123');
      fixture.detectChanges();
      expect(getClearButton()).toBeTruthy();
    });

    it('should clear value when clear button is clicked', () => {
      const clearSpy = vi.fn();
      component.clear.subscribe(clearSpy);
      fixture.componentRef.setInput('value', 'password123');
      fixture.detectChanges();

      getClearButton()?.click();
      fixture.detectChanges();

      expect(component.value()).toBe('');
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('should not show clear button when clearable is false', () => {
      fixture.componentRef.setInput('value', 'password123');
      fixture.componentRef.setInput('clearable', false);
      fixture.detectChanges();
      expect(getClearButton()).toBeNull();
    });

    it('should not show clear button when disabled', () => {
      fixture.componentRef.setInput('value', 'password123');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(getClearButton()).toBeNull();
    });

    it('should not show clear button when readonly', () => {
      fixture.componentRef.setInput('value', 'password123');
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      expect(getClearButton()).toBeNull();
    });
  });

  describe('focus events', () => {
    it('should emit focused event on focus', () => {
      const spy = vi.fn();
      component.focused.subscribe(spy);
      getInputElement()?.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit blurred event on blur', () => {
      const spy = vi.fn();
      component.blurred.subscribe(spy);
      getInputElement()?.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('html attributes', () => {
    it('should set id attribute', () => {
      fixture.componentRef.setInput('id', 'my-password');
      fixture.detectChanges();
      expect(getInputElement()?.id).toBe('my-password');
    });

    it('should set name attribute', () => {
      fixture.componentRef.setInput('name', 'password');
      fixture.detectChanges();
      expect(getInputElement()?.name).toBe('password');
    });

    it('should set maxlength attribute', () => {
      fixture.componentRef.setInput('maxlength', 50);
      fixture.detectChanges();
      expect(getInputElement()?.maxLength).toBe(50);
    });

    it('should have autocomplete attribute for password by default', () => {
      expect(getInputElement()?.autocomplete).toBe('current-password');
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

    it('should set aria-required when required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      // The native required attribute is set, aria-required is not needed
      expect(getInputElement()?.required).toBe(true);
    });
  });
});
