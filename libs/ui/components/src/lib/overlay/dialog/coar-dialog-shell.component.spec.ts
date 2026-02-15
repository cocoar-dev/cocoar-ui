import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { Subject } from 'rxjs';

import { COAR_OVERLAY_REF } from '@cocoar/ui/overlay';
import { CoarDialogShellComponent } from './coar-dialog-shell.component';

@Component({
  selector: 'coar-test-content',
  standalone: true,
  template: '<p>Test content</p>',
})
class TestContentComponent {}

describe('CoarDialogShellComponent', () => {
  let component: CoarDialogShellComponent;
  let fixture: ComponentFixture<CoarDialogShellComponent>;
  const closeSpy = vi.fn();
  const afterClosed$ = new Subject<unknown>();

  const mockOverlayRef = {
    close: closeSpy,
    updatePosition: vi.fn(),
    closeChildren: vi.fn(),
    afterClosed$,
    isClosed: false,
    getRoot: vi.fn(),
  };

  beforeEach(async () => {
    closeSpy.mockReset();

    await TestBed.configureTestingModule({
      imports: [CoarDialogShellComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: COAR_OVERLAY_REF, useValue: mockOverlayRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarDialogShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have empty title by default', () => {
      expect(component.dialogTitle()).toBe('');
    });

    it('should have m size by default', () => {
      expect(component.dialogSize()).toBe('m');
    });

    it('should show close button by default', () => {
      expect(component.showCloseButton()).toBe(true);
    });

    it('should not be in confirm mode by default', () => {
      expect(component.confirmMode()).toBe(false);
    });
  });

  describe('header', () => {
    it('should render title when provided', () => {
      fixture.componentRef.setInput('dialogTitle', 'Test Dialog');
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('.coar-dialog-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Test Dialog');
    });

    it('should render close button when showCloseButton is true', () => {
      fixture.componentRef.setInput('showCloseButton', true);
      fixture.componentRef.setInput('dialogTitle', 'Title');
      fixture.detectChanges();
      const closeBtn = fixture.nativeElement.querySelector('.coar-dialog-close');
      expect(closeBtn).toBeTruthy();
    });

    it('should not render close button when showCloseButton is false', () => {
      fixture.componentRef.setInput('showCloseButton', false);
      fixture.componentRef.setInput('dialogTitle', '');
      fixture.detectChanges();
      const header = fixture.nativeElement.querySelector('.coar-dialog-header');
      expect(header).toBeFalsy();
    });
  });

  describe('size variants', () => {
    it.each(['s', 'm', 'l'] as const)('should apply %s size class', (size) => {
      fixture.componentRef.setInput('dialogSize', size);
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector('.coar-dialog');
      expect(dialog.classList).toContain(`coar-dialog--${size}`);
    });
  });

  describe('close button', () => {
    it('should call overlayRef.close when close button is clicked', () => {
      fixture.componentRef.setInput('dialogTitle', 'Title');
      fixture.componentRef.setInput('showCloseButton', true);
      fixture.detectChanges();
      const closeBtn = fixture.nativeElement.querySelector('.coar-dialog-close');
      closeBtn.click();
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('confirm mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('confirmMode', true);
      fixture.componentRef.setInput('dialogTitle', 'Confirm Action');
      fixture.componentRef.setInput('confirmMessage', 'Are you sure?');
      fixture.componentRef.setInput('confirmText', 'Yes');
      fixture.componentRef.setInput('cancelText', 'No');
      fixture.detectChanges();
    });

    it('should display confirm message', () => {
      const body = fixture.nativeElement.querySelector('.coar-dialog-body p');
      expect(body.textContent).toContain('Are you sure?');
    });

    it('should display footer with action buttons', () => {
      const footer = fixture.nativeElement.querySelector('.coar-dialog-footer');
      expect(footer).toBeTruthy();
    });

    it('should close with true when confirm is clicked', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.coar-dialog-footer coar-button');
      // Second button is the confirm button
      const confirmButton = buttons[1].querySelector('button');
      confirmButton.click();
      expect(closeSpy).toHaveBeenCalledWith(true);
    });

    it('should close with false when cancel is clicked', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.coar-dialog-footer coar-button');
      // First button is the cancel button
      const cancelButton = buttons[0].querySelector('button');
      cancelButton.click();
      expect(closeSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('accessibility', () => {
    it('should have close button with aria-label', () => {
      fixture.componentRef.setInput('dialogTitle', 'Title');
      fixture.componentRef.setInput('showCloseButton', true);
      fixture.detectChanges();
      const closeBtn = fixture.nativeElement.querySelector('.coar-dialog-close');
      expect(closeBtn.getAttribute('aria-label')).toBe('Close dialog');
    });
  });

  describe('component content', () => {
    it('should render component outlet when contentComponent is set', () => {
      fixture.componentRef.setInput('contentComponent', TestContentComponent);
      fixture.detectChanges();
      const outlet = fixture.nativeElement.querySelector('.coar-dialog-body');
      expect(outlet).toBeTruthy();
    });
  });
});
