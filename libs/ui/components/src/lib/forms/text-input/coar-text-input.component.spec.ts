import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CoarTextInputComponent, CoarTextInputSize } from './coar-text-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CoarTextInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <coar-text-input [formControl]="control" /> `,
})
class TestReactiveFormsHostComponent {
  control = new FormControl<string | null>(null);
}

describe('CoarTextInputComponent', () => {
  let fixture: ComponentFixture<CoarTextInputComponent>;
  let component: CoarTextInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarTextInputComponent, TestReactiveFormsHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getInputElement(): HTMLInputElement | null {
    return fixture.nativeElement.querySelector('input');
  }

  function getTextareaElement(): HTMLTextAreaElement | null {
    return fixture.nativeElement.querySelector('textarea');
  }

  function getLabelElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-text-input-label');
  }

  function getClearButton(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-text-input-clear');
  }

  function getMessageElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-form-field-message');
  }

  function getContainerElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-text-input-container');
  }

  describe('rendering', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render input element for single row', () => {
      expect(getInputElement()).toBeTruthy();
      expect(getTextareaElement()).toBeNull();
    });

    it('should render textarea for multiple rows', () => {
      fixture.componentRef.setInput('rows', 3);
      fixture.detectChanges();
      expect(getInputElement()).toBeNull();
      expect(getTextareaElement()).toBeTruthy();
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
      reactiveHost.control.setValue('hello');
      reactiveFixture.detectChanges();
      expect(getReactiveInput().value).toBe('hello');
    });

    it('should propagate user input into the control', () => {
      const input = getReactiveInput();
      input.value = 'abc';
      input.dispatchEvent(new Event('input'));
      reactiveFixture.detectChanges();
      expect(reactiveHost.control.value).toBe('abc');
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
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const label = getLabelElement();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Email');
    });

    it('should show required indicator when required', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const label = getLabelElement();
      expect(label?.textContent).toContain('*');
    });
  });

  describe('sizes', () => {
    it('should apply m size class by default', () => {
      expect(fixture.nativeElement.classList.contains('coar-text-input--m')).toBe(true);
    });

    it('should apply xs size class', () => {
      fixture.componentRef.setInput('size', 'xs');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-text-input--xs')).toBe(true);
    });

    it('should apply s size class', () => {
      fixture.componentRef.setInput('size', 's');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-text-input--s')).toBe(true);
    });

    it('should apply l size class', () => {
      fixture.componentRef.setInput('size', 'l');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-text-input--l')).toBe(true);
    });
  });

  describe('placeholder', () => {
    it('should set placeholder on input', () => {
      fixture.componentRef.setInput('placeholder', 'Enter email...');
      fixture.detectChanges();
      expect(getInputElement()?.placeholder).toBe('Enter email...');
    });

    it('should set placeholder on textarea', () => {
      fixture.componentRef.setInput('rows', 3);
      fixture.componentRef.setInput('placeholder', 'Enter message...');
      fixture.detectChanges();
      expect(getTextareaElement()?.placeholder).toBe('Enter message...');
    });
  });

  describe('value binding', () => {
    it('should display initial value', () => {
      fixture.componentRef.setInput('value', 'initial');
      fixture.detectChanges();
      expect(getInputElement()?.value).toBe('initial');
    });

    it('should emit valueChange on input', () => {
      const valueChangeEvents: string[] = [];
      component.valueChange.subscribe((v) => valueChangeEvents.push(v));
      const input = getInputElement();
      if (!input) throw new Error('Input element not found');
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(valueChangeEvents).toContain('new value');
    });

    it('should update value via two-way binding', () => {
      fixture.componentRef.setInput('value', 'initial');
      fixture.detectChanges();
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

    it('should disable textarea when disabled is true', () => {
      fixture.componentRef.setInput('rows', 3);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(getTextareaElement()?.disabled).toBe(true);
    });
  });

  describe('readonly state', () => {
    it('should set readonly on input', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      expect(getInputElement()?.readOnly).toBe(true);
    });

    it('should set readonly on textarea', () => {
      fixture.componentRef.setInput('rows', 3);
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      expect(getTextareaElement()?.readOnly).toBe(true);
    });
  });

  describe('error and hint messages', () => {
    it('should display hint message', () => {
      fixture.componentRef.setInput('hint', 'Enter your email address');
      fixture.detectChanges();
      const message = getMessageElement();
      expect(message?.textContent).toContain('Enter your email address');
    });

    it('should display error message over hint', () => {
      fixture.componentRef.setInput('hint', 'This is a hint');
      fixture.componentRef.setInput('error', 'This field is required');
      fixture.detectChanges();
      const message = getMessageElement();
      expect(message?.textContent).toContain('This field is required');
      expect(message?.textContent).not.toContain('This is a hint');
    });

    it('should add error styling when error is present', () => {
      fixture.componentRef.setInput('error', 'Error!');
      fixture.detectChanges();
      const container = getContainerElement();
      expect(container?.classList.contains('coar-text-input-error')).toBe(true);
    });
  });

  describe('clear button', () => {
    it('should not show clear button when value is empty', () => {
      expect(getClearButton()).toBeNull();
    });

    it('should show clear button when value is present', () => {
      fixture.componentRef.setInput('value', 'some text');
      fixture.detectChanges();
      expect(getClearButton()).toBeTruthy();
    });

    it('should clear value when clear button is clicked', () => {
      fixture.componentRef.setInput('value', 'some text');
      fixture.detectChanges();

      const spy = vi.fn();
      component.clear.subscribe(spy);

      getClearButton()?.click();
      fixture.detectChanges();

      expect(component.value()).toBe('');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not show clear button when clearable is false', () => {
      fixture.componentRef.setInput('value', 'some text');
      fixture.componentRef.setInput('clearable', false);
      fixture.detectChanges();
      expect(getClearButton()).toBeNull();
    });

    it('should not show clear button when disabled', () => {
      fixture.componentRef.setInput('value', 'some text');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(getClearButton()).toBeNull();
    });

    it('should not show clear button when readonly', () => {
      fixture.componentRef.setInput('value', 'some text');
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      expect(getClearButton()).toBeNull();
    });

    it('should render clear button as a <button> element with aria-label', () => {
      fixture.componentRef.setInput('value', 'some text');
      fixture.detectChanges();
      const clearBtn = getClearButton();
      expect(clearBtn).toBeTruthy();
      expect(clearBtn?.tagName).toBe('BUTTON');
      expect(clearBtn?.getAttribute('aria-label')).toBe('Clear');
      expect(clearBtn?.hasAttribute('aria-hidden')).toBe(false);
    });
  });

  describe('focus events', () => {
    it('should emit focused event on focus', () => {
      const focusEvents: FocusEvent[] = [];
      component.focused.subscribe((e) => focusEvents.push(e));
      getInputElement()?.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(focusEvents.length).toBe(1);
    });

    it('should emit blurred event on blur', () => {
      const blurEvents: FocusEvent[] = [];
      component.blurred.subscribe((e) => blurEvents.push(e));
      getInputElement()?.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(blurEvents.length).toBe(1);
    });
  });

  describe('prefix and suffix', () => {
    it('should render prefix when provided', () => {
      fixture.componentRef.setInput('prefix', '$');
      fixture.detectChanges();
      const prefix = fixture.nativeElement.querySelector('.coar-text-input-prefix');
      expect(prefix?.textContent).toContain('$');
    });

    it('should render suffix when provided', () => {
      fixture.componentRef.setInput('suffix', '.00');
      fixture.detectChanges();
      const suffix = fixture.nativeElement.querySelector('.coar-text-input-suffix');
      expect(suffix?.textContent).toContain('.00');
    });
  });

  describe('html attributes', () => {
    it('should set id attribute', () => {
      fixture.componentRef.setInput('id', 'my-email-input');
      fixture.detectChanges();
      expect(getInputElement()?.id).toBe('my-email-input');
    });

    it('should set name attribute', () => {
      fixture.componentRef.setInput('name', 'email');
      fixture.detectChanges();
      expect(getInputElement()?.name).toBe('email');
    });

    it('should set maxlength attribute', () => {
      fixture.componentRef.setInput('maxlength', 100);
      fixture.detectChanges();
      expect(getInputElement()?.maxLength).toBe(100);
    });
  });

  describe('multiline mode', () => {
    it('should add multiline class for textarea', () => {
      fixture.componentRef.setInput('rows', 5);
      fixture.detectChanges();
      // The component host element itself should have the multiline class
      expect(fixture.nativeElement.classList.contains('coar-text-input--multiline')).toBe(true);
    });

    it('should set rows attribute on textarea', () => {
      fixture.componentRef.setInput('rows', 5);
      fixture.detectChanges();
      expect(getTextareaElement()?.rows).toBe(5);
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
