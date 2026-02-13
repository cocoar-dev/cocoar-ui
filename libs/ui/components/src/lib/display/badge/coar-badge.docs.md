# Badge

Badges highlight status, counts, or short labels.

They can render numbers, text, or a dot-only indicator.

## Basic usage

```html
<coar-badge [content]="3" variant="error" />
```

## Variants

Use `variant` to communicate meaning.

```html
<coar-badge [content]="42" variant="primary" />
<coar-badge [content]="42" variant="secondary" />
<coar-badge [content]="42" variant="success" />
<coar-badge [content]="42" variant="warning" />
<coar-badge [content]="42" variant="error" />
<coar-badge [content]="42" variant="info" />
```

## Sizes

Use `size` to match the icon size scale.

```html
<coar-badge [content]="7" size="xs" />
<coar-badge [content]="7" size="s" />
<coar-badge [content]="7" size="m" />
<coar-badge [content]="7" size="l" />
<coar-badge [content]="7" size="xl" />
```

Use `size="auto"` to make the badge fill its parent.

## Dot mode

Set `dot` to render a dot-only status indicator.

```html
<coar-badge [dot]="true" variant="success" size="s" />
```

## Max value for counts

Use `max` to cap displayed numbers (e.g. `99+`). This is only applied when `content` is a number.

```html
<coar-badge [content]="150" [max]="99" variant="error" />
```

## Bordered badges

Use `bordered` when the badge overlaps other elements.

```html
<coar-badge [content]="3" variant="error" size="xs" [bordered]="true" />
```

## Pulse animation

Use `pulse` to draw attention (e.g. notifications).

```html
<coar-badge [content]="3" variant="error" [pulse]="true" />
```

## Accessibility notes

- The badge uses `role="status"`.
- An `aria-label` is set based on the displayed value; dot badges fall back to `"status indicator"`.
