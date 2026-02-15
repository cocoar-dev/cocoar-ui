import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CoarBreadcrumbComponent } from './coar-breadcrumb.component';
import { CoarBreadcrumbItemComponent } from './coar-breadcrumb-item.component';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoarBreadcrumbComponent, CoarBreadcrumbItemComponent],
  template: `
    <coar-breadcrumb [separator]="separator">
      <coar-breadcrumb-item><a href="/home">Home</a></coar-breadcrumb-item>
      <coar-breadcrumb-item><a href="/users">Users</a></coar-breadcrumb-item>
      <coar-breadcrumb-item [active]="true">John Doe</coar-breadcrumb-item>
    </coar-breadcrumb>
  `,
})
class TestHostComponent {
  separator = '/';
}

describe('CoarBreadcrumbComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    hostElement = fixture.nativeElement;
  });

  it('should create', () => {
    const breadcrumb = hostElement.querySelector('coar-breadcrumb');
    expect(breadcrumb).toBeTruthy();
  });

  it('should render a nav element with aria-label', () => {
    const nav = hostElement.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('should render an ordered list', () => {
    const ol = hostElement.querySelector('ol.coar-breadcrumb-list');
    expect(ol).toBeTruthy();
  });

  it('should render all breadcrumb items', () => {
    const items = hostElement.querySelectorAll('coar-breadcrumb-item');
    expect(items.length).toBe(3);
  });

  it('should render links in non-active items', () => {
    const links = hostElement.querySelectorAll('coar-breadcrumb-item a');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain('Home');
    expect(links[1].textContent).toContain('Users');
  });

  it('should mark active item with aria-current page', () => {
    const activeItem = hostElement.querySelector('coar-breadcrumb-item[aria-current="page"]');
    expect(activeItem).toBeTruthy();
    expect(activeItem?.textContent).toContain('John Doe');
  });

  it('should apply active class to active item', () => {
    const activeItem = hostElement.querySelector('coar-breadcrumb-item.coar-breadcrumb-item--active');
    expect(activeItem).toBeTruthy();
  });

  it('should not set aria-current on non-active items', () => {
    const items = hostElement.querySelectorAll('coar-breadcrumb-item');
    expect(items[0].getAttribute('aria-current')).toBeNull();
    expect(items[1].getAttribute('aria-current')).toBeNull();
  });
});

describe('CoarBreadcrumbItemComponent', () => {
  let fixture: ComponentFixture<CoarBreadcrumbItemComponent>;
  let component: CoarBreadcrumbItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarBreadcrumbItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarBreadcrumbItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have active default to false', () => {
    expect(component.active()).toBe(false);
  });

  it('should have coar-breadcrumb-item class', () => {
    expect(fixture.nativeElement.classList.contains('coar-breadcrumb-item')).toBe(true);
  });

  it('should not have active class by default', () => {
    expect(fixture.nativeElement.classList.contains('coar-breadcrumb-item--active')).toBe(false);
  });
});
