import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoarSpinnerComponent, CoarSpinnerSize } from './coar-spinner.component';

describe('CoarSpinnerComponent', () => {
  let component: CoarSpinnerComponent;
  let fixture: ComponentFixture<CoarSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('defaults', () => {
    it('should have m size by default', () => {
      expect(component.size()).toBe('m');
    });

    it('should have Loading label by default', () => {
      expect(component.label()).toBe('Loading');
    });
  });

  describe('size variants', () => {
    it.each(['xs', 's', 'm', 'l'] as CoarSpinnerSize[])(
      'should apply %s size class',
      (size) => {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();
        expect(fixture.nativeElement.classList).toContain(`coar-spinner--${size}`);
      }
    );
  });

  describe('SVG rendering', () => {
    it('should render SVG element', () => {
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render background circle', () => {
      const bg = fixture.nativeElement.querySelector('.coar-spinner-bg');
      expect(bg).toBeTruthy();
    });

    it('should render spinning arc', () => {
      const arc = fixture.nativeElement.querySelector('.coar-spinner-arc');
      expect(arc).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have status role', () => {
      expect(fixture.nativeElement.getAttribute('role')).toBe('status');
    });

    it('should have default aria-label', () => {
      expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Loading');
    });

    it('should support custom aria-label', () => {
      fixture.componentRef.setInput('label', 'Processing');
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Processing');
    });
  });
});
