# CoarSubmenuItemComponent

**Type:** Component

**Package:** `@cocoar/ui-menu`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

CoarSubmenuItem: Menu item that opens a submenu on hover.
Responsibilities:

- Render parent item with icon and label

- Manage submenu overlay lifecycle

- Support nested submenus (can contain other submenu-items)

**Example :**`<coar-submenu-item label="Share" icon="🔗">
  <ng-template>
    <coar-menu-item icon="✉️" (itemClick)="sendEmail()">Email</coar-menu-item>
    <coar-menu-item icon="🔗" (itemClick)="copyLink()">Copy Link</coar-menu-item>
  </ng-template>
</coar-submenu-item>

<!-- Optional: explicitly mark the template -->
<coar-submenu-item label="Share" icon="🔗">
  <ng-template coarSubmenu>
    ...
  </ng-template>
</coar-submenu-item>

<!-- Also supported (legacy / external template): -->
<coar-submenu-item label="Share" icon="🔗" [submenuTemplate]="shareMenu" />`

## Selector

```html
<coar-submenu-item, coar-sub-flyout></coar-submenu-item, coar-sub-flyout>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `` | `false` | - | Disabled state prevents interaction |
| `icon` | `string \| undefined` | `undefined` | - | Optional icon identifier |
| `label` | `string` | - | ✅ | Label text for the menu item |
| `submenuData` | `unknown` | `undefined` | - | Optional data to pass to the submenu template. If provided, this data will be passed as the context to the submenu template, instead of inheriting the parent overlay's context. Use this to create clean boundaries between parent and submenu:  - Simple case: `[submenuData]="context"` (pass full context)  - Complex case: `[submenuData]="transformData(context)"` (pass only what submenu needs)  **Example :**`<!-- Pass specific data contract to submenu --> <coar-submenu-item   label="Status"   [submenuTemplate]="statusMenu"   [submenuData]="{ selectedIds: context.selected.map(s => s.Id) }"> </coar-submenu-item>` |
| `submenuTemplate` | `TemplateRef<unknown> \| null` | `null` | - | Optional external submenu template. Prefer an inline `<ng-template>` child when possible. |
