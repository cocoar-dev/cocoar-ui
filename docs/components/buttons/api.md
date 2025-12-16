# Button API

## Selector

```html
<coar-button></coar-button>
```

## Types

- `ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'`
- `ButtonSize = 'xs' | 'sm' | 'md' | 'lg'`

## Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `ButtonVariant` | `'primary'` | Visual style variant. |
| `size` | `ButtonSize` | `'md'` | Button size. |
| `disabled` | `boolean` | `false` | Disables the button. The underlying `<button>` is also disabled. |
| `loading` | `boolean` | `false` | Shows a loading spinner and disables interaction. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native `<button>` type attribute. |
| `iconStart` | `CoreIconName \| undefined` | `undefined` | Icon displayed before the label. |
| `iconEnd` | `CoreIconName \| undefined` | `undefined` | Icon displayed after the label. |
| `fullWidth` | `boolean` | `false` | Makes the button take full container width. |

## Outputs

| Name | Type | Description |
| --- | --- | --- |
| `clicked` | `MouseEvent` | Emitted on click. Not emitted when `disabled` or `loading` is true. |

## Accessibility

- Renders a native `<button>` element.
- Applies `[disabled]` when `disabled || loading`.
- Sets `aria-disabled` and `aria-busy` for assistive technologies.

## Host / State Classes

- Host always has `coar-button-host`.
- Host gets `coar-button--full-width` when `fullWidth` is true.
- The inner `<button>` receives variant/size/state classes:
  - Variant: `coar-button--primary`, `--secondary`, `--tertiary`, `--danger`, `--ghost`
  - Size: `coar-button--xs`, `--sm`, `--md`, `--lg`
  - State: `coar-button--loading`, `coar-button--loading-overlay`, `coar-button--disabled`

## CSS Tokens Used

The component uses CSS variables for its styling, including:

- Radius: `--coar-radius-xs`
- Typography: `--coar-body-base-family`, `--coar-body-base-weight`
- Sizes: `--coar-component-*-height`, `--coar-component-*-font-size`
- Colors/borders:
  - `--coar-background-accent-primary`, `--coar-background-accent-hover`, `--coar-background-accent-active`
  - `--coar-background-neutral-secondary`, `--coar-background-neutral-tertiary`, `--coar-border-neutral-tertiary`
  - `--coar-background-accent-tertiary`, `--coar-background-accent-secondary`, `--coar-text-accent-primary`
  - `--coar-background-semantic-error-bold`, `--coar-text-on-bold`
  - `--coar-border-accent-primary`
