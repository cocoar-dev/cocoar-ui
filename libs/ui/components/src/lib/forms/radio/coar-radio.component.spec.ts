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
});
