import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { CoarTableComponent, CoarTableVariant } from './coar-table.component';

// Test host component
@Component({
  standalone: true,
  imports: [CoarTableComponent],
  template: `
    <coar-table>
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
  @ViewChild(CoarTableComponent, { static: true })
  tableComponent!: CoarTableComponent;
}

describe('CoarTableComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let tableFixture: ComponentFixture<CoarTableComponent>;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    hostElement = fixture.nativeElement;

    // Create a fixture reference to the table component for input setting
    tableFixture = hostComponent.tableComponent as any;
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

    it('should apply plain variant class', async () => {
      // Create new fixture with plain variant
      const plainFixture = TestBed.createComponent(CoarTableComponent);
      plainFixture.componentRef.setInput('variant', 'plain');
      plainFixture.detectChanges();

      const component = plainFixture.nativeElement;
      expect(component.classList.contains('coar-table--plain')).toBe(true);
      plainFixture.destroy();
    });

    it('should apply bordered variant class', async () => {
      // Create new fixture with bordered variant
      const borderedFixture = TestBed.createComponent(CoarTableComponent);
      borderedFixture.componentRef.setInput('variant', 'bordered');
      borderedFixture.detectChanges();

      const component = borderedFixture.nativeElement;
      expect(component.classList.contains('coar-table--bordered')).toBe(true);
      borderedFixture.destroy();
    });
  });

  describe('compact mode', () => {
    it('should not apply compact class by default', () => {
      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--compact')).toBe(false);
    });

    it('should apply compact class when compact is true', async () => {
      // Create new fixture with compact true
      const compactFixture = TestBed.createComponent(CoarTableComponent);
      compactFixture.componentRef.setInput('compact', true);
      compactFixture.detectChanges();

      const component = compactFixture.nativeElement;
      expect(component.classList.contains('coar-table--compact')).toBe(true);
      compactFixture.destroy();
    });
  });

  describe('hover mode', () => {
    it('should apply hover class by default', () => {
      const component = getComponentElement();
      expect(component?.classList.contains('coar-table--hover')).toBe(true);
    });

    it('should not apply hover class when hover is false', async () => {
      // Create new fixture with hover false
      const noHoverFixture = TestBed.createComponent(CoarTableComponent);
      noHoverFixture.componentRef.setInput('hover', false);
      noHoverFixture.detectChanges();

      const component = noHoverFixture.nativeElement;
      expect(component.classList.contains('coar-table--hover')).toBe(false);
      noHoverFixture.destroy();
    });
  });

  describe('combinations', () => {
    it('should apply multiple classes together', async () => {
      // Create new fixture with all options
      const multiFixture = TestBed.createComponent(CoarTableComponent);
      multiFixture.componentRef.setInput('variant', 'bordered');
      multiFixture.componentRef.setInput('compact', true);
      multiFixture.componentRef.setInput('hover', true);
      multiFixture.detectChanges();

      const component = multiFixture.nativeElement;
      expect(component.classList.contains('coar-table--bordered')).toBe(true);
      expect(component.classList.contains('coar-table--compact')).toBe(true);
      expect(component.classList.contains('coar-table--hover')).toBe(true);
      multiFixture.destroy();
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
