# Tabs

Tabs organize content into separate views within the same area.

## Basic usage

Define a `coar-tab-group` and provide one or more `coar-tab` items. Each tab points to content via the required `[content]` input.

```html
<coar-tab-group>
  <coar-tab id="overview" [content]="overviewTemplate">Overview</coar-tab>
  <coar-tab id="features" [content]="featuresTemplate">Features</coar-tab>
</coar-tab-group>

<ng-template #overviewTemplate>
  <p>Overview content</p>
</ng-template>

<ng-template #featuresTemplate>
  <p>Features content</p>
</ng-template>
```

If `activeTab` is not provided, the first tab is selected automatically.

## Controlled state

Use `[activeTab]` and `(activeTabChange)` to control the active tab.

```ts
activeTab = 'features';
```

```html
<coar-tab-group [activeTab]="activeTab" (activeTabChange)="activeTab = $event">
  <coar-tab id="overview" [content]="overviewTemplate">Overview</coar-tab>
  <coar-tab id="features" [content]="featuresTemplate">Features</coar-tab>
</coar-tab-group>
```

## Disabled tabs

Disable a tab using the `disabled` boolean input.

```html
<coar-tab-group>
  <coar-tab id="available" [content]="availableTpl">Available</coar-tab>
  <coar-tab id="soon" [disabled]="true" [content]="soonTpl">Coming soon</coar-tab>
</coar-tab-group>
```

## Lazy vs eager content

By default, tab panels are **lazy**: content is only rendered when the tab becomes active.

Use `loadingStrategy="eager"` to keep a panel’s content in the DOM (hidden when inactive).

```html
<coar-tab id="lazy" [content]="lazyTpl">Lazy (default)</coar-tab>
<coar-tab id="eager" [content]="eagerTpl" loadingStrategy="eager">Eager</coar-tab>
```

## Template content vs component content

`[content]` accepts either:

- an `ng-template` reference, or
- a Component class.

When using a Component class, pass its inputs via `contentInputs`.

```ts
DemoComponent = DemoComponent;
```

```html
<coar-tab-group>
  <coar-tab id="template" [content]="templateTpl">Template</coar-tab>
  <coar-tab id="component" [content]="DemoComponent" [contentInputs]="{ title: 'Hello' }">
    Component
  </coar-tab>
</coar-tab-group>

<ng-template #templateTpl>
  <p>Template content</p>
</ng-template>
```

## Rich labels

The tab label is projected content, so you can render icons/badges as part of the label.

```html
<coar-tab-group>
  <coar-tab id="messages" [content]="messagesTpl">
    Messages <span class="badge">5</span>
  </coar-tab>
</coar-tab-group>
```

## Keyboard and accessibility

`coar-tab-group` implements a tablist with WAI-ARIA roles and supports keyboard navigation:

- <kbd>ArrowLeft</kbd>/<kbd>ArrowRight</kbd>: move between enabled tabs
- <kbd>Home</kbd>/<kbd>End</kbd>: jump to first/last enabled tab

Disabled tabs are skipped during keyboard navigation.
