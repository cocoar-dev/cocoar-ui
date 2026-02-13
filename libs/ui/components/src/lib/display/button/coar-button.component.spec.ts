import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CoarButtonComponent, ButtonVariant, ButtonSize } from './coar-button.component';

describe('CoarButtonComponent', () => {
  let component: CoarButtonComponent;
  let fixture: ComponentFixture<CoarButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarButtonComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have primary variant by default', () => {
      expect(component.variant()).toBe('primary');
    });

    it('should have m size by default', () => {
      expect(component.size()).toBe('m');
    });

    it('should not be disabled by default', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should not be loading by default', () => {
      expect(component.loading()).toBe(false);
    });

    it('should have button type by default', () => {
      expect(component.type()).toBe('button');
    });

    it('should not be full width by default', () => {
      expect(component.fullWidth()).toBe(false);
    });
  });

  describe('variants', () => {
    it.each(['primary', 'secondary', 'tertiary', 'danger', 'ghost'] as ButtonVariant[])(
      'should apply %s variant class',
      (variant) => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button');
        expect(button.classList).toContain(`coar-button--${variant}`);
      }
    );
  });

  describe('sizes', () => {
    it.each(['xs', 's', 'm', 'l'] as ButtonSize[])('should apply %s size class', (size) => {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList).toContain(`coar-button--${size}`);
    });
  });

  describe('disabled state', () => {
    it('should apply disabled attribute when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBe(true);
    });

    it('should not emit clicked event when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const clickedSpy = vi.fn();
      component.clicked.subscribe(clickedSpy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(clickedSpy).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should apply loading class when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList).toContain('coar-button--loading');
    });

    it('should show loading spinner when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.coar-button__spinner');
      expect(spinner).toBeTruthy();
    });

    it('should not emit clicked event when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const clickedSpy = vi.fn();
      component.clicked.subscribe(clickedSpy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(clickedSpy).not.toHaveBeenCalled();
    });
  });

  describe('click handling', () => {
    it('should emit clicked event when clicked', () => {
      const clickedSpy = vi.fn();
      component.clicked.subscribe(clickedSpy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(clickedSpy).toHaveBeenCalledTimes(1);
    });

    it('should pass MouseEvent to clicked handler', () => {
      const clickedSpy = vi.fn();
      component.clicked.subscribe(clickedSpy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(clickedSpy).toHaveBeenCalledWith(expect.any(MouseEvent));
    });
  });

  describe('button type', () => {
    it.each(['button', 'submit', 'reset'] as const)('should set %s type', (type) => {
      fixture.componentRef.setInput('type', type);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.type).toBe(type);
    });
  });

  describe('full width', () => {
    it('should apply full-width class to host when fullWidth is true', () => {
      fixture.componentRef.setInput('fullWidth', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-button--full-width');
    });
  });

  describe('icons', () => {
    it('should render start icon when iconStart is provided', () => {
      fixture.componentRef.setInput('iconStart', 'settings');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('coar-icon');
      expect(icon).toBeTruthy();
    });

    it('should render end icon when iconEnd is provided', () => {
      fixture.componentRef.setInput('iconEnd', 'settings');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('coar-icon');
      expect(icon).toBeTruthy();
    });
  });
});
