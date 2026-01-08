# CoarMenuItemComponent

**Type:** Component

**Package:** `@cocoar/ui-menu`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

CoarMenuItem: Individual menu item with optional icon and submenu support.
Responsibilities:

- Render item text and optional icon

- Handle click events

- Support disabled state

- Visual states: hover, active, focus

- Trigger submenu (accordion or flyout via parent menu logic)

Does NOT manage overlay directly - parent menu handles flyout logic.
**Example :**`<coar-menu-item (itemClick)="onSave()">Save</coar-menu-item>
<coar-menu-item icon="copy">Copy</coar-menu-item>
<coar-menu-item [disabled]="true">Unavailable</coar-menu-item>

<!-- Prevent menu from closing on click: -->
<coar-menu-item (itemClick)="toggle($event)">Toggle Setting</coar-menu-item>

toggle(event: CoarMenuItemClickEvent) {
  event.keepMenuOpen(); // Keep menu open
  this.setting = !this.setting;
}`

## Selector

```html
<coar-menu-item></coar-menu-item>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `` | `false` | - | Disabled state prevents interaction |
| `icon` | `string \| undefined` | `undefined` | - | Optional icon identifier (rendered via CoarIconComponent) |
| `label` | `string` | - | - | Item text content |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `itemClick` | `CoarMenuItemClickEvent` | Emitted when user clicks/selects the item. Menu closes by default unless preventDefault() is called. |
| `itemHover` | `Event` | Emitted when user hovers over item (for flyout trigger) |
