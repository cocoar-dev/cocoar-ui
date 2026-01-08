# CoarTableComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

A simple table component that provides consistent styling.
Default styling uses alternating row colors (zebra stripes) for readability.
Use 'plain' variant for no stripes, or 'bordered' for full cell borders.
Usage:
**Example :**`<coar-table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td><code>string</code></td>
    </tr>
  </tbody>
</coar-table>`

## Selector

```html
<coar-table></coar-table>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `compact` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether to use compact padding |
| `hover` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Whether rows should highlight on hover |
| `variant` | `CoarTableVariant` | `'default'` | - | Visual variant of the table: default (zebra stripes), plain (no stripes), bordered (cell borders) |
