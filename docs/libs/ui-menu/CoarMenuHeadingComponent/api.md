# CoarMenuHeadingComponent

**Type:** Component

**Package:** `@cocoar/ui-menu`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

CoarMenuHeading: Non-interactive section label for menu groups.
Responsibilities:

- Display section/group heading text

- Provide visual separation between menu sections

- Non-interactive (no hover, no click, not focusable)

**Example :**`<coar-menu>
  <coar-menu-heading>Foundations</coar-menu-heading>
  <coar-menu-item routerLink="/typography">Typography</coar-menu-item>
  <coar-menu-item routerLink="/colors">Colors</coar-menu-item>

  <coar-menu-heading>Form Controls</coar-menu-heading>
  <coar-menu-item routerLink="/text-input">Text Input</coar-menu-item>
</coar-menu>`

## Selector

```html
<coar-menu-heading></coar-menu-heading>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | - | - | Optional explicit label text (alternative to content projection) |
