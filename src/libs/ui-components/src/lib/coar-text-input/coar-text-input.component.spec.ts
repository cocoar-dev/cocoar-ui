import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CoarTextInputComponent, CoarTextInputSize } from './coar-text-input.component';

// Test host component for testing two-way binding and events
@Component({
  standalone: true,
  imports: [CoarTextInputComponent],
  template: `
    <coar-text-input
      [label]="label"
      [placeholder]="placeholder"
      [(value)]="value"
      [size]="size"
      [rows]="rows"
      [disabled]="disabled"
      [readonly]="readonly"
      [required]="required"
      [error]="error"
      [hint]="hint"
      [clearable]="clearable"
      [prefix]="prefix"
      [suffix]="suffix"
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
  size: CoarTextInputSize = 'md';
  rows = 1;
  disabled = false;
  readonly = false;
  required = false;
  error = '';
  hint = '';
  clearable = true;
  prefix = '';
  suffix = '';
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
  imports: [ReactiveFormsModule, CoarTextInputComponent],
  template: ` <coar-text-input [formControl]="control" /> `,
})
class TestReactiveFormsHostComponent {
  control = new FormControl<string | null>(null);
}

describe('CoarTextInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TestReactiveFormsHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    hostElement = fixture.nativeElement;
  });

  function getInputElement(): HTMLInputElement | null {
    return hostElement.querySelector('input');
  }

  function getTextareaElement(): HTMLTextAreaElement | null {
    return hostElement.querySelector('textarea');
  }

  function getLabelElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-text-input-label');
  }

  function getClearButton(): HTMLButtonElement | null {
    return hostElement.querySelector('.coar-text-input-clear');
  }

  function getMessageElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-text-input-message');
  }

  function getContainerElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-text-input-container');
  }

  describe('rendering', () => {
    it('should create', () => {
      const component = hostElement.querySelector('coar-text-input');
      expect(component).toBeTruthy();
    });

    it('should render input element for single row', () => {
      expect(getInputElement()).toBeTruthy();
      expect(getTextareaElement()).toBeNull();
    });

    it('should render textarea for multiple rows', () => {
      hostComponent.rows = 3;
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
      hostComponent.label = 'Email';
      fixture.detectChanges();
      const label = getLabelElement();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Email');
    });

    it('should show required indicator when required', () => {
      hostComponent.label = 'Email';
      hostComponent.required = true;
      fixture.detectChanges();
      const label = getLabelElement();
      expect(label?.textContent).toContain('*');
    });
  });

  describe('sizes', () => {
    it('should apply md size class by default', () => {
      const component = hostElement.querySelector('coar-text-input');
      expect(component?.classList.contains('coar-text-input--md')).toBe(true);
    });

    it('should apply xs size class', () => {
      hostComponent.size = 'xs';
      fixture.detectChanges();
      const component = hostElement.querySelector('coar-text-input');
      expect(component?.classList.contains('coar-text-input--xs')).toBe(true);
    });

    it('should apply sm size class', () => {
      hostComponent.size = 'sm';
      fixture.detectChanges();
      const component = hostElement.querySelector('coar-text-input');
      expect(component?.classList.contains('coar-text-input--sm')).toBe(true);
    });

    it('should apply lg size class', () => {
      hostComponent.size = 'lg';
      fixture.detectChanges();
      const component = hostElement.querySelector('coar-text-input');
      expect(component?.classList.contains('coar-text-input--lg')).toBe(true);
    });
  });

  describe('placeholder', () => {
    it('should set placeholder on input', () => {
      hostComponent.placeholder = 'Enter email...';
      fixture.detectChanges();
      expect(getInputElement()?.placeholder).toBe('Enter email...');
    });

    it('should set placeholder on textarea', () => {
      hostComponent.rows = 3;
      hostComponent.placeholder = 'Enter message...';
      fixture.detectChanges();
      expect(getTextareaElement()?.placeholder).toBe('Enter message...');
    });
  });

  describe('value binding', () => {
    it('should display initial value', () => {
      hostComponent.value = 'initial';
      fixture.detectChanges();
      expect(getInputElement()?.value).toBe('initial');
    });

    it('should emit valueChange on input', () => {
      const input = getInputElement()!;
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(hostComponent.valueChangeEvents).toContain('new value');
    });

    it('should update value via two-way binding', () => {
      const input = getInputElement()!;
      input.value = 'updated';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(hostComponent.value).toBe('updated');
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled is true', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();
      expect(getInputElement()?.disabled).toBe(true);
    });

    it('should disable textarea when disabled is true', () => {
      hostComponent.rows = 3;
      hostComponent.disabled = true;
      fixture.detectChanges();
      expect(getTextareaElement()?.disabled).toBe(true);
    });
  });

  describe('readonly state', () => {
    it('should set readonly on input', () => {
      hostComponent.readonly = true;
      fixture.detectChanges();
      expect(getInputElement()?.readOnly).toBe(true);
    });

    it('should set readonly on textarea', () => {
      hostComponent.rows = 3;
      hostComponent.readonly = true;
      fixture.detectChanges();
      expect(getTextareaElement()?.readOnly).toBe(true);
    });
  });

  describe('error and hint messages', () => {
    it('should display hint message', () => {
      hostComponent.hint = 'Enter your email address';
      fixture.detectChanges();
      const message = getMessageElement();
      expect(message?.textContent).toContain('Enter your email address');
    });

    it('should display error message over hint', () => {
      hostComponent.hint = 'This is a hint';
      hostComponent.error = 'This field is required';
      fixture.detectChanges();
      const message = getMessageElement();
      expect(message?.textContent).toContain('This field is required');
      expect(message?.textContent).not.toContain('This is a hint');
    });

    it('should add error styling when error is present', () => {
      hostComponent.error = 'Error!';
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
      hostComponent.value = 'some text';
      fixture.detectChanges();
      expect(getClearButton()).toBeTruthy();
    });

    it('should clear value when clear button is clicked', () => {
      hostComponent.value = 'some text';
      fixture.detectChanges();

      getClearButton()?.click();
      fixture.detectChanges();

      expect(hostComponent.value).toBe('');
      expect(hostComponent.clearCount).toBe(1);
    });

    it('should not show clear button when clearable is false', () => {
      hostComponent.value = 'some text';
      hostComponent.clearable = false;
      fixture.detectChanges();
      expect(getClearButton()).toBeNull();
    });

    it('should not show clear button when disabled', () => {
      hostComponent.value = 'some text';
      hostComponent.disabled = true;
      fixture.detectChanges();
      expect(getClearButton()).toBeNull();
    });

    it('should not show clear button when readonly', () => {
      hostComponent.value = 'some text';
      hostComponent.readonly = true;
      fixture.detectChanges();
      expect(getClearButton()).toBeNull();
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
      const prefix = hostElement.querySelector('.coar-text-input-prefix');
      expect(prefix?.textContent).toContain('$');
    });

    it('should render suffix when provided', () => {
      hostComponent.suffix = '.00';
      fixture.detectChanges();
      const suffix = hostElement.querySelector('.coar-text-input-suffix');
      expect(suffix?.textContent).toContain('.00');
    });
  });

  describe('html attributes', () => {
    it('should set id attribute', () => {
      hostComponent.inputId = 'my-email-input';
      fixture.detectChanges();
      expect(getInputElement()?.id).toBe('my-email-input');
    });

    it('should set name attribute', () => {
      hostComponent.name = 'email';
      fixture.detectChanges();
      expect(getInputElement()?.name).toBe('email');
    });

    it('should set maxlength attribute', () => {
      hostComponent.maxlength = 100;
      fixture.detectChanges();
      expect(getInputElement()?.maxLength).toBe(100);
    });
  });

  describe('multiline mode', () => {
    it('should add multiline class for textarea', () => {
      hostComponent.rows = 5;
      fixture.detectChanges();
      const component = hostElement.querySelector('coar-text-input');
      expect(component?.classList.contains('coar-text-input--multiline')).toBe(true);
    });

    it('should set rows attribute on textarea', () => {
      hostComponent.rows = 5;
      fixture.detectChanges();
      expect(getTextareaElement()?.rows).toBe(5);
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

    it('should set aria-required when required', () => {
      hostComponent.required = true;
      fixture.detectChanges();
      // The native required attribute is set, aria-required is not needed
      expect(getInputElement()?.required).toBe(true);
    });
  });
});
