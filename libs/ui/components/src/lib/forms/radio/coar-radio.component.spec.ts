import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoarRadioGroupComponent } from './coar-radio-group.component';
import { CoarRadioComponent } from './coar-radio.component';

describe('CoarRadioGroupComponent', () => {
  let component: CoarRadioGroupComponent;
  let fixture: ComponentFixture<CoarRadioGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarRadioGroupComponent, CoarRadioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarRadioGroupComponent);
    component = fixture.componentInstance;
    // Set required input
    fixture.componentRef.setInput('name', 'test-group');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have vertical orientation by default', () => {
      expect(component.orientation()).toBe('vertical');
    });

    it('should not be disabled by default', () => {
      expect(component.isGroupDisabled()).toBe(false);
    });

    it('should have m size by default', () => {
      expect(component.size()).toBe('m');
    });
  });

  describe('orientation', () => {
    it('should apply vertical orientation class to host', () => {
      fixture.componentRef.setInput('orientation', 'vertical');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-radio-group--vertical');
    });

    it('should apply horizontal orientation class to host', () => {
      fixture.componentRef.setInput('orientation', 'horizontal');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-radio-group--horizontal');
    });
  });

  describe('disabled state', () => {
    it('should apply disabled class when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-radio-group--disabled');
    });

    it('should expose disabled state via isGroupDisabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.isGroupDisabled()).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have role="radiogroup"', () => {
      expect(fixture.nativeElement.getAttribute('role')).toBe('radiogroup');
    });

    it('should set aria-label when label is provided', () => {
      fixture.componentRef.setInput('label', 'Choose option');
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Choose option');
    });

    it('should set aria-required when required', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-required')).toBe('true');
    });

    it('should not set aria-required when not required', () => {
      expect(fixture.nativeElement.getAttribute('aria-required')).toBeNull();
    });

    it('should set aria-describedby when hint is present', () => {
      fixture.componentRef.setInput('hint', 'Pick one');
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('.coar-form-field-message');
      expect(fixture.nativeElement.getAttribute('aria-describedby')).toBe(message?.id);
    });

    it('should set aria-describedby when error is present', () => {
      fixture.componentRef.setInput('error', 'Selection required');
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('.coar-form-field-message');
      expect(fixture.nativeElement.getAttribute('aria-describedby')).toBe(message?.id);
    });

    it('should not set aria-describedby when no message', () => {
      expect(fixture.nativeElement.getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('error state', () => {
    it('should apply error class when error message is provided', () => {
      fixture.componentRef.setInput('error', 'Required');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-radio-group--error');
    });

    it('should display error message', () => {
      fixture.componentRef.setInput('error', 'Selection required');
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('.coar-form-field-message');
      expect(message?.textContent).toContain('Selection required');
    });

    it('should display error over hint when both present', () => {
      fixture.componentRef.setInput('hint', 'A hint');
      fixture.componentRef.setInput('error', 'An error');
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('.coar-form-field-message');
      expect(message?.textContent).toContain('An error');
      expect(message?.textContent).not.toContain('A hint');
    });
  });

  describe('size variants', () => {
    it.each(['s', 'm', 'l'] as const)('should apply %s size class', (size) => {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain(`coar-radio-group--${size}`);
    });
  });
});

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CoarRadioGroupComponent, CoarRadioComponent],
  template: `
    <coar-radio-group [(ngModel)]="selected" [disabled]="groupDisabled()" name="test-group">
      <coar-radio [value]="'option1'">Option 1</coar-radio>
      <coar-radio [value]="'option2'">Option 2</coar-radio>
      <coar-radio [value]="'option3'" [disabled]="option3Disabled()">Option 3</coar-radio>
    </coar-radio-group>
  `,
})
class TestHostComponent {
  selected: string | null = null;
  groupDisabled = signal(false);
  option3Disabled = signal(false);
}

describe('CoarRadioGroup with CoarRadio integration', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render all radio options', () => {
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    expect(radios.length).toBe(3);
  });

  it('should select radio on click', async () => {
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    const radio2Input = radios[1].querySelector('input');
    radio2Input.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.selected).toBe('option2');
  });

  it('should update selection when clicking different radio', async () => {
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');

    radios[0].querySelector('input').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.selected).toBe('option1');

    radios[1].querySelector('input').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.selected).toBe('option2');
  });

  it('should apply checked class to selected radio', async () => {
    // Click the radio to select it rather than setting the model directly
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    radios[1].querySelector('input').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(radios[1].classList).toContain('coar-radio--checked');
  });

  it('should disable all radios when group is disabled', () => {
    component.groupDisabled.set(true);
    fixture.detectChanges();

    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    radios.forEach((radio: HTMLElement) => {
      expect(radio.classList).toContain('coar-radio--disabled');
    });
  });

  it('should disable only specific radio when individually disabled', () => {
    component.option3Disabled.set(true);
    fixture.detectChanges();

    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    expect(radios[0].classList).not.toContain('coar-radio--disabled');
    expect(radios[1].classList).not.toContain('coar-radio--disabled');
    expect(radios[2].classList).toContain('coar-radio--disabled');
  });

  it('should display label content', () => {
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    expect(radios[0].textContent).toContain('Option 1');
    expect(radios[1].textContent).toContain('Option 2');
    expect(radios[2].textContent).toContain('Option 3');
  });

  describe('focus and blur', () => {
    it('should apply focused class on focus', () => {
      const radios = fixture.nativeElement.querySelectorAll('coar-radio');
      const input = radios[0].querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(radios[0].classList).toContain('coar-radio--focused');
    });

    it('should remove focused class on blur', () => {
      const radios = fixture.nativeElement.querySelectorAll('coar-radio');
      const input = radios[0].querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      input.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(radios[0].classList).not.toContain('coar-radio--focused');
    });
  });
});

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CoarRadioGroupComponent, CoarRadioComponent],
  template: `
    <coar-radio-group
      [(ngModel)]="selected"
      name="styled-group"
      [size]="groupSize()"
      [error]="groupError()"
      [hint]="groupHint()"
      [required]="groupRequired()"
    >
      <coar-radio [value]="'a'">A</coar-radio>
      <coar-radio [value]="'b'">B</coar-radio>
    </coar-radio-group>
  `,
})
class TestStyledHostComponent {
  selected: string | null = null;
  groupSize = signal<string>('m');
  groupError = signal<string>('');
  groupHint = signal<string>('');
  groupRequired = signal(false);
}

describe('CoarRadioGroup size and error inheritance', () => {
  let component: TestStyledHostComponent;
  let fixture: ComponentFixture<TestStyledHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestStyledHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestStyledHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should apply default m size class to child radios', () => {
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    expect(radios[0].classList).toContain('coar-radio--m');
  });

  it('should apply s size class to child radios when group is small', () => {
    component.groupSize.set('s');
    fixture.detectChanges();
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    expect(radios[0].classList).toContain('coar-radio--s');
    expect(radios[0].classList).not.toContain('coar-radio--m');
  });

  it('should apply l size class to child radios when group is large', () => {
    component.groupSize.set('l');
    fixture.detectChanges();
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    expect(radios[0].classList).toContain('coar-radio--l');
  });

  it('should apply error class to child radios when group has error', () => {
    component.groupError.set('Required');
    fixture.detectChanges();
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    expect(radios[0].classList).toContain('coar-radio--error');
    expect(radios[1].classList).toContain('coar-radio--error');
  });

  it('should not apply error class when group has no error', () => {
    const radios = fixture.nativeElement.querySelectorAll('coar-radio');
    expect(radios[0].classList).not.toContain('coar-radio--error');
  });

  it('should set aria-required on group when required', () => {
    component.groupRequired.set(true);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('coar-radio-group');
    expect(group.getAttribute('aria-required')).toBe('true');
  });
});
