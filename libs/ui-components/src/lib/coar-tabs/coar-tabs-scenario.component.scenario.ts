import { Component, TemplateRef, viewChild } from '@angular/core';
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarTabGroupComponent } from './coar-tab-group.component';
import { CoarTabComponent } from './coar-tab.component';

@Component({
  selector: 'coar-tabs-scenario',
  standalone: true,
  imports: [CoarTabGroupComponent, CoarTabComponent],
  template: `
    <coar-tab-group>
      <coar-tab id="tab1" [content]="tab1Content">Tab 1</coar-tab>
      <coar-tab id="tab2" [content]="tab2Content">Tab 2</coar-tab>
      <coar-tab id="tab3" [content]="tab3Content">Tab 3</coar-tab>
    </coar-tab-group>

    <ng-template #tab1Content>
      <p>Content for Tab 1</p>
    </ng-template>
    <ng-template #tab2Content>
      <p>Content for Tab 2</p>
    </ng-template>
    <ng-template #tab3Content>
      <p>Content for Tab 3</p>
    </ng-template>
  `,
})
export class CoarTabsScenarioComponent {
  tab1Content = viewChild.required<TemplateRef<unknown>>('tab1Content');
  tab2Content = viewChild.required<TemplateRef<unknown>>('tab2Content');
  tab3Content = viewChild.required<TemplateRef<unknown>>('tab3Content');
}

export const scenario = defineScenario<CoarTabsScenarioComponent>({
  id: 'tabs',
  title: 'Tabs',
  description: 'Tab group with multiple tabs',
});
