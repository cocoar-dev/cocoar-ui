import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';

import { CoarToastService } from './coar-toast.service';

describe('CoarToastService', () => {
  let service: CoarToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoarToastService],
    });

    service = TestBed.inject(CoarToastService);
  });

  afterEach(() => {
    service.dismissAll();
    // Clean up any containers appended to body
    document.querySelectorAll('coar-toast-container').forEach((el) => el.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show', () => {
    it('should create a toast container in the DOM', () => {
      service.show({ message: 'Test' });
      const container = document.querySelector('coar-toast-container');
      expect(container).toBeTruthy();
    });

    it('should return a CoarToastRef with dismiss method', () => {
      const ref = service.show({ message: 'Test' });
      expect(ref.dismiss).toBeDefined();
      expect(ref.afterDismissed$).toBeDefined();
    });
  });

  describe('shortcut methods', () => {
    it('should create a success toast', () => {
      const ref = service.success('Success message');
      expect(ref).toBeTruthy();
    });

    it('should create an error toast', () => {
      const ref = service.error('Error message');
      expect(ref).toBeTruthy();
    });

    it('should create a warning toast', () => {
      const ref = service.warning('Warning message');
      expect(ref).toBeTruthy();
    });

    it('should create an info toast', () => {
      const ref = service.info('Info message');
      expect(ref).toBeTruthy();
    });
  });

  describe('dismiss', () => {
    it('should dismiss a specific toast via ref', () => {
      const ref = service.show({ message: 'Test' });
      const dismissSpy = vi.fn();
      ref.afterDismissed$.subscribe(dismissSpy);

      ref.dismiss();

      expect(dismissSpy).toHaveBeenCalled();
    });

    it('should dismiss all toasts', () => {
      service.show({ message: 'One' });
      service.show({ message: 'Two' });
      service.show({ message: 'Three' });

      service.dismissAll();

      // The container should have no toasts
      const container = document.querySelector('coar-toast-container');
      expect(container).toBeTruthy();
    });
  });

  describe('reuse container', () => {
    it('should reuse the same container for multiple toasts', () => {
      service.show({ message: 'First' });
      service.show({ message: 'Second' });

      const containers = document.querySelectorAll('coar-toast-container');
      expect(containers.length).toBe(1);
    });
  });
});
