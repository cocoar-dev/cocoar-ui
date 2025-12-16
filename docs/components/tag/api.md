# Tag API

## CoarTagComponent

### Import

```ts
import { CoarTagComponent } from '@cocoar/ui-components';
```

### Selector

```html
<coar-tag></coar-tag>
```

### Types

- `TagColor = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent'`
- `TagSize = 'sm' | 'md' | 'lg'`

### Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | `TagColor` | `'neutral'` | Tag color scheme. |
| `size` | `TagSize` | `'md'` | Tag size. |
| `elevated` | `boolean` | `false` | Adds elevation via `--coar-elevation-medium`. Supports boolean attribute usage. |
| `borderless` | `boolean` | `false` | Removes the border. Supports boolean attribute usage. |
| `closable` | `boolean` | `false` | Shows a close button. Supports boolean attribute usage. |

### Outputs

| Name | Type | Description |
| --- | --- | --- |
| `closed` | `void` | Emitted when the close button is clicked. |

### Content projection

- Projected content becomes the tag label.

## CSS tokens used

The tag uses design tokens (CSS variables), including:

- Spacing/radius: `--coar-spacing-xxs`, `--coar-spacing-xs`, `--coar-spacing-s`, `--coar-radius-xs`, `--coar-radius-xxs`
- Typography: `--coar-body-small-base-family`, `--coar-body-small-base-weight`, `--coar-body-footnote-size`, `--coar-body-caption-size`, `--coar-body-small-base-size`
- Borders/focus: `--coar-border-accent-primary`
- Elevation: `--coar-elevation-medium`
- Variant colors:
  - Neutral: `--coar-background-neutral-secondary`, `--coar-border-neutral-tertiary`, `--coar-text-neutral-primary`
  - Semantic: `--coar-background-semantic-*-subtle`, `--coar-border-semantic-*-subtle`, `--coar-text-neutral-primary`
  - Accent: `--coar-background-accent-secondary`, `--coar-border-accent-secondary`, `--coar-text-neutral-primary`

Notes:

- `--coar-tag-bg` and `--coar-tag-border-color` are internal custom properties set per color variant.
