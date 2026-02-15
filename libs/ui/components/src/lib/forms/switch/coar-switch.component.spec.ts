import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CoarSwitchComponent, CoarSwitchSize } from './coar-switch.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CoarSwitchComponent],
  template: ` <coar-switch [formControl]="control" /> `,
})
class TestReactiveFormsHostComponent {
  control = new FormControl<boolean | null>(null);
}

describe('CoarSwitchComponent', () => {
  let component: CoarSwitchComponent;
  let fixture: ComponentFixture<CoarSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarSwitchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have m size by default', () => {
      expect(component.size()).toBe('m');
    });

    it('should not be checked by default', () => {
      expect(component.checked()).toBe(false);
    });

    it('should not be disabled by default', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should not be readonly by default', () => {
      expect(component.readonly()).toBe(false);
    });

    it('should have empty label by default', () => {
      expect(component.label()).toBe('');
    });

    it('should have after label position by default', () => {
      expect(component.labelPosition()).toBe('after');
    });
  });

  describe('size variants', () => {
    it.each(['s', 'm', 'l'] as CoarSwitchSize[])(
      'should apply %s size class',
      (size) => {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-switch--${size}`);
      }
    );
  });

  describe('checked state', () => {
    it('should apply checked class when checked', () => {
      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-switch--checked');
    });

    it('should not apply checked class when unchecked', () => {
      fixture.componentRef.setInput('checked', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).not.toContain('coar-switch--checked');
    });
  });

  describe('disabled state', () => {
    it('should apply disabled class when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-switch--disabled');
    });

    it('should have disabled attribute on input when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(true);
    });
  });

  describe('readonly state', () => {
    it('should apply readonly class when readonly', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-switch--readonly');
    });
  });

  describe('toggle behavior', () => {
    it('should toggle from off to on', () => {
      fixture.componentRef.setInput('checked', false);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      expect(component.checked()).toBe(true);
    });

    it('should toggle from on to off', () => {
      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      expect(component.checked()).toBe(false);
    });

    it('should not toggle when disabled', () => {
      fixture.componentRef.setInput('checked', false);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      expect(component.checked()).toBe(false);
    });
  });

  describe('readonly toggle behavior', () => {
    it('should prevent toggle when readonly and checked', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.checked = false;
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(input.checked).toBe(true);
    });

    it('should prevent toggle when readonly and unchecked', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.componentRef.setInput('checked', false);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(input.checked).toBe(false);
    });
  });

  describe('focus and blur', () => {
    it('should track focus state on focus', () => {
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.coar-switch-wrapper');
      expect(wrapper.classList.contains('coar-switch-focused')).toBe(true);
    });

    it('should clear focus state on blur', () => {
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();

      input.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.coar-switch-wrapper');
      expect(wrapper.classList.contains('coar-switch-focused')).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('should have switch role', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('role')).toBe('switch');
    });

    it('should set aria-checked', () => {
      fixture.componentRef.setInput('checked', true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-checked')).toBe('true');
    });

    it('should set aria-disabled when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-disabled')).toBe('true');
    });

    it('should set aria-readonly when readonly', () => {
      fixture.componentRef.setInput('readonly', true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-readonly')).toBe('true');
    });

    it('should set id on input when provided', () => {
      fixture.componentRef.setInput('id', 'my-switch');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.id).toBe('my-switch');
    });

    it('should set name on input when provided', () => {
      fixture.componentRef.setInput('name', 'notifications');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.name).toBe('notifications');
    });
  });
});

@Component({
  standalone: true,
  imports: [CoarSwitchComponent],
  template: `<coar-switch label="Enable notifications" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {}

describe('CoarSwitchComponent with label', () => {
  it('should render label text', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const labelEl = fixture.nativeElement.querySelector('.coar-switch-label');
    expect(labelEl).toBeTruthy();
    expect(labelEl.textContent).toContain('Enable notifications');
  });
});

@Component({
  standalone: true,
  imports: [CoarSwitchComponent],
  template: `<coar-switch label="Before label" labelPosition="before" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestLabelPositionHostComponent {}

describe('CoarSwitchComponent label position', () => {
  it('should render label before switch when labelPosition is before', async () => {
    await TestBed.configureTestingModule({
      imports: [TestLabelPositionHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestLabelPositionHostComponent);
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.coar-switch-wrapper');
    const children = Array.from(wrapper.children) as HTMLElement[];
    const labelIndex = children.findIndex((el) => el.classList.contains('coar-switch-label'));
    const trackIndex = children.findIndex((el) => el.classList.contains('coar-switch-track'));

    expect(labelIndex).toBeLessThan(trackIndex);
  });
});

describe('CoarSwitchComponent (Reactive Forms)', () => {
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

  it('should write control value into the switch', () => {
    host.control.setValue(true);
    fixture.detectChanges();
    expect(getInput().checked).toBe(true);
  });

  it('should propagate user toggle into the control', () => {
    getInput().click();
    fixture.detectChanges();
    expect(host.control.value).toBe(true);
  });

  it('should disable the input when the control is disabled', () => {
    host.control.disable();
    fixture.detectChanges();
    expect(getInput().disabled).toBe(true);
  });
});
