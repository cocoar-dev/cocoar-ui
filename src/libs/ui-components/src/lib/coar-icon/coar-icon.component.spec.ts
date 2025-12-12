import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CoarIconComponent } from './coar-icon.component';
import { CoarIconService } from './coar-icon.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('CoarIconComponent', () => {
  let component: CoarIconComponent;
  let fixture: ComponentFixture<CoarIconComponent>;
  let iconService: CoarIconService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarIconComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), CoarIconService],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarIconComponent);
    component = fixture.componentInstance;
    iconService = TestBed.inject(CoarIconService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('icon loading', () => {
    it('should render built-in icon', () => {
      const mockSvg = '<svg><circle /></svg>';
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(mockSvg));

      fixture.componentRef.setInput('name', 'settings');
      fixture.detectChanges();

      expect(iconService.getIcon).toHaveBeenCalledWith('settings');
    });

    it('should show loading state while fetching icon', fakeAsync(() => {
      const mockSvg = '<svg><circle /></svg>';
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(mockSvg));

      fixture.componentRef.setInput('name', 'settings');
      fixture.detectChanges();

      // After icon loads, loading should be false
      tick();
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement).toBeTruthy();
    }));

    it('should not render when name is empty', () => {
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement).toBeNull();
    });

    it('should handle icon not found gracefully', () => {
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(null));

      fixture.componentRef.setInput('name', 'nonexistent');
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should load fallback icon when main icon not found', () => {
      const fallbackSvg = '<svg><rect /></svg>';
      vi.spyOn(iconService, 'getIcon').mockImplementation((name: string) => {
        if (name === 'fallback-icon') {
          return of(fallbackSvg);
        }
        return of(null);
      });

      fixture.componentRef.setInput('name', 'nonexistent');
      component.fallback = 'fallback-icon';
      fixture.detectChanges();

      expect(iconService.getIcon).toHaveBeenCalledWith('nonexistent');
      expect(iconService.getIcon).toHaveBeenCalledWith('fallback-icon');
    });

    it('should handle fallback icon not found', () => {
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(null));

      fixture.componentRef.setInput('name', 'nonexistent');
      component.fallback = 'also-nonexistent';
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should handle icon loading error and try fallback', () => {
      const fallbackSvg = '<svg><rect /></svg>';
      vi.spyOn(iconService, 'getIcon').mockImplementation((name: string) => {
        if (name === 'error-icon') {
          return throwError(() => new Error('Load failed'));
        }
        return of(fallbackSvg);
      });

      fixture.componentRef.setInput('name', 'error-icon');
      component.fallback = 'fallback-icon';
      fixture.detectChanges();

      expect(iconService.getIcon).toHaveBeenCalledWith('error-icon');
      expect(iconService.getIcon).toHaveBeenCalledWith('fallback-icon');
    });

    it('should handle fallback loading error', () => {
      vi.spyOn(iconService, 'getIcon').mockImplementation(() => {
        return throwError(() => new Error('Load failed'));
      });

      fixture.componentRef.setInput('name', 'error-icon');
      component.fallback = 'fallback-also-errors';
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });
  });

  describe('sizes', () => {
    beforeEach(() => {
      const mockSvg = '<svg><circle /></svg>';
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(mockSvg));
    });

    it('should apply xs size class', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('size', 'xs');
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.coar-icon--xs');
      expect(element).toBeTruthy();
    });

    it('should apply sm size class', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.coar-icon--sm');
      expect(element).toBeTruthy();
    });

    it('should apply md size class (default)', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.coar-icon--md');
      expect(element).toBeTruthy();
    });

    it('should apply lg size class', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.coar-icon--lg');
      expect(element).toBeTruthy();
    });

    it('should apply xl size class', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('size', 'xl');
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.coar-icon--xl');
      expect(element).toBeTruthy();
    });

    it('should apply auto size class', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('size', 'auto');
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.coar-icon--auto');
      expect(element).toBeTruthy();
    });

    it('should apply custom size as inline style', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('size', '42px');
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement?.style.width).toBe('42px');
      expect(iconElement?.style.height).toBe('42px');
    });

    it('should not apply preset class for custom size', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('size', '3rem');
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement?.classList.contains('coar-icon--3rem')).toBeFalsy();
    });
  });

  describe('rotation', () => {
    beforeEach(() => {
      const mockSvg = '<svg><circle /></svg>';
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(mockSvg));
    });

    it('should apply rotation transform', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('rotate', 90);
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement?.style.transform).toBe('rotate(90deg)');
    });

    it('should apply 180 degree rotation', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('rotate', 180);
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement?.style.transform).toBe('rotate(180deg)');
    });

    it('should apply rotation transition as number', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('rotateTransition', 300);
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement?.style.transition).toContain('transform 300ms ease-in-out');
    });

    it('should apply rotation transition as string without transform', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('rotateTransition', '0.5s ease');
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement?.style.transition).toContain('transform 0.5s ease');
    });

    it('should apply rotation transition as string with transform', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('rotateTransition', 'transform 0.3s ease-out');
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement?.style.transition).toContain('transform 0.3s ease-out');
    });

    it('should not apply transition when not set', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      // No transition should be set
      expect(iconElement?.style.transition).toBeFalsy();
    });
  });

  describe('spin animation', () => {
    beforeEach(() => {
      const mockSvg = '<svg><circle /></svg>';
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(mockSvg));
    });

    it('should apply spin class when enabled', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('spin', true);
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.coar-icon--spin');
      expect(element).toBeTruthy();
    });

    it('should not apply spin class when disabled', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('spin', false);
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('.coar-icon--spin');
      expect(element).toBeNull();
    });
  });

  describe('color', () => {
    beforeEach(() => {
      const mockSvg = '<svg><circle /></svg>';
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(mockSvg));
    });

    it('should default color to inherit', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.detectChanges();

      // The color input default is 'inherit'
      expect(component.color()).toBe('inherit');
    });

    it('should apply custom color', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('color', 'red');
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement?.style.color).toBe('red');
    });

    it('should apply hex color', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('color', '#ff0000');
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.coar-icon');
      expect(iconElement?.style.color).toBe('rgb(255, 0, 0)');
    });
  });

  describe('label', () => {
    beforeEach(() => {
      const mockSvg = '<svg><circle /></svg>';
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(mockSvg));
    });

    it('should render label when provided', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.componentRef.setInput('label', 'Settings');
      fixture.detectChanges();

      const labelElement = fixture.nativeElement.querySelector('.coar-icon__label');
      expect(labelElement?.textContent).toContain('Settings');
    });

    it('should render numeric label', () => {
      fixture.componentRef.setInput('name', 'notifications');
      fixture.componentRef.setInput('label', 5);
      fixture.detectChanges();

      const labelElement = fixture.nativeElement.querySelector('.coar-icon__label');
      expect(labelElement?.textContent).toContain('5');
    });
  });

  describe('host attributes', () => {
    beforeEach(() => {
      const mockSvg = '<svg><circle /></svg>';
      vi.spyOn(iconService, 'getIcon').mockReturnValue(of(mockSvg));
    });

    it('should set icon-name attribute on host', () => {
      fixture.componentRef.setInput('name', 'settings');
      fixture.detectChanges();

      expect(fixture.nativeElement.getAttribute('icon-name')).toBe('settings');
    });
  });
});
