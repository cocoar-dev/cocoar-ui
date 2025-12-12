import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoarBadgeComponent, BadgeVariant, BadgeSize } from './coar-badge.component';

describe('CoarBadgeComponent', () => {
  let component: CoarBadgeComponent;
  let fixture: ComponentFixture<CoarBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarBadgeComponent);
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

    it('should have md size by default', () => {
      expect(component.size()).toBe('md');
    });

    it('should not pulse by default', () => {
      expect(component.pulse()).toBe(false);
    });

    it('should not be dot mode by default', () => {
      expect(component.dot()).toBe(false);
    });

    it('should not be bordered by default', () => {
      expect(component.bordered()).toBe(false);
    });

    it('should have no max by default', () => {
      expect(component.max()).toBeNull();
    });
  });

  describe('variants', () => {
    it.each(['primary', 'secondary', 'success', 'warning', 'error', 'info'] as BadgeVariant[])(
      'should apply %s variant class',
      (variant) => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        const badge = fixture.nativeElement.querySelector('.coar-badge');
        expect(badge.classList).toContain(`coar-badge--${variant}`);
      }
    );
  });

  describe('sizes', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as BadgeSize[])('should apply %s size class', (size) => {
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.coar-badge');
      expect(badge.classList).toContain(`coar-badge--${size}`);
    });

    it('should apply auto size class to host', () => {
      fixture.componentRef.setInput('size', 'auto');
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-badge-host--auto');
    });
  });

  describe('content', () => {
    it('should display string content', () => {
      fixture.componentRef.setInput('content', 'New');
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.coar-badge');
      expect(badge.textContent).toContain('New');
    });

    it('should display number content', () => {
      fixture.componentRef.setInput('content', 42);
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.coar-badge');
      expect(badge.textContent).toContain('42');
    });
  });

  describe('max value', () => {
    it('should display number when below max', () => {
      fixture.componentRef.setInput('content', 50);
      fixture.componentRef.setInput('max', 99);
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.coar-badge');
      expect(badge.textContent).toContain('50');
    });

    it('should display max+ when above max', () => {
      fixture.componentRef.setInput('content', 150);
      fixture.componentRef.setInput('max', 99);
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.coar-badge');
      expect(badge.textContent).toContain('99+');
    });

    it('should display exact value when at max', () => {
      fixture.componentRef.setInput('content', 99);
      fixture.componentRef.setInput('max', 99);
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.coar-badge');
      expect(badge.textContent).toContain('99');
      expect(badge.textContent).not.toContain('99+');
    });
  });

  describe('dot mode', () => {
    it('should apply dot class when dot is true', () => {
      fixture.componentRef.setInput('dot', true);
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.coar-badge');
      expect(badge.classList).toContain('coar-badge--dot');
    });

    it('should not display content in dot mode', () => {
      fixture.componentRef.setInput('content', '5');
      fixture.componentRef.setInput('dot', true);
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.coar-badge');
      expect(badge.textContent?.trim()).toBe('');
    });
  });

  describe('pulse animation', () => {
    it('should apply pulse class to host when pulse is true', () => {
      fixture.componentRef.setInput('pulse', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList).toContain('coar-badge-host--pulse');
    });
  });

  describe('bordered', () => {
    it('should apply bordered class when bordered is true', () => {
      fixture.componentRef.setInput('bordered', true);
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.coar-badge');
      expect(badge.classList).toContain('coar-badge--bordered');
    });
  });
});
