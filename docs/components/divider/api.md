# Divider API

## Selector

`coar-divider`

## Import

```ts
import { CoarDividerComponent } from '@cocoar/ui-components';
```

## Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `align` | `DividerAlign` (`'left' \| 'center' \| 'right'`) | `'center'` | Content alignment when projected content is provided. |
| `variant` | `DividerVariant` (`'subtle' \| 'strong'`) | `'subtle'` | Visual style of the divider line. |
| `width` | `number` | `90` | Divider width as percentage (0–100). |
| `spacingTop` | `number` | `0` | Spacing above the divider in pixels. |
| `spacingBottom` | `number` | `0` | Spacing below the divider in pixels. |

## Content

The component supports content projection via `ng-content`.

```html
<coar-divider>OR</coar-divider>
```

## Outputs

None.

## Styling

The divider uses design tokens (CSS variables) for styling:

- `--coar-border-neutral-tertiary` (line color)
- `--coar-text-neutral-secondary` (content color)
- `--coar-body-small-base-size` (content font size)
- `--coar-spacing-m` (horizontal padding around content)
