# Table API

## CoarTableComponent

### Import

```ts
import { CoarTableComponent } from '@cocoar/ui-components';
```

### Selector

```html
<coar-table></coar-table>
```

### Types

- `CoarTableVariant = 'default' | 'plain' | 'bordered'`

### Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `CoarTableVariant` | `'default'` | Visual variant: default (zebra stripes), plain (no stripes), bordered (cell borders). |
| `compact` | `boolean` | `false` | Whether to use compact padding. Supports boolean attribute usage. |
| `hover` | `boolean` | `true` | Whether rows should highlight on hover. Supports boolean attribute usage. |

### Content projection

- The component projects your table sections/rows/cells via `<ng-content />`.

### Notes

- `coar-table` always renders a real `<table class="coar-table">` wrapped in a `<div class="coar-table-wrapper">`.

## CSS tokens used

The table uses design tokens (CSS variables) from the Coar theme. Refer to the component stylesheet for the exact list and defaults.
