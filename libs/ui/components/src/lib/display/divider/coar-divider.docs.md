# Divider

The `coar-divider` component visually separates content sections.

It supports optional projected content (text, icons, etc.). When content is present, the divider line splits around it and can be aligned `left`, `center`, or `right`.

## Import

```ts
import { CoarDividerComponent } from '@cocoar/ui/components';
```

## Basic usage

```html
<!-- Simple divider -->
<coar-divider />

<!-- Divider with centered content -->
<coar-divider>OR</coar-divider>
```

## Alignment

```html
<!-- Center (default): lines on both sides -->
<coar-divider align="center">OR</coar-divider>

<!-- Left: content starts at left, line continues on the right -->
<coar-divider align="left">Section Title</coar-divider>

<!-- Right: line continues on the left, content ends at right -->
<coar-divider align="right">End</coar-divider>
```

## Variants

```html
<!-- Subtle (default) -->
<coar-divider variant="subtle" />

<!-- Strong -->
<coar-divider variant="strong" />
```

## Width and spacing

`width` is a percentage (0–100). `spacingTop` and `spacingBottom` are pixel values applied as vertical margins.

```html
<coar-divider [width]="100" />

<coar-divider [spacingTop]="16" [spacingBottom]="32" />

<coar-divider align="left" variant="strong" [spacingBottom]="16">
  Advanced Options
</coar-divider>
```

## Accessibility

- Renders with `role="separator"`.
- Sets `aria-orientation="horizontal"`.
