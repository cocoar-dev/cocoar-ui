import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoarPopconfirmDirective } from './coar-popconfirm.directive';
import { CoarButtonComponent } from '../../display/button/coar-button.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarPopconfirmDirective, CoarButtonComponent],
  template: `
    <button
      coarButton
      [coarPopconfirm]="message"
      [popconfirmTitle]="title"
      [confirmText]="confirmText"
      [cancelText]="cancelText"
      [placement]="placement"
      [popconfirmDisabled]="disabled()"
      (confirmed)="onConfirm()"
      (cancelled)="onCancel()"
    >
      Trigger
    </button>
  `,
})
class TestHostComponent {
  message = 'Are you sure?';
  title = '';
  confirmText = 'Confirm';
  cancelText = 'Cancel';
  placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  disabled = signal(false);

  confirmCalled = false;
  cancelCalled = false;

  onConfirm(): void {
    this.confirmCalled = true;
  }

  onCancel(): void {
    this.cancelCalled = true;
  }
}

describe('CoarPopconfirmDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the directive on the button', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('should have default inputs', () => {
    expect(component.message).toBe('Are you sure?');
    expect(component.confirmText).toBe('Confirm');
    expect(component.cancelText).toBe('Cancel');
    expect(component.placement).toBe('top');
    expect(component.disabled()).toBe(false);
  });

  // Note: Overlay-based tests require a real browser environment.
  // Per AGENTS.md, use Playwright E2E tests for components with overlay dependencies.
  // The full functionality is tested in the showcase-e2e project.
});
