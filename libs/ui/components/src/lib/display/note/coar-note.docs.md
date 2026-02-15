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

## Semantic variants

Use `variant` to select a semantic style:

- `neutral` (default)
- `info`
- `success`
- `warning`
- `error`
- `accent`

```html
<coar-note variant="info">
  <strong>Tip:</strong> Here's a helpful tip.
</coar-note>

<coar-note variant="warning">
  <strong>Warning:</strong> This action cannot be undone.
</coar-note>
```

## Padding

Use `padding` to change the internal spacing:

- `s`
- `m` (default)
- `l`

```html
<coar-note variant="info" padding="s">Compact note.</coar-note>
<coar-note variant="info" padding="m">Standard note.</coar-note>
<coar-note variant="info" padding="l">Spacious note.</coar-note>
```

## Rich content

`coar-note` supports arbitrary projected HTML (headings, lists, etc.).

```html
<coar-note variant="warning">
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
