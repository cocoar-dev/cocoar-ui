# Button

Buttons trigger actions and communicate what will happen when pressed.

## Variants

Choose a variant based on importance and context.

```html
<coar-button variant="primary">Primary</coar-button>
<coar-button variant="secondary">Secondary</coar-button>
<coar-button variant="tertiary">Tertiary</coar-button>
<coar-button variant="danger">Danger</coar-button>
<coar-button variant="ghost">Ghost</coar-button>
```

## Sizes

Use `size` to match the common component size system.

```html
<coar-button size="xs">Extra Small</coar-button>
<coar-button size="s">Small</coar-button>
<coar-button size="m">Medium (default)</coar-button>
<coar-button size="l">Large</coar-button>
```

## Icons

Use `iconStart` and/or `iconEnd` to add icons.

```html
<coar-button iconStart="add">Add Item</coar-button>
<coar-button iconEnd="caret-right">Next</coar-button>
<coar-button iconStart="clipboard" iconEnd="check">Download</coar-button>
```

## Loading

Use `loading` to indicate an async action is in progress.

- With an icon: the spinner replaces the icon position and the text stays visible.
- Without an icon: the spinner is centered and the text is hidden (opacity) to avoid layout shifts.

```html
<!-- With icon: spinner replaces icon position -->
<coar-button iconStart="check" [loading]="isSaving">Save Changes</coar-button>

<!-- Without icon: centered spinner, text hidden -->
<coar-button [loading]="isSubmitting">Submit</coar-button>
```

## Disabled

Disable buttons when the action is not available.

```html
<coar-button [disabled]="true">Disabled</coar-button>
```

## Full Width

Use `fullWidth` to make the button fill its container.

```html
<coar-button [fullWidth]="true">Full Width</coar-button>
```

## Events

Use `clicked` to react to button clicks.

```html
<coar-button (clicked)="handleClick($event)">Click me</coar-button>
```

Note: `clicked` is not emitted while `disabled` or `loading` is true.
