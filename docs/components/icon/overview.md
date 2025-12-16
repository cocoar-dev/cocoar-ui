# Icons

The `coar-icon` component renders an SVG icon from the built-in registry (`CORE_ICONS`) or from a customer namespace.

Icons inherit the current text color by default and can be sized using preset tokens or custom CSS size values.

## Import

```ts
import { CoarIconComponent } from '@cocoar/ui-components';
```

## Basic usage

```html
<coar-icon name="settings" />
<coar-icon name="user" />
<coar-icon name="check" />
```

## Sizes

Preset sizes are:

- `xs` (12px)
- `sm` (16px)
- `md` (20px, default)
- `lg` (24px)
- `xl` (32px)
- `auto` (fills the parent; typically sized by the parent’s font-size / box)

```html
<coar-icon name="settings" size="xs" />
<coar-icon name="settings" size="lg" />

<!-- Custom CSS size -->
<coar-icon name="settings" size="48px" />
```

## Color

`coar-icon` uses `currentColor` in the rendered SVG, so it inherits the surrounding text color unless overridden.

```html
<coar-icon name="check" color="green" />
<coar-icon name="settings" color="var(--coar-text-accent-primary)" />
```

## Rotation and animation

```html
<!-- Rotate (degrees) -->
<coar-icon name="caret-right" [rotate]="90" />

<!-- Animate rotation changes -->
<coar-icon name="caret-right" [rotate]="isExpanded ? 90 : 0" [rotateTransition]="200" />

<!-- Spin continuously -->
<coar-icon name="load" [spin]="true" />
```

## Customer icons

Use the `customer:` prefix to request an icon from the customer source:

```html
<coar-icon name="customer:invoicePaid" />
```

The underlying icon service requests these from `/api/icons/<key>.svg` and caches responses.

## Accessibility

`coar-icon` is purely visual by default. For accessible usage:

- Decorative icons: add `aria-hidden="true"`.
- Meaningful icons: provide an accessible name (for example via `aria-label` on the `coar-icon`, or by rendering a visible label next to it).

```html
<coar-icon name="check" aria-hidden="true" />
<coar-icon name="important" aria-label="Important" role="img" />
```
