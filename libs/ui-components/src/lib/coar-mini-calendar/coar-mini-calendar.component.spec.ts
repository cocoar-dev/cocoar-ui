import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Temporal } from '@js-temporal/polyfill';
import { vi } from 'vitest';
import { provideCoarLocalization } from '@cocoar/localization';

import { CoarMiniCalendarComponent } from './coar-mini-calendar.component';

describe('CoarMiniCalendarComponent', () => {
  let fixture: ComponentFixture<CoarMiniCalendarComponent>;
  let component: CoarMiniCalendarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarMiniCalendarComponent],
      providers: [provideCoarLocalization({ defaultLanguage: 'en' })],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarMiniCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a selected day when value is set', () => {
    fixture.componentRef.setInput('value', Temporal.PlainDate.from('2025-06-15'));
    fixture.detectChanges();

    const selected = fixture.nativeElement.querySelector('.coar-mini-calendar-day--selected');
    expect(selected).toBeTruthy();
    expect(selected.textContent).toContain('15');
  });

  it('should emit valueChange when selecting a date', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    fixture.componentRef.setInput('value', Temporal.PlainDate.from('2025-06-15'));
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('.coar-mini-calendar-day')
    ) as HTMLButtonElement[];

    const enabledButton = buttons.find((button) => !button.disabled);
    expect(enabledButton).toBeTruthy();

    if (!enabledButton) {
      throw new Error('Expected an enabled calendar day button');
    }

    enabledButton.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
