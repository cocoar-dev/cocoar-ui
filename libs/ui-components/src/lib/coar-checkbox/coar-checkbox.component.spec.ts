import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { vi } from 'vitest';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  CoarCheckboxComponent,
  CoarCheckboxSize,
  CoarCheckboxState,
} from './coar-checkbox.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CoarCheckboxComponent],
  template: ` <coar-checkbox [formControl]="control" /> `,
})
class TestReactiveFormsHostComponent {
  control = new FormControl<CoarCheckboxState | undefined | null>(null);
}

describe('CoarCheckboxComponent', () => {
  let component: CoarCheckboxComponent;
  let fixture: ComponentFixture<CoarCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have md size by default', () => {
      expect(component.size()).toBe('md');
    });

    it('should not be disabled by default', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should not be readonly by default', () => {
      expect(component.readonly()).toBe(false);
    });

    it('should not be required by default', () => {
      expect(component.required()).toBe(false);
    });

    it('should have empty label by default', () => {
      expect(component.label()).toBe('');
    });
  });

  describe('size variants', () => {
    it.each(['xs', 'sm', 'md', 'lg'] as CoarCheckboxSize[])(
      'should apply %s size class',
      (size) => {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-checkbox--${size}`);
      }
    );
  });

  describe('checked state', () => {
    it('should support checked state', () => {
      fixture.componentRef.setInput('checked', 'checked');
      fixture.detectChanges();
      expect(component.checked()).toBe('checked');
    });

    it('should support unchecked state', () => {
      fixture.componentRef.setInput('checked', 'unchecked');
      fixture.detectChanges();
      expect(component.checked()).toBe('unchecked');
    });

    it('should support indeterminate state', () => {
      fixture.componentRef.setInput('checked', 'indeterminate');
      fixture.detectChanges();
      expect(component.checked()).toBe('indeterminate');
    });
  });

  describe('disabled state', () => {
    it('should apply disabled class when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-checkbox--disabled');
    });

    it('should have disabled attribute on input when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(true);
    });
  });

  // Reactive forms tests live in a dedicated describe below to keep TestBed configuration isolated.

  describe('readonly state', () => {
    it('should apply readonly class when readonly', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-checkbox--readonly');
    });
  });

  describe('error state', () => {
    it('should apply error class when error message is provided', () => {
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-checkbox--error');
    });

    it('should display error message', () => {
      fixture.componentRef.setInput('error', 'Required field');
      fixture.detectChanges();
      const errorEl = fixture.nativeElement.querySelector('.coar-checkbox-message');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent).toContain('Required field');
    });
  });

  describe('toggle behavior', () => {
    it('should emit checkedChange on click', () => {
      fixture.componentRef.setInput('checked', 'unchecked');
      fixture.detectChanges();

      const spy = vi.fn();
      component.checkedChange.subscribe(spy);

      const input = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it('should toggle from unchecked to checked', () => {
      fixture.componentRef.setInput('checked', 'unchecked');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      expect(component.checked()).toBe('checked');
    });

    it('should toggle from checked to unchecked', () => {
      fixture.componentRef.setInput('checked', 'checked');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      expect(component.checked()).toBe('unchecked');
    });

    it('should not toggle when disabled', () => {
      fixture.componentRef.setInput('checked', 'unchecked');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      expect(component.checked()).toBe('unchecked');
    });
  });

  describe('accessibility', () => {
    it('should have checkbox role', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('checkbox');
    });

    it('should set id on input when provided', () => {
      fixture.componentRef.setInput('id', 'my-checkbox');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.id).toBe('my-checkbox');
    });

    it('should set name on input when provided', () => {
      fixture.componentRef.setInput('name', 'agree');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.name).toBe('agree');
    });
  });
});

@Component({
  standalone: true,
  imports: [CoarCheckboxComponent],
  template: `<coar-checkbox label="Accept terms" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {}

describe('CoarCheckboxComponent with label', () => {
  it('should render label text', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const labelEl = fixture.nativeElement.querySelector('.coar-checkbox-label');
    expect(labelEl).toBeTruthy();
    expect(labelEl.textContent).toContain('Accept terms');
  });
});

describe('CoarCheckboxComponent (Reactive Forms)', () => {
  let fixture: ComponentFixture<TestReactiveFormsHostComponent>;
  let host: TestReactiveFormsHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestReactiveFormsHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestReactiveFormsHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getInput(): HTMLInputElement {
    const el = fixture.nativeElement.querySelector('input') as HTMLInputElement | null;
    if (!el) throw new Error('Expected input element');
    return el;
  }

  it('should write control value into the checkbox', () => {
    host.control.setValue('checked');
    fixture.detectChanges();
    expect(getInput().checked).toBe(true);
  });

  it('should propagate user toggle into the control', () => {
    getInput().click();
    fixture.detectChanges();
    expect(host.control.value).toBe('checked');
  });

  it('should disable the input when the control is disabled', () => {
    host.control.disable();
    fixture.detectChanges();
    expect(getInput().disabled).toBe(true);
  });
});

describe('CoarCheckboxComponent interaction', () => {
  let component: CoarCheckboxComponent;
  let fixture: ComponentFixture<CoarCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('readonly onChange behavior', () => {
    it('should prevent change when readonly and restore checked state', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('checked', 'checked');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      // Simulate user trying to uncheck
      input.checked = false;
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Should restore the original checked state
      expect(input.checked).toBe(true);
    });

    it('should prevent change when readonly and restore unchecked state', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('checked', 'unchecked');
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      // Simulate user trying to check
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Should restore the original unchecked state
      expect(input.checked).toBe(false);
    });
  });

  describe('focus and blur', () => {
    it('should track focus state on focus', () => {
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.coar-checkbox-wrapper');
      expect(wrapper.classList.contains('coar-checkbox-focused')).toBe(true);
    });

    it('should clear focus state on blur', () => {
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      // Focus first
      input.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();

      // Then blur
      input.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.coar-checkbox-wrapper');
      expect(wrapper.classList.contains('coar-checkbox-focused')).toBe(false);
    });
  });

  describe('label click', () => {
    it('should toggle checkbox when label wrapper is clicked', () => {
      // Label wrapper is a <label> that contains the input, so clicking it toggles the checkbox
      fixture.componentRef.setInput('checked', 'unchecked');
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.coar-checkbox-wrapper');
      label.click();
      fixture.detectChanges();

      // The checked state should now be 'checked'
      expect(component.checked()).toBe('checked');
    });

    it('should not click input when label is clicked and disabled', () => {
      fixture.componentRef.setInput('label', 'Test label');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.coar-checkbox-label');
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

      const clickSpy = vi.spyOn(input, 'click');
      label.click();
      fixture.detectChanges();

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });
});
