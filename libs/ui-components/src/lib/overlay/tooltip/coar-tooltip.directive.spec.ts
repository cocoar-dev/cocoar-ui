import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CoarTooltipDirective } from './coar-tooltip.directive';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarTooltipDirective],
  template: `
    <button
      type="button"
      coarTooltip="Hello Tooltip"
      [coarTooltipPlacement]="'top'"
      [coarTooltipClampToViewport]="true"
    >
      Trigger
    </button>
  `,
})
class TestHostTooltipDirectiveComponent {}

describe('CoarTooltipDirective', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('opens on hover and closes on leave', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TestHostTooltipDirectiveComponent],
    }).createComponent(TestHostTooltipDirectiveComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();

    const tooltip = document.querySelector('[role="tooltip"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.textContent).toContain('Hello Tooltip');

    trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();

    expect(document.querySelector('[role="tooltip"]')).toBeFalsy();

    fixture.destroy();
  });

  it('respects openDelay and closeDelay', () => {
    vi.useFakeTimers();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [CoarTooltipDirective],
      template: `
        <button
          type="button"
          coarTooltip="Delayed"
          [coarTooltipOpenDelay]="50"
          [coarTooltipCloseDelay]="50"
        >
          Trigger
        </button>
      `,
    })
    class HostWithDelaysComponent {}

    const fixture = TestBed.configureTestingModule({
      imports: [HostWithDelaysComponent],
    }).createComponent(HostWithDelaysComponent);

    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();

    expect(document.querySelector('[role="tooltip"]')).toBeFalsy();

    vi.advanceTimersByTime(50);
    fixture.detectChanges();

    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();

    trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();

    expect(document.querySelector('[role="tooltip"]')).toBeTruthy();

    vi.advanceTimersByTime(50);
    fixture.detectChanges();

    expect(document.querySelector('[role="tooltip"]')).toBeFalsy();

    fixture.destroy();
  });
});
