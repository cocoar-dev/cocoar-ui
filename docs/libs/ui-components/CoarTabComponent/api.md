# CoarTabComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

Individual tab definition for use within CoarTabGroup.
The tab label is provided as content projected into the component.
This allows simple text, icons, badges, or any custom HTML.
**Example :**`<coar-tab id="home" [content]="homeTemplate">Home</coar-tab>`**Example :**`<coar-tab id="settings" [content]="SettingsComponent">⚙️ Settings</coar-tab>`**Example :**`<coar-tab id="messages" [content]="messagesTemplate">
  Messages <span class="badge">5</span>
</coar-tab>`

## Selector

```html
<coar-tab></coar-tab>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `content` | `TabContent` | - | ✅ | The content to display in the tab panel. Can be either a TemplateRef (from ng-template) or a Component class. |
| `contentInputs` | `Record<string, unknown>` | `{}` | - | Inputs to pass when content is a Component. Ignored when content is a TemplateRef. |
| `disabled` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether the tab is disabled |
| `id` | `string` | - | ✅ | Unique identifier for the tab |
| `loadingStrategy` | `TabLoadingStrategy` | `'lazy'` | - | Loading strategy for the tab content.  - 'lazy' (default): Content is only rendered when tab becomes active  - 'eager': Content is always rendered, just hidden when inactive |
