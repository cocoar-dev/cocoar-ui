# CoarNoteComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Description

A callout/note component for highlighting information.
Features a colored left border and subtle background.
Use for tips, warnings, important information, or behavioral notes.
**Example :**`<coar-note color="info">
  <strong>Note:</strong> This is important information.
</coar-note>

<coar-note color="warning" padding="lg">
  <h4>Warning</h4>
  <p>Be careful with this action.</p>
</coar-note>`

## Selector

```html
<coar-note></coar-note>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `color` | `NoteColor` | `'neutral'` | - | Note color scheme. Determines the left border color and background tint. |
| `padding` | `NotePadding` | `'md'` | - | Note padding size. |
