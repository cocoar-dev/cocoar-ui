import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoarMenuHeadingComponent } from './coar-menu-heading.component';

describe('CoarMenuHeadingComponent', () => {
  let fixture: ComponentFixture<CoarMenuHeadingComponent>;
  let component: CoarMenuHeadingComponent;

  function getHeadingElement(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.coar-menu-heading');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarMenuHeadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarMenuHeadingComponent);
    component = fixture.componentInstance;
  });

  describe('Rendering', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render heading container', () => {
      fixture.detectChanges();
      const heading = getHeadingElement();
      expect(heading).toBeTruthy();
    });

    it('should display projected content by default', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [CoarMenuHeadingComponent],
      });
      const testFixture = TestBed.createComponent(CoarMenuHeadingComponent);
      const compiled = testFixture.nativeElement;
      const contentNode = document.createTextNode('Foundations');
      compiled.appendChild(contentNode);
      testFixture.detectChanges();

      expect(compiled.textContent?.trim()).toBe('Foundations');
    });

    it('should display label input when provided', () => {
      fixture.componentRef.setInput('label', 'Form Controls');
      fixture.detectChanges();

      const heading = getHeadingElement();
      expect(heading?.textContent?.trim()).toBe('Form Controls');
    });

    it('should prioritize label input over projected content', () => {
      const contentNode = document.createTextNode('Projected Text');
      fixture.nativeElement.appendChild(contentNode);
      fixture.componentRef.setInput('label', 'Label Input');
      fixture.detectChanges();

      const heading = getHeadingElement();
      expect(heading?.textContent?.trim()).toBe('Label Input');
    });
  });

  describe('Styling', () => {
    it('should have host class', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('coar-menu-heading-host')).toBe(true);
    });

    it('should apply heading class to inner element', () => {
      fixture.detectChanges();
      const heading = getHeadingElement();
      expect(heading?.classList.contains('coar-menu-heading')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should be non-interactive (no role)', () => {
      fixture.detectChanges();
      const host = fixture.nativeElement;
      expect(host.getAttribute('role')).toBeNull();
    });

    it('should not be focusable', () => {
      fixture.detectChanges();
      const host = fixture.nativeElement;
      expect(host.getAttribute('tabindex')).toBeNull();
    });
  });
});
