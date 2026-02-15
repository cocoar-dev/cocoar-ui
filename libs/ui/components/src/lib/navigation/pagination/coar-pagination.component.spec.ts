import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CoarPaginationComponent } from './coar-pagination.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarPaginationComponent],
  template: `
    <coar-pagination
      [totalItems]="totalItems"
      [pageSize]="pageSize"
      [(currentPage)]="currentPage"
      [maxVisiblePages]="maxVisiblePages"
      [showFirstLast]="showFirstLast"
      [disabled]="disabled"
      (pageChanged)="onPageChanged($event)"
    />
  `,
})
class TestHostComponent {
  totalItems = 100;
  pageSize = 10;
  currentPage = 1;
  maxVisiblePages = 5;
  showFirstLast = true;
  disabled = false;
  pageChanges: number[] = [];

  onPageChanged(page: number): void {
    this.pageChanges.push(page);
  }
}

describe('CoarPaginationComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostElement: HTMLElement;

  function createFixture(overrides: Partial<TestHostComponent> = {}): void {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    Object.assign(hostComponent, overrides);
    fixture.detectChanges();
    hostElement = fixture.nativeElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  function getNav(): HTMLElement | null {
    return hostElement.querySelector('nav[aria-label="Pagination"]');
  }

  function getPageButtons(): HTMLButtonElement[] {
    return Array.from(hostElement.querySelectorAll('.coar-pagination-button--page'));
  }

  function getNavButtons(): HTMLButtonElement[] {
    return Array.from(hostElement.querySelectorAll('.coar-pagination-button--nav'));
  }

  function getActiveButton(): HTMLButtonElement | null {
    return hostElement.querySelector('.coar-pagination-button--active');
  }

  function getEllipses(): HTMLElement[] {
    return Array.from(hostElement.querySelectorAll('.coar-pagination-ellipsis'));
  }

  describe('rendering', () => {
    beforeEach(() => createFixture());

    it('should create', () => {
      const pagination = hostElement.querySelector('coar-pagination');
      expect(pagination).toBeTruthy();
    });

    it('should render a nav element with aria-label', () => {
      expect(getNav()).toBeTruthy();
    });

    it('should render page buttons', () => {
      expect(getPageButtons().length).toBeGreaterThan(0);
    });

    it('should render navigation buttons', () => {
      expect(getNavButtons().length).toBe(4); // first, prev, next, last
    });

    it('should show active page', () => {
      const active = getActiveButton();
      expect(active).toBeTruthy();
      expect(active?.textContent?.trim()).toBe('1');
    });
  });

  describe('page navigation', () => {
    it('should go to next page when next button is clicked', () => {
      createFixture();

      const navButtons = getNavButtons();
      const nextButton = navButtons[2]; // next button
      nextButton.click();
      fixture.detectChanges();

      expect(hostComponent.currentPage).toBe(2);
      expect(hostComponent.pageChanges).toContain(2);
    });

    it('should go to previous page when prev button is clicked', () => {
      createFixture({ currentPage: 5 });

      const navButtons = getNavButtons();
      const prevButton = navButtons[1]; // prev button
      prevButton.click();
      fixture.detectChanges();

      expect(hostComponent.currentPage).toBe(4);
    });

    it('should go to specific page when page button is clicked', () => {
      createFixture();

      const pageButtons = getPageButtons();
      const page2 = pageButtons.find((btn) => btn.textContent?.trim() === '2');
      page2?.click();
      fixture.detectChanges();

      expect(hostComponent.currentPage).toBe(2);
    });

    it('should go to first page when first button is clicked', () => {
      createFixture({ currentPage: 5 });

      const navButtons = getNavButtons();
      const firstButton = navButtons[0];
      firstButton.click();
      fixture.detectChanges();

      expect(hostComponent.currentPage).toBe(1);
    });

    it('should go to last page when last button is clicked', () => {
      createFixture();

      const navButtons = getNavButtons();
      const lastButton = navButtons[3];
      lastButton.click();
      fixture.detectChanges();

      expect(hostComponent.currentPage).toBe(10);
    });
  });

  describe('boundary conditions', () => {
    it('should disable prev and first buttons on first page', () => {
      createFixture({ currentPage: 1 });

      const navButtons = getNavButtons();
      expect(navButtons[0].disabled).toBe(true); // first
      expect(navButtons[1].disabled).toBe(true); // prev
    });

    it('should disable next and last buttons on last page', () => {
      createFixture({ currentPage: 10 });

      const navButtons = getNavButtons();
      expect(navButtons[2].disabled).toBe(true); // next
      expect(navButtons[3].disabled).toBe(true); // last
    });
  });

  describe('ellipsis', () => {
    it('should show ellipsis for large page counts', () => {
      createFixture({ totalItems: 200 });

      expect(getEllipses().length).toBeGreaterThan(0);
    });

    it('should not show ellipsis when total pages fit within maxVisiblePages', () => {
      createFixture({ totalItems: 30, maxVisiblePages: 5 });

      expect(getEllipses().length).toBe(0);
    });
  });

  describe('showFirstLast', () => {
    it('should hide first/last buttons when showFirstLast is false', () => {
      createFixture({ showFirstLast: false });

      expect(getNavButtons().length).toBe(2); // only prev, next
    });
  });

  describe('disabled state', () => {
    it('should apply disabled class', () => {
      createFixture({ disabled: true });

      const pagination = hostElement.querySelector('coar-pagination');
      expect(pagination?.classList.contains('coar-pagination--disabled')).toBe(true);
    });

    it('should disable all buttons when disabled', () => {
      createFixture({ disabled: true });

      const allButtons = hostElement.querySelectorAll('button');
      allButtons.forEach((button) => {
        expect(button.disabled).toBe(true);
      });
    });
  });

  describe('accessibility', () => {
    beforeEach(() => createFixture());

    it('should have aria-current on active page button', () => {
      const active = getActiveButton();
      expect(active?.getAttribute('aria-current')).toBe('page');
    });

    it('should have aria-label on page buttons', () => {
      const pageButtons = getPageButtons();
      pageButtons.forEach((button) => {
        expect(button.getAttribute('aria-label')).toMatch(/Go to page \d+/);
      });
    });

    it('should have aria-label on navigation buttons', () => {
      const navButtons = getNavButtons();
      expect(navButtons[0].getAttribute('aria-label')).toBe('Go to first page');
      expect(navButtons[1].getAttribute('aria-label')).toBe('Go to previous page');
      expect(navButtons[2].getAttribute('aria-label')).toBe('Go to next page');
      expect(navButtons[3].getAttribute('aria-label')).toBe('Go to last page');
    });
  });
});
