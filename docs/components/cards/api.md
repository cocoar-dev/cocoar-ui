# Card API

## Selector

```html
<coar-card></coar-card>
```

## Types

- `CardColor = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent'`
- `CardPadding = 'none' | 'sm' | 'md' | 'lg'`

## Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `elevated` | `boolean` | `false` | Adds elevation (box-shadow). Can be used as a boolean attribute (`<coar-card elevated>`). |
| `borderless` | `boolean` | `false` | Removes the border (sets border color to transparent). Can be used as a boolean attribute (`<coar-card borderless>`). |
| `color` | `CardColor` | `'neutral'` | Semantic color scheme (background + border). |
| `padding` | `CardPadding` | `'md'` | Internal padding size. |

## Content projection

| Slot | Selector | Notes |
| --- | --- | --- |
| Header | `[coar-card-header]` | Rendered before the default slot. Receives default bottom spacing. |
| Body | (default) | Rendered between header and footer. |
| Footer | `[coar-card-footer]` | Rendered after the default slot. Receives default top spacing. |

## Host / state classes

The host element always has `coar-card`.

State classes:

- `coar-card--elevated` when `elevated` is true
- `coar-card--borderless` when `borderless` is true
- Color classes: `coar-card--neutral`, `--success`, `--warning`, `--error`, `--info`, `--accent`
- Padding classes: `coar-card--padding-none`, `--padding-sm`, `--padding-md`, `--padding-lg`

## CSS tokens used

The component uses design tokens (CSS variables), including:

- Radius: `--coar-radius-s`
- Elevation: `--coar-elevation-medium`
- Padding: `--coar-spacing-s`, `--coar-spacing-m`, `--coar-spacing-l`
- Background/border tokens per color:
  - Neutral: `--coar-background-neutral-secondary`, `--coar-border-neutral-tertiary`
  - Success: `--coar-background-semantic-success-subtle`, `--coar-border-semantic-success-subtle`
  - Warning: `--coar-background-semantic-warning-subtle`, `--coar-border-semantic-warning-subtle`
  - Error: `--coar-background-semantic-error-subtle`, `--coar-border-semantic-error-subtle`
  - Info: `--coar-background-semantic-info-subtle`, `--coar-border-semantic-info-subtle`
  - Accent: `--coar-background-accent-secondary`, `--coar-border-accent-secondary`
