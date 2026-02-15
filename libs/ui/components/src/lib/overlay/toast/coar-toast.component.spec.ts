import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CoarToastComponent } from './coar-toast.component';

describe('CoarToastComponent', () => {
  let component: CoarToastComponent;
  let fixture: ComponentFixture<CoarToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarToastComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have info variant by default', () => {
      expect(component.variant()).toBe('info');
    });

    it('should have 5000ms duration by default', () => {
      expect(component.duration()).toBe(5000);
    });

    it('should be dismissible by default', () => {
      expect(component.dismissible()).toBe(true);
    });

    it('should show progress by default', () => {
      expect(component.showProgress()).toBe(true);
    });

    it('should have no action by default', () => {
      expect(component.action()).toBeNull();
    });

    it('should not be paused by default', () => {
      expect(component.isPaused()).toBe(false);
    });
  });

  describe('variants', () => {
    it.each(['success', 'error', 'warning', 'info'] as const)(
      'should apply %s variant class',
      (variant) => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        const toast = fixture.nativeElement.querySelector('.coar-toast');
        expect(toast.classList).toContain(`coar-toast--${variant}`);
      }
    );
  });

  describe('icon mapping', () => {
    it('should map success to check-circle', () => {
      fixture.componentRef.setInput('variant', 'success');
      fixture.detectChanges();
      expect(component.iconName()).toBe('check-circle');
    });

    it('should map error to alert-circle', () => {
      fixture.componentRef.setInput('variant', 'error');
      fixture.detectChanges();
      expect(component.iconName()).toBe('alert-circle');
    });

    it('should map warning to alert-triangle', () => {
      fixture.componentRef.setInput('variant', 'warning');
      fixture.detectChanges();
      expect(component.iconName()).toBe('alert-triangle');
    });

    it('should map info to info', () => {
      fixture.componentRef.setInput('variant', 'info');
      fixture.detectChanges();
      expect(component.iconName()).toBe('info');
    });
  });

  describe('content', () => {
    it('should display message', () => {
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();
      const msg = fixture.nativeElement.querySelector('.coar-toast-message');
      expect(msg.textContent).toContain('Test message');
    });

    it('should display title when provided', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('.coar-toast-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Test Title');
    });

    it('should not display title when empty', () => {
      fixture.componentRef.setInput('title', '');
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('.coar-toast-title');
      expect(title).toBeFalsy();
    });
  });

  describe('dismiss button', () => {
    it('should show dismiss button when dismissible', () => {
      fixture.componentRef.setInput('dismissible', true);
      fixture.detectChanges();
      const closeBtn = fixture.nativeElement.querySelector('.coar-toast-close');
      expect(closeBtn).toBeTruthy();
    });

    it('should not show dismiss button when not dismissible', () => {
      fixture.componentRef.setInput('dismissible', false);
      fixture.detectChanges();
      const closeBtn = fixture.nativeElement.querySelector('.coar-toast-close');
      expect(closeBtn).toBeFalsy();
    });

    it('should emit dismissed when close button is clicked', () => {
      fixture.componentRef.setInput('dismissible', true);
      fixture.detectChanges();
      const dismissSpy = vi.fn();
      component.dismissed.subscribe(dismissSpy);

      const closeBtn = fixture.nativeElement.querySelector('.coar-toast-close');
      closeBtn.click();

      expect(dismissSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('action button', () => {
    it('should show action button when action is provided', () => {
      fixture.componentRef.setInput('action', { label: 'Undo', callback: vi.fn() });
      fixture.detectChanges();
      const actionBtn = fixture.nativeElement.querySelector('.coar-toast-action-btn');
      expect(actionBtn).toBeTruthy();
      expect(actionBtn.textContent).toContain('Undo');
    });

    it('should call action callback when action button is clicked', () => {
      const callback = vi.fn();
      fixture.componentRef.setInput('action', { label: 'Undo', callback });
      fixture.detectChanges();

      const actionBtn = fixture.nativeElement.querySelector('.coar-toast-action-btn');
      actionBtn.click();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not show action button when action is null', () => {
      fixture.componentRef.setInput('action', null);
      fixture.detectChanges();
      const actionBtn = fixture.nativeElement.querySelector('.coar-toast-action-btn');
      expect(actionBtn).toBeFalsy();
    });
  });

  describe('progress bar', () => {
    it('should show progress bar when showProgress and duration > 0', () => {
      fixture.componentRef.setInput('showProgress', true);
      fixture.componentRef.setInput('duration', 5000);
      fixture.detectChanges();
      const progress = fixture.nativeElement.querySelector('.coar-toast-progress');
      expect(progress).toBeTruthy();
    });

    it('should not show progress bar when duration is 0', () => {
      fixture.componentRef.setInput('showProgress', true);
      fixture.componentRef.setInput('duration', 0);
      fixture.detectChanges();
      const progress = fixture.nativeElement.querySelector('.coar-toast-progress');
      expect(progress).toBeFalsy();
    });

    it('should not show progress bar when showProgress is false', () => {
      fixture.componentRef.setInput('showProgress', false);
      fixture.componentRef.setInput('duration', 5000);
      fixture.detectChanges();
      const progress = fixture.nativeElement.querySelector('.coar-toast-progress');
      expect(progress).toBeFalsy();
    });
  });

  describe('hover pause', () => {
    it('should pause on mouse enter', () => {
      fixture.componentRef.setInput('duration', 5000);
      fixture.detectChanges();
      component.onMouseEnter();
      expect(component.isPaused()).toBe(true);
    });

    it('should unpause on mouse leave', () => {
      fixture.componentRef.setInput('duration', 5000);
      fixture.detectChanges();
      component.onMouseEnter();
      component.onMouseLeave();
      expect(component.isPaused()).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('should have role=alert for error variant', () => {
      fixture.componentRef.setInput('variant', 'error');
      fixture.detectChanges();
      const toast = fixture.nativeElement.querySelector('.coar-toast');
      expect(toast.getAttribute('role')).toBe('alert');
    });

    it('should not have role=alert for non-error variants', () => {
      fixture.componentRef.setInput('variant', 'info');
      fixture.detectChanges();
      const toast = fixture.nativeElement.querySelector('.coar-toast');
      expect(toast.getAttribute('role')).toBeNull();
    });

    it('should have aria-label on dismiss button', () => {
      fixture.componentRef.setInput('dismissible', true);
      fixture.detectChanges();
      const closeBtn = fixture.nativeElement.querySelector('.coar-toast-close');
      expect(closeBtn.getAttribute('aria-label')).toBe('Dismiss notification');
    });
  });
});
