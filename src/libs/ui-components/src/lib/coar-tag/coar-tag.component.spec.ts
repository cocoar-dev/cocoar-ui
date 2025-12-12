import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CoarTagComponent } from './coar-tag.component';

describe('CoarTagComponent', () => {
  let component: CoarTagComponent;
  let fixture: ComponentFixture<CoarTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarTagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have neutral color by default', () => {
      expect(component.color()).toBe('neutral');
    });

    it('should have md size by default', () => {
      expect(component.size()).toBe('md');
    });

    it('should not be closable by default', () => {
      expect(component.closable()).toBe(false);
    });
  });

  describe('color variants', () => {
    it.each(['neutral', 'success', 'warning', 'error', 'info', 'accent'] as const)(
      'should apply %s color class',
      (color) => {
        fixture.componentRef.setInput('color', color);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-tag--${color}`);
      }
    );
  });

  describe('size variants', () => {
    it.each(['sm', 'md', 'lg'] as const)('should apply %s size class', (size) => {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain(`coar-tag--${size}`);
    });
  });

  describe('closable', () => {
    it('should not show close button when not closable', () => {
      fixture.componentRef.setInput('closable', false);
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.coar-tag__close');
      expect(closeButton).toBeNull();
    });

    it('should show close button when closable', () => {
      fixture.componentRef.setInput('closable', true);
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.coar-tag__close');
      expect(closeButton).toBeTruthy();
    });

    it('should emit closed event when close button is clicked', () => {
      fixture.componentRef.setInput('closable', true);
      fixture.detectChanges();

      const closedSpy = vi.fn();
      component.closed.subscribe(closedSpy);

      const closeButton = fixture.nativeElement.querySelector('.coar-tag__close');
      closeButton.click();

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should stop event propagation on close', () => {
      fixture.componentRef.setInput('closable', true);
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('.coar-tag__close');
      const event = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      closeButton.dispatchEvent(event);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on close button', () => {
      fixture.componentRef.setInput('closable', true);
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.coar-tag__close');
      expect(closeButton.getAttribute('aria-label')).toBe('Remove tag');
    });

    it('should have button type on close button', () => {
      fixture.componentRef.setInput('closable', true);
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.coar-tag__close');
      expect(closeButton.getAttribute('type')).toBe('button');
    });
  });
});

@Component({
  standalone: true,
  imports: [CoarTagComponent],
  template: `<coar-tag>Test Content</coar-tag>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {}

describe('CoarTagComponent with content', () => {
  it('should render projected content', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const tagContent = fixture.nativeElement.querySelector('.coar-tag__content');
    expect(tagContent.textContent).toContain('Test Content');
  });
});
