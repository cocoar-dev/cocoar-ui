# CoarSubExpandComponent

**Type:** Component

**Package:** `@cocoar/ui-menu`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

CoarSubExpand: Menu item that expands/collapses a submenu inline.
Use this variant when you want nested options to stay visible (e.g. sidebar panels)
while still reusing the same menu item types inside the submenu.
**Example :**`<coar-menu>
  <coar-sub-expand label="Filters" icon="settings" [(open)]="filtersOpen">
    <ng-template>
      <coar-menu>
        <coar-menu-item icon="plus">Add Filter</coar-menu-item>
        <coar-menu-item icon="trash">Clear</coar-menu-item>
      </coar-menu>
    </ng-template>
</coar-sub-expand>
</coar-menu>`

## Selector

```html
<coar-sub-expand></coar-sub-expand>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `` | `false` | - | Disabled state prevents interaction |
| `icon` | `string \| undefined` | `undefined` | - | Optional icon identifier |
| `label` | `string` | - | ✅ | Label text for the menu item |
| `open` | `boolean \| undefined, unknown` | `undefined, { transform: booleanAttribute }` | - | Expanded state (two-way bindable with [(open)]) |
| `submenuTemplate` | `TemplateRef<unknown> \| null` | `null` | - | Optional external submenu template. Prefer an inline `<ng-template>` child when possible. |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Emits when expanded state changes (for [(open)]) |
