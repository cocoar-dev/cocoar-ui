# CoarMenuComponent

**Type:** Component

**Package:** `@cocoar/ui-menu`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

CoarMenu: Shell component providing menu styling container.
Responsibilities:

- Apply consistent menu styling via CSS variables

- Provide semantic menu container (<menu> or )

- Provide root cascade for sibling submenu tracking

- No logic - just a styled wrapper

Use standalone for inline menus, or as overlay content (via `createOverlayBuilder`) for context menus/flyouts.
**Example :**`<coar-menu>
  <coar-menu-item>Action 1</coar-menu-item>
  <coar-menu-item>Action 2</coar-menu-item>
  <coar-menu-divider></coar-menu-divider>
  <coar-menu-item>Action 3</coar-menu-item>
</coar-menu>`

## Selector

```html
<coar-menu></coar-menu>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `showIconColumn` | `` | `true` | - | Controls whether the menu reserves and renders an icon column. Default is enabled to avoid layout shift for stateful icons (e.g. checkmarks). Set to false for text-only menus (icons will not render). |
