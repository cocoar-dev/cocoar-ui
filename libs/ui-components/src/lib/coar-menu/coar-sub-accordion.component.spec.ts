import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CoarMenuComponent } from './coar-menu.component';
import { CoarMenuItemComponent } from './coar-menu-item.component';
import { CoarSubAccordionComponent } from './coar-sub-accordion.component';

@Component({
  standalone: true,
  imports: [CoarMenuComponent, CoarMenuItemComponent, CoarSubAccordionComponent],
  template: `
    <coar-menu>
      <coar-sub-accordion label="More" [(open)]="open">
        <ng-template>
          <coar-menu-item>Item A</coar-menu-item>
        </ng-template>
      </coar-sub-accordion>
    </coar-menu>
  `,
})
class TestHostComponent {
  open = false;
}

describe('CoarSubAccordionComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should render submenu content when opened', () => {
    expect(fixture.debugElement.query(By.css('coar-menu coar-menu-item'))).toBeNull();

    fixture.componentInstance.open = true;
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('coar-sub-accordion .coar-sub-accordion__panel'))
    ).toBeTruthy();
    expect(fixture.debugElement.query(By.css('coar-sub-accordion coar-menu-item'))).toBeTruthy();
  });

  it('should toggle open via click when two-way bound', () => {
    const header = fixture.debugElement.query(By.css('coar-sub-accordion .coar-sub-accordion'));
    expect(header).toBeTruthy();

    header.nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open).toBe(true);

    header.nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open).toBe(false);
  });
});
