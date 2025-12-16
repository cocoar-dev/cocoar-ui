import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CoarTabGroupComponent,
  CoarTabComponent,
  CoarCodeBlockComponent,
  CoarButtonComponent,
  CoarTableComponent,
  CoarDividerComponent,
} from '@cocoar/ui-components';
import { LazyDemoComponent } from './lazy-demo.component';

@Component({
  selector: 'app-tabs-page',
  standalone: true,
  imports: [
    CommonModule,
    CoarTabGroupComponent,
    CoarTabComponent,
    CoarCodeBlockComponent,
    CoarButtonComponent,
    CoarTableComponent,
    CoarDividerComponent,
    LazyDemoComponent,
  ],
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.css',
})
export class TabsPage {
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

  // API properties
  tabGroupProps = [
    {
      name: 'activeTab',
      type: 'string',
      required: false,
      default: "''",
      description: 'The id of the currently active tab',
    },
    {
      name: 'activeTabChange',
      type: 'EventEmitter<string>',
      required: false,
      default: '-',
      description: 'Emits when the active tab changes',
    },
  ];

  tabProps = [
    {
      name: 'id',
      type: 'string',
      required: true,
      default: '-',
      description: 'Unique identifier for the tab',
    },
    {
      name: 'content',
      type: 'TemplateRef | Type<any>',
      required: true,
      default: '-',
      description:
        'The content to display in the tab panel. Can be a template reference or component class.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      required: false,
      default: 'false',
      description: 'Whether the tab is disabled',
    },
    {
      name: 'loadingStrategy',
      type: "'eager' | 'lazy'",
      required: false,
      default: "'lazy'",
      description:
        "Controls when content is rendered. 'lazy' (default) only renders when active, 'eager' keeps content in DOM.",
    },
    {
      name: 'contentInputs',
      type: 'Record<string, unknown>',
      required: false,
      default: '{}',
      description: 'Input properties to pass when content is a Component',
    },
    {
      name: '(content)',
      type: 'ng-content',
      required: true,
      default: '-',
      description: 'Tab label content. Supports text, icons, badges, or any HTML.',
    },
  ];
}
