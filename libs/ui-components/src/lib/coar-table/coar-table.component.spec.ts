import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CoarTableComponent, CoarTableVariant } from './coar-table.component';

// Test host component
@Component({
  standalone: true,
  imports: [CoarTableComponent],
  template: `
    <coar-table [variant]="variant" [compact]="compact" [hover]="hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>id</td>
          <td>number</td>
        </tr>
        <tr>
          <td>name</td>
          <td>string</td>
        </tr>
      </tbody>
    </coar-table>
  `,
})
class TestHostComponent {
  variant: CoarTableVariant = 'default';
  compact = false;
  hover = true;
}

describe('CoarTableComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    hostElement = fixture.nativeElement;
  });

  function getTableElement(): HTMLTableElement | null {
    return hostElement.querySelector('table.coar-table');
  }

  function getWrapperElement(): HTMLElement | null {
    return hostElement.querySelector('.coar-table-wrapper');
  }

  function getComponentElement(): HTMLElement | null {
    return hostElement.querySelector('coar-table');
  }

  describe('rendering', () => {
    it('should create', () => {
      expect(getComponentElement()).toBeTruthy();
    });

    it('should render table element', () => {
      expect(getTableElement()).toBeTruthy();
    });

    it('should render wrapper element', () => {
      expect(getWrapperElement()).toBeTruthy();
    });

    it('should render table headers', () => {
      const headers = hostElement.querySelectorAll('th');
      expect(headers.length).toBe(2);
      expect(headers[0].textContent).toContain('Name');
      expect(headers[1].textContent).toContain('Type');
    });

    it('should render table rows', () => {
      const rows = hostElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('should render table cells', () => {
      const cells = hostElement.querySelectorAll('td');
      expect(cells.length).toBe(4);
      expect(cells[0].textContent).toContain('id');
      expect(cells[1].textContent).toContain('number');
    });
  });

  describe('variants', () => {
    it('should apply default variant (no special class)', () => {
      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--plain')).toBe(false);
      expect(component?.classList.contains('coar-table--bordered')).toBe(false);
    });

    it('should apply plain variant class', () => {
      hostComponent.variant = 'plain';
      fixture.detectChanges();
      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--plain')).toBe(true);
    });

    it('should apply bordered variant class', () => {
      hostComponent.variant = 'bordered';
      fixture.detectChanges();
      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--bordered')).toBe(true);
    });
  });

  describe('compact mode', () => {
    it('should not apply compact class by default', () => {
      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--compact')).toBe(false);
    });

    it('should apply compact class when compact is true', () => {
      hostComponent.compact = true;
      fixture.detectChanges();
      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--compact')).toBe(true);
    });
  });

  describe('hover mode', () => {
    it('should apply hover class by default', () => {
      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--hover')).toBe(true);
    });

    it('should not apply hover class when hover is false', () => {
      hostComponent.hover = false;
      fixture.detectChanges();
      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--hover')).toBe(false);
    });
  });

  describe('combinations', () => {
    it('should apply multiple classes together', () => {
      hostComponent.variant = 'bordered';
      hostComponent.compact = true;
      hostComponent.hover = true;
      fixture.detectChanges();

      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--bordered')).toBe(true);
      expect(component?.classList.contains('coar-table--compact')).toBe(true);
      expect(component?.classList.contains('coar-table--hover')).toBe(true);
    });
  });
});

// Standalone component tests
describe('CoarTableComponent standalone', () => {
  let fixture: ComponentFixture<CoarTableComponent>;
  let component: CoarTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have default variant', () => {
    expect(component.variant()).toBe('default');
  });

  it('should have default compact of false', () => {
    expect(component.compact()).toBe(false);
  });

  it('should have default hover of true', () => {
    expect(component.hover()).toBe(true);
  });
});
