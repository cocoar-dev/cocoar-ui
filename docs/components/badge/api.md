# Badge API

## CoarBadgeComponent

### Import

```ts
import { CoarBadgeComponent } from '@cocoar/ui-components';
```

### Selector

```html
<coar-badge></coar-badge>
```

### Types

- `BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'`
- `BadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto'`

### Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `string \| number` | `''` | Content to display (number, text). Ignored when `dot` is true. |
| `variant` | `BadgeVariant` | `'primary'` | Visual variant. |
| `size` | `BadgeSize` | `'md'` | Badge size. Use `'auto'` to fill the parent. |
| `pulse` | `boolean` | `false` | Adds a pulsing animation (for notifications). Supports boolean attribute usage. |
| `dot` | `boolean` | `false` | Renders a dot without content. Supports boolean attribute usage. |
| `max` | `number \| null` | `null` | Maximum number to display (shows `${max}+` when `content` is a number and exceeds max). |
| `bordered` | `boolean` | `false` | Adds a border around the badge (implemented as a box-shadow ring). Supports boolean attribute usage. |

### Behavior notes

- When `dot` is true, the badge renders without inner content.
- When `content` is a number and `max` is set, the displayed text becomes `${max}+` if `content > max`.

## CSS tokens used

The badge uses design tokens (CSS variables) for typography and colors, including:

- Typography: `--coar-body-small-bold-family`, `--coar-body-small-bold-weight`
- Colors: `--coar-background-accent-primary`, `--coar-background-neutral-tertiary`, `--coar-background-semantic-*-bold`, `--coar-text-on-bold`, `--coar-text-neutral-primary`
- Border ring: `--coar-background-neutral-primary`
