# Note

The `coar-note` component is a callout container for highlighting important information, tips, warnings, or contextual messages.

It renders projected content with a colored left border and subtle background.

## Import

```ts
import { CoarNoteComponent } from '@cocoar/ui/components';
```

## Basic usage

```html
<coar-note>
  <strong>Note:</strong> General information for the user.
</coar-note>
```

## Color variants

Use `color` to select a semantic style:

- `neutral` (default)
- `info`
- `success`
- `warning`
- `error`
- `accent`

```html
<coar-note color="info">
  <strong>Tip:</strong> Here's a helpful tip.
</coar-note>

<coar-note color="warning">
  <strong>Warning:</strong> This action cannot be undone.
</coar-note>
```

## Padding

Use `padding` to change the internal spacing:

- `sm`
- `md` (default)
- `lg`

```html
<coar-note color="info" padding="sm">Compact note.</coar-note>
<coar-note color="info" padding="md">Standard note.</coar-note>
<coar-note color="info" padding="lg">Spacious note.</coar-note>
```

## Rich content

`coar-note` supports arbitrary projected HTML (headings, lists, etc.).

```html
<coar-note color="warning">
  <h4>Important Notice</h4>
  <p>This action will affect all users in your organization.</p>
  <ul>
    <li>All pending changes will be applied</li>
    <li>Users will be notified via email</li>
    <li>This cannot be reversed</li>
  </ul>
</coar-note>
```

## Accessibility

- Don’t rely on color alone—include explicit text like “Note:”, “Warning:”, etc.
- For time-sensitive or critical messages, consider adding `role="alert"` in the consuming template.
