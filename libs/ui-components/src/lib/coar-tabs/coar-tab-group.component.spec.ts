import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CoarTabGroupComponent } from './coar-tab-group.component';
import { CoarTabComponent } from './coar-tab.component';

// Test host component with tabs
@Component({
  standalone: true,
  imports: [CoarTabGroupComponent, CoarTabComponent],
  template: `
    <coar-tab-group [activeTab]="activeTab" (activeTabChange)="onActiveTabChange($event)">
      <coar-tab id="tab1" [content]="tab1Content">Tab 1</coar-tab>
      <coar-tab id="tab2" [content]="tab2Content">Tab 2</coar-tab>
      <coar-tab id="tab3" [content]="tab3Content" [disabled]="disabledTab">Tab 3</coar-tab>
    </coar-tab-group>

    <ng-template #tab1Content>Content for Tab 1</ng-template>
    <ng-template #tab2Content>Content for Tab 2</ng-template>
    <ng-template #tab3Content>Content for Tab 3</ng-template>
  `,
})
class TestHostComponent {
  @ViewChild('tab1Content') tab1Content!: TemplateRef<unknown>;
  @ViewChild('tab2Content') tab2Content!: TemplateRef<unknown>;
  @ViewChild('tab3Content') tab3Content!: TemplateRef<unknown>;

  activeTab = '';
  disabledTab = false;
  activeTabChanges: string[] = [];

  onActiveTabChange(tabId: string): void {
    this.activeTabChanges.push(tabId);
  }
}

describe('CoarTabGroupComponent', () => {
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

  function getTabButtons(): NodeListOf<HTMLButtonElement> {
    return hostElement.querySelectorAll('[role="tab"]');
  }

  function getTabButton(index: number): HTMLButtonElement | null {
    return getTabButtons()[index] ?? null;
  }

  function getTabPanel(): HTMLElement | null {
    return hostElement.querySelector('[role="tabpanel"]');
  }

  function getTabList(): HTMLElement | null {
    return hostElement.querySelector('[role="tablist"]');
  }

  describe('rendering', () => {
    it('should create', () => {
      const component = hostElement.querySelector('coar-tab-group');
      expect(component).toBeTruthy();
    });

    it('should render all tab buttons', () => {
      expect(getTabButtons().length).toBe(3);
    });

    it('should render tab labels', () => {
      expect(getTabButton(0)?.textContent).toContain('Tab 1');
      expect(getTabButton(1)?.textContent).toContain('Tab 2');
      expect(getTabButton(2)?.textContent).toContain('Tab 3');
    });

    it('should render tablist role', () => {
      expect(getTabList()).toBeTruthy();
    });
  });

  describe('default tab selection', () => {
    it('should select first tab by default', () => {
      const firstTab = getTabButton(0);
      expect(firstTab?.getAttribute('aria-selected')).toBe('true');
    });

    it('should show first tab content by default', () => {
      expect(getTabPanel()?.textContent).toContain('Content for Tab 1');
    });
  });

  describe('tab selection', () => {
    it('should select tab when clicked', () => {
      getTabButton(1)?.click();
      fixture.detectChanges();

      expect(getTabButton(1)?.getAttribute('aria-selected')).toBe('true');
      expect(getTabButton(0)?.getAttribute('aria-selected')).toBe('false');
    });

    it('should show selected tab content', () => {
      getTabButton(1)?.click();
      fixture.detectChanges();

      // Content may be lazy-loaded, check the active panel
      const panel = hostElement.querySelector('[role="tabpanel"].active');
      expect(panel?.textContent).toContain('Content for Tab 2');
    });

    it('should emit activeTabChange when tab is selected', () => {
      getTabButton(1)?.click();
      fixture.detectChanges();

      expect(hostComponent.activeTabChanges).toContain('tab2');
    });

    it('should respect activeTab input', () => {
      hostComponent.activeTab = 'tab2';
      fixture.detectChanges();

      expect(getTabButton(1)?.getAttribute('aria-selected')).toBe('true');
      // Content may be lazy-loaded, check the active panel
      const panel = hostElement.querySelector('[role="tabpanel"].active');
      expect(panel?.textContent).toContain('Content for Tab 2');
    });
  });

  describe('disabled tabs', () => {
    it('should mark disabled tab', () => {
      hostComponent.disabledTab = true;
      fixture.detectChanges();

      expect(getTabButton(2)?.disabled).toBe(true);
    });

    it('should not select disabled tab when clicked', () => {
      hostComponent.disabledTab = true;
      fixture.detectChanges();

      getTabButton(2)?.click();
      fixture.detectChanges();

      // First tab should still be selected
      expect(getTabButton(0)?.getAttribute('aria-selected')).toBe('true');
      expect(hostComponent.activeTabChanges).not.toContain('tab3');
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate right with ArrowRight', () => {
      const firstTab = getTabButton(0)!;
      firstTab.focus();

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      firstTab.dispatchEvent(event);
      fixture.detectChanges();

      expect(hostComponent.activeTabChanges).toContain('tab2');
    });

    it('should navigate left with ArrowLeft', () => {
      // First select tab2
      getTabButton(1)?.click();
      fixture.detectChanges();

      const secondTab = getTabButton(1)!;
      secondTab.focus();

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      secondTab.dispatchEvent(event);
      fixture.detectChanges();

      expect(hostComponent.activeTabChanges).toContain('tab1');
    });

    it('should wrap around from last to first with ArrowRight', () => {
      // Select tab2 (index 1), which is the last non-disabled tab when tab3 is disabled
      hostComponent.disabledTab = true;
      getTabButton(1)?.click();
      fixture.detectChanges();

      const secondTab = getTabButton(1)!;
      secondTab.focus();

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      secondTab.dispatchEvent(event);
      fixture.detectChanges();

      // Should wrap to first tab
      expect(hostComponent.activeTabChanges).toContain('tab1');
    });

    it('should wrap around from first to last with ArrowLeft', () => {
      hostComponent.disabledTab = true;
      fixture.detectChanges();

      const firstTab = getTabButton(0)!;
      firstTab.focus();

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      firstTab.dispatchEvent(event);
      fixture.detectChanges();

      // Should wrap to tab2 (last non-disabled)
      expect(hostComponent.activeTabChanges).toContain('tab2');
    });

    it('should navigate to first tab with Home', () => {
      getTabButton(1)?.click();
      fixture.detectChanges();

      const secondTab = getTabButton(1)!;
      secondTab.focus();

      const event = new KeyboardEvent('keydown', { key: 'Home' });
      secondTab.dispatchEvent(event);
      fixture.detectChanges();

      expect(hostComponent.activeTabChanges).toContain('tab1');
    });

    it('should navigate to last tab with End', () => {
      const firstTab = getTabButton(0)!;
      firstTab.focus();

      const event = new KeyboardEvent('keydown', { key: 'End' });
      firstTab.dispatchEvent(event);
      fixture.detectChanges();

      expect(hostComponent.activeTabChanges).toContain('tab3');
    });

    it('should skip disabled tabs during navigation', () => {
      hostComponent.disabledTab = true;
      fixture.detectChanges();

      const firstTab = getTabButton(0)!;
      firstTab.focus();

      const event = new KeyboardEvent('keydown', { key: 'End' });
      firstTab.dispatchEvent(event);
      fixture.detectChanges();

      // Should go to tab2, not tab3 (disabled)
      expect(hostComponent.activeTabChanges).toContain('tab2');
    });
  });

  describe('accessibility', () => {
    it('should have role tablist', () => {
      expect(getTabList()?.getAttribute('role')).toBe('tablist');
    });

    it('should have role tab on buttons', () => {
      getTabButtons().forEach((button) => {
        expect(button.getAttribute('role')).toBe('tab');
      });
    });

    it('should have role tabpanel on content', () => {
      expect(getTabPanel()?.getAttribute('role')).toBe('tabpanel');
    });

    it('should have tabindex 0 on selected tab', () => {
      expect(getTabButton(0)?.tabIndex).toBe(0);
    });

    it('should have tabindex -1 on non-selected tabs', () => {
      expect(getTabButton(1)?.tabIndex).toBe(-1);
      expect(getTabButton(2)?.tabIndex).toBe(-1);
    });

    it('should associate tab with panel via aria-controls', () => {
      const selectedTab = getTabButton(0);
      const panel = getTabPanel();
      expect(selectedTab?.getAttribute('aria-controls')).toBe(panel?.id);
    });

    it('should associate panel with tab via aria-labelledby', () => {
      const panel = getTabPanel();
      // The panel's aria-labelledby uses the tab's id directly (not the button's id)
      expect(panel?.getAttribute('aria-labelledby')).toBe('tab1');
    });
  });
});

describe('CoarTabComponent', () => {
  let fixture: ComponentFixture<CoarTabComponent>;
  let component: CoarTabComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoarTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoarTabComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default disabled of false', () => {
    expect(component.disabled()).toBe(false);
  });

  it('should have default loading strategy of lazy', () => {
    expect(component.loadingStrategy()).toBe('lazy');
  });

  it('should have default contentInputs as empty object', () => {
    expect(component.contentInputs()).toEqual({});
  });
});
