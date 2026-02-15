import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { CoarMenuComponent } from './coar-menu.component';
import { CoarMenuItemComponent } from './coar-menu-item.component';
import { CoarSubExpandComponent } from './coar-sub-expand.component';

@Component({
  standalone: true,
  imports: [CoarMenuComponent, CoarMenuItemComponent, CoarSubExpandComponent],
  template: `
    <coar-menu>
      <coar-sub-expand label="More" [(open)]="open">
        <ng-template>
          <coar-menu-item>Item A</coar-menu-item>
        </ng-template>
      </coar-sub-expand>
    </coar-menu>
  `,
})
class TestHostComponent {
  open = false;
}

describe('CoarSubExpandComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  function detectChanges(): void {
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    detectChanges();
  });

  it('should render the sub-expand trigger', () => {
    const trigger = fixture.debugElement.query(By.css('coar-sub-expand'));
    expect(trigger).toBeTruthy();
  });

  it.skip('should render submenu content when opened', () => {
    // Panel is always in DOM but should not have --open class initially
    const initialPanel = fixture.debugElement.query(
      By.css('coar-sub-expand .coar-sub-expand__panel')
    );
    expect(initialPanel).toBeTruthy();
    expect(initialPanel.nativeElement.classList.contains('coar-sub-expand__panel--open')).toBe(
      false
    );

    fixture.componentInstance.open = true;
    detectChanges();

    const component = fixture.debugElement.query(By.directive(CoarSubExpandComponent))
      .componentInstance as CoarSubExpandComponent;
    expect(component.open()).toBe(true);

    // Now it should have --open class
    const openedPanel = fixture.debugElement.query(
      By.css('coar-sub-expand .coar-sub-expand__panel')
    );
    expect(openedPanel).toBeTruthy();
    expect(openedPanel.nativeElement.classList.contains('coar-sub-expand__panel--open')).toBe(true);
    expect(fixture.debugElement.query(By.css('coar-sub-expand coar-menu-item'))).toBeTruthy();
  });

  it.skip('should toggle open via click when two-way bound', () => {
    const header = fixture.debugElement.query(By.css('coar-sub-expand .coar-sub-expand'));
    expect(header).toBeTruthy();

    header.nativeElement.click();
    detectChanges();

    expect(fixture.componentInstance.open).toBe(true);

    const openedPanel = fixture.debugElement.query(
      By.css('coar-sub-expand .coar-sub-expand__panel')
    );
    expect(openedPanel.nativeElement.classList.contains('coar-sub-expand__panel--open')).toBe(true);

    header.nativeElement.click();
    detectChanges();

    expect(fixture.componentInstance.open).toBe(false);

    const closedPanel = fixture.debugElement.query(
      By.css('coar-sub-expand .coar-sub-expand__panel')
    );
    expect(closedPanel.nativeElement.classList.contains('coar-sub-expand__panel--open')).toBe(
      false
    );
  });
});
