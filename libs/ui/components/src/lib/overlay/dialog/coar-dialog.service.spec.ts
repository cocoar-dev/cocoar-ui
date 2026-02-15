import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { CoarDialogService } from './coar-dialog.service';

@Component({
  selector: 'coar-test-dialog-content',
  standalone: true,
  template: '<p>Dialog content</p>',
})
class TestDialogContentComponent {}

describe('CoarDialogService', () => {
  let service: CoarDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    service = TestBed.inject(CoarDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openComponent', () => {
    it('should open a dialog and return a ref', () => {
      const ref = service.openComponent(TestDialogContentComponent, {
        title: 'My Dialog',
      });

      expect(ref).toBeTruthy();
      expect(ref.close).toBeDefined();
      expect(ref.afterClosed$).toBeDefined();

      // Clean up
      ref.close();
    });

    it('should close with a result', () => {
      const ref = service.openComponent(TestDialogContentComponent);
      const closeSpy = vi.fn();
      ref.afterClosed$.subscribe(closeSpy);

      ref.close('done');

      expect(closeSpy).toHaveBeenCalledWith('done');
    });

    it('should accept size config', () => {
      const ref = service.openComponent(TestDialogContentComponent, { size: 'l' });
      expect(ref).toBeTruthy();
      ref.close();
    });
  });

  describe('confirm', () => {
    it('should open a confirm dialog and return a ref', () => {
      const ref = service.confirm({
        title: 'Delete?',
        message: 'Are you sure?',
      });

      expect(ref).toBeTruthy();
      expect(ref.close).toBeDefined();
      expect(ref.afterClosed$).toBeDefined();

      ref.close();
    });

    it('should use custom confirm/cancel text', () => {
      const ref = service.confirm({
        title: 'Delete?',
        message: 'Are you sure?',
        confirmText: 'Yes',
        cancelText: 'No',
        confirmVariant: 'danger',
      });

      expect(ref).toBeTruthy();
      ref.close();
    });
  });
});
