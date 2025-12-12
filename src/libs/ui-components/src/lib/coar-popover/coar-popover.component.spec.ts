import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CoarPopoverComponent } from './coar-popover.component';
import { CoarPopoverGroupService } from './coar-popover-group.service';
import { CoarOverlayService } from '@cocoar/ui-overlay';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarPopoverComponent],
  template: `
    <coar-popover [disabled]="disabled" [openOnHover]="true" [openOnClick]="openOnClick">
      <button coarPopoverTrigger type="button">Trigger</button>
      <div coarPopoverContent>Content</div>
    </coar-popover>
  `,
})
class TestHostHoverComponent {
  disabled = false;
  openOnClick = false;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarPopoverComponent],
  template: `
    <coar-popover [openOnClick]="true" [interactive]="false">
      <button coarPopoverTrigger type="button">Trigger</button>
      <div coarPopoverContent>Overlay</div>
    </coar-popover>
  `,
})
class TestHostNonInteractiveComponent {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarPopoverComponent],
  template: `
    <coar-popover>
      <button coarPopoverTrigger type="button">Trigger</button>
      <div coarPopoverContent>Content</div>
    </coar-popover>
  `,
})
class TestHostDefaultComponent {}

describe('CoarPopoverComponent', () => {
  let fixture: ComponentFixture<TestHostHoverComponent>;

  afterEach(() => {
    vi.useRealTimers();

    try {
      TestBed.inject(CoarOverlayService).closeAll();
    } catch {
      // noop
    }

    for (const el of Array.from(
      document.body.querySelectorAll('.coar-overlay-host, .coar-overlay-backdrop, .coar-popover-panel')
    )) {
      el.remove();
    }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostHoverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostHoverComponent);
    fixture.detectChanges();
  });

  it('should open on mouseenter and close on mouseleave', () => {
    vi.useFakeTimers();

    const root = fixture.nativeElement.querySelector('.coar-popover') as HTMLElement;

    root.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    expect(document.body.querySelector('.coar-popover-panel')).toBeTruthy();

    root.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();

    vi.advanceTimersByTime(100);
    fixture.detectChanges();

    expect(document.body.querySelector('.coar-popover-panel')).toBeFalsy();
  });

  it('should not open on mouseenter by default', () => {
    const defaultFixture = TestBed.createComponent(TestHostDefaultComponent);
    defaultFixture.detectChanges();

    const root = defaultFixture.nativeElement.querySelector('.coar-popover') as HTMLElement;

    root.dispatchEvent(new Event('mouseenter'));
    defaultFixture.detectChanges();

    expect(document.body.querySelector('.coar-popover-panel')).toBeFalsy();
  });

  it('should not open when disabled', async () => {
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.coar-popover') as HTMLElement;
    root.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    expect(document.body.querySelector('.coar-popover-panel')).toBeFalsy();
  });

  it('should pin on click and not close on mouseleave', () => {
    fixture.componentInstance.openOnClick = true;
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.coar-popover') as HTMLElement;
    const trigger = fixture.nativeElement.querySelector('[coarPopoverTrigger]') as HTMLElement;

    root.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(document.body.querySelector('.coar-popover-panel')).toBeTruthy();

    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    root.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(document.body.querySelector('.coar-popover-panel')).toBeTruthy();

    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(document.body.querySelector('.coar-popover-panel')).toBeFalsy();
  });

  it('should set pointer-events:none when interactive is false', async () => {
    const nonInteractiveFixture = TestBed.createComponent(TestHostNonInteractiveComponent);
    nonInteractiveFixture.detectChanges();

    const trigger = nonInteractiveFixture.nativeElement.querySelector('[coarPopoverTrigger]') as HTMLElement;
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    nonInteractiveFixture.detectChanges();

    const panel = document.body.querySelector('.coar-popover-panel') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.style.pointerEvents).toBe('none');
  });
});

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarPopoverComponent],
  providers: [CoarPopoverGroupService],
  template: `
    <coar-popover [openOnHover]="true">
      <button coarPopoverTrigger type="button">Trigger A</button>
      <div coarPopoverContent>Content A</div>
    </coar-popover>
    <coar-popover [openOnHover]="true">
      <button coarPopoverTrigger type="button">Trigger B</button>
      <div coarPopoverContent>Content B</div>
    </coar-popover>
  `,
})
class TestHostGroupComponent {}

describe('CoarPopoverComponent (group)', () => {
  it('should close other popovers in the same group when opening', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostGroupComponent],
    }).compileComponents();

    const groupFixture = TestBed.createComponent(TestHostGroupComponent);
    groupFixture.detectChanges();

    const roots = Array.from(groupFixture.nativeElement.querySelectorAll('.coar-popover')) as HTMLElement[];
    roots[0].dispatchEvent(new Event('mouseenter'));
    groupFixture.detectChanges();
    expect(document.body.querySelectorAll('.coar-popover-panel').length).toBe(1);

    roots[1].dispatchEvent(new Event('mouseenter'));
    groupFixture.detectChanges();
    expect(document.body.querySelectorAll('.coar-popover-panel').length).toBe(1);
  });
});
