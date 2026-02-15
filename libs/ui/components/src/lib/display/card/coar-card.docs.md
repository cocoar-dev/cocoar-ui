# Card

Cards are container components for grouping related content.

## Basic usage

```html
<coar-card>
  <h3>Card title</h3>
  <p>Card content goes here.</p>
</coar-card>
```

## Variants

Cards support two boolean appearance modifiers:

- `elevated` adds depth via elevation.
- `borderless` removes the border.

```html
<coar-card>Default (border + background)</coar-card>
<coar-card borderless>Borderless</coar-card>
<coar-card elevated>Elevated</coar-card>
<coar-card elevated borderless>Elevated + borderless</coar-card>
```

## Semantic variants

Use `variant` for contextual backgrounds and borders.

```html
<coar-card variant="neutral">Neutral (default)</coar-card>
<coar-card variant="success">Success</coar-card>
<coar-card variant="warning">Warning</coar-card>
<coar-card variant="error">Error</coar-card>
<coar-card variant="info">Info</coar-card>
<coar-card variant="accent">Accent</coar-card>
```

## Padding

Use `padding` to control the internal spacing.

```html
<coar-card padding="none">No padding</coar-card>
<coar-card padding="s">Small padding</coar-card>
<coar-card padding="m">Medium padding (default)</coar-card>
<coar-card padding="l">Large padding</coar-card>
```

## Card sections (header / footer)

Cards support named content slots via attribute selectors.

- Add `[coar-card-header]` for content at the top.
- Add `[coar-card-footer]` for content at the bottom.

```html
<coar-card>
  <div coar-card-header>
    <h3>Header</h3>
    <p>Optional subtitle</p>
  </div>

  <p>Main content</p>

  <div coar-card-footer>
    <coar-button variant="primary" size="s">Primary</coar-button>
    <coar-button variant="secondary" size="s">Secondary</coar-button>
  </div>
</coar-card>
```

Note: the component adds default spacing between header/body and body/footer.

## Accessibility

`coar-card` is a visual container with no implicit ARIA role.

- Use appropriate semantics inside the card (headings, lists, buttons, links).
- If the entire card should be interactive, use a semantic interactive element (e.g. an `<a>` or `<button>`) or add an appropriate role and keyboard handling.
