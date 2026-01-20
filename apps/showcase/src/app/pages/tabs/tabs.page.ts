import { Component } from '@angular/core';

import {
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarCodeBlockComponent,
  CoarButtonComponent,
  CoarDividerComponent,
} from '@cocoar/ui-components';
import { LazyDemoComponent } from './lazy-demo.component';

import { ShowcaseMarkdownTabContentComponent } from '../../shared/components/showcase-markdown-tab-content/showcase-markdown-tab-content.component';

@Component({
  selector: 'app-tabs-page',
  standalone: true,
  imports: [
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarCodeBlockComponent,
    CoarButtonComponent,
    CoarDividerComponent,
    LazyDemoComponent,
  ],
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.css',
})
export class TabsPage {
  protected readonly ShowcaseMarkdownTabContentComponent = ShowcaseMarkdownTabContentComponent;

  protected readonly docsPath = '/docs/libs/ui-components/coar-tab-group.docs.md';
  protected readonly apiPath = '/docs/libs/ui-components/coar-tab-group.api.md';

  // Page-level tabs
  activeTab = 'examples';

  // Demo controlled state
  demoActiveTab = 'demo-overview';

  // Lazy loading demo state
  lazyDemoActiveTab = 'lazy-template';

  // Reference to the lazy demo component for dynamic loading
  LazyDemoComponent = LazyDemoComponent;

  // Code examples
  basicExample = `<coar-tab-group>
  <coar-tab id="overview" [content]="overviewTemplate">Overview</coar-tab>
  <coar-tab id="features" [content]="featuresTemplate">Features</coar-tab>
  <coar-tab id="api" [content]="apiTemplate">API</coar-tab>
</coar-tab-group>

<ng-template #overviewTemplate>
  <p>Overview content goes here...</p>
</ng-template>

<ng-template #featuresTemplate>
  <p>Features content goes here...</p>
</ng-template>

<ng-template #apiTemplate>
  <p>API documentation goes here...</p>
</ng-template>`;

  withIconsExample = `<coar-tab-group>
  <coar-tab id="home" [content]="homeTemplate">🏠 Home</coar-tab>
  <coar-tab id="settings" [content]="settingsTemplate">⚙️ Settings</coar-tab>
  <coar-tab id="profile" [content]="profileTemplate">👤 Profile</coar-tab>
</coar-tab-group>`;

  controlledExample = `// Component
activeTab = 'features';

// Template
<coar-tab-group
  [activeTab]="activeTab"
  (activeTabChange)="activeTab = $event">
  <coar-tab id="overview" [content]="overviewTpl">Overview</coar-tab>
  <coar-tab id="features" [content]="featuresTpl">Features</coar-tab>
</coar-tab-group>`;

  disabledExample = `<coar-tab-group>
  <coar-tab id="active" [content]="activeTemplate">Available</coar-tab>
  <coar-tab id="disabled" [disabled]="true" [content]="disabledTemplate">Coming Soon</coar-tab>
  <coar-tab id="another" [content]="anotherTemplate">Also Available</coar-tab>
</coar-tab-group>`;

  lazyLoadingExample = `// Component class
LazyDemoComponent = LazyDemoComponent;

// Template - all content is lazy by default
<coar-tab-group>
  <coar-tab id="template" [content]="myTemplate">📋 Template</coar-tab>
  <coar-tab id="component"
    [content]="LazyDemoComponent"
    [contentInputs]="{ title: 'Dynamic', icon: '🚀' }">🚀 Component</coar-tab>
</coar-tab-group>

<ng-template #myTemplate>
  <my-component />
</ng-template>`;

  loadingStrategyExample = `<!-- Default is lazy - content only rendered when active -->
<coar-tab id="lazy" [content]="lazyTemplate">Lazy (default)</coar-tab>

<!-- Eager keeps content in DOM, just hidden when inactive -->
<coar-tab id="eager" [content]="eagerTemplate" loadingStrategy="eager">Eager</coar-tab>`;

  richLabelExample = `<!-- Use inline content for rich labels -->
<coar-tab-group>
  <coar-tab id="messages" [content]="messagesTemplate">
    Messages <span class="badge">5</span>
  </coar-tab>
  <coar-tab id="settings" [content]="settingsTemplate">
    <coar-icon name="settings" /> Settings
  </coar-tab>
</coar-tab-group>`;
}
