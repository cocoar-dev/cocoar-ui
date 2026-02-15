# Tag

Tags are compact labels for categorizing, labeling, or marking content.

Compared to badges (counts / status dots), tags are designed for keywords/labels and can be interactive (closable).

## Basic usage

```html
<coar-tag>Default</coar-tag>
<coar-tag variant="success">Published</coar-tag>
<coar-tag variant="warning">Draft</coar-tag>
```

## Variants

Tags support semantic variants.

```html
<coar-tag variant="neutral">Neutral</coar-tag>
<coar-tag variant="success">Success</coar-tag>
<coar-tag variant="warning">Warning</coar-tag>
<coar-tag variant="error">Error</coar-tag>
<coar-tag variant="info">Info</coar-tag>
<coar-tag variant="accent">Accent</coar-tag>
```

## Sizes

```html
<coar-tag size="s">Small</coar-tag>
<coar-tag size="m">Medium</coar-tag>
<coar-tag size="l">Large</coar-tag>
```

## Elevated and borderless

```html
<coar-tag elevated>Elevated</coar-tag>
<coar-tag borderless>Borderless</coar-tag>
```

## Closable tags

Set `closable` to show a close button and listen for `(closed)`.

```html
<coar-tag closable (closed)="remove('Angular')">Angular</coar-tag>
```

## Accessibility notes

- The close button is a real `<button type="button">` with `aria-label="Remove tag"`.
- The close action stops event propagation, so consumers can attach click handlers on parent containers if needed.
