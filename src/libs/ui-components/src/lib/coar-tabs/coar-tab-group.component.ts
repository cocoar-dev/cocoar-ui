import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
  output,
  signal,
  effect,
  AfterContentInit,
} from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { CoarTabComponent } from './coar-tab.component';

@Component({
  selector: 'coar-tab-group',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  templateUrl: './coar-tab-group.component.html',
  styleUrl: './coar-tab-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarTabGroupComponent implements AfterContentInit {
  /** The currently active tab id */
  activeTab = input<string>('');

  /** Emits when the active tab changes */
  activeTabChange = output<string>();

  /** All tab components projected into this group */
  tabs = contentChildren(CoarTabComponent);

  /** Internal active tab state */
  protected internalActiveTab = signal<string>('');

  constructor() {
    effect(() => {
      const externalTab = this.activeTab();
      if (externalTab) {
        this.internalActiveTab.set(externalTab);
      }
    });
  }

  ngAfterContentInit(): void {
    if (!this.internalActiveTab() && this.tabs().length > 0) {
      const firstTabId = this.tabs()[0].id();
      this.internalActiveTab.set(firstTabId);
    }
  }

  /** Check if a tab is currently active */
  isActive(tabId: string): boolean {
    const activeId = this.internalActiveTab();
    if (activeId) {
      return activeId === tabId;
    }
    return this.tabs()[0]?.id() === tabId;
  }

  /**
   * Determines whether the content of a tab should be rendered.
   * - For 'eager' strategy: always render (content stays in DOM)
   * - For 'lazy' strategy: only render when active
   */
  shouldRenderContent(tab: CoarTabComponent): boolean {
    if (tab.loadingStrategy() === 'eager') {
      return true;
    }
    // Default is lazy: only render when active
    return this.isActive(tab.id());
  }

  /** Select a tab by its id */
  selectTab(tabId: string): void {
    const tab = this.tabs().find((t) => t.id() === tabId);
    if (tab && !tab.disabled()) {
      this.internalActiveTab.set(tabId);
      this.activeTabChange.emit(tabId);
    }
  }

  /** Handle keyboard navigation */
  onKeydown(event: KeyboardEvent, currentTabId: string): void {
    const tabsArray = this.tabs().filter((t) => !t.disabled());
    const currentIndex = tabsArray.findIndex((t) => t.id() === currentTabId);

    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabsArray.length - 1;
        event.preventDefault();
        break;
      case 'ArrowRight':
        newIndex = currentIndex < tabsArray.length - 1 ? currentIndex + 1 : 0;
        event.preventDefault();
        break;
      case 'Home':
        newIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        newIndex = tabsArray.length - 1;
        event.preventDefault();
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      const newTab = tabsArray[newIndex];
      this.selectTab(newTab.id());
      const tabButton = document.querySelector(`[data-tab-id="${newTab.id()}"]`) as HTMLElement;
      tabButton?.focus();
    }
  }
}
