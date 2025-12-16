# Note API

## Selector

`coar-note`

## Import

```ts
import { CoarNoteComponent } from '@cocoar/ui-components';
```

## Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | `NoteColor` (`'neutral' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'accent'`) | `'neutral'` | Semantic color variant for the note border and background. |
| `padding` | `NotePadding` (`'sm' \| 'md' \| 'lg'`) | `'md'` | Internal padding size. |

## Outputs

None.

## Content

The component renders projected content via `ng-content`.

## Styling

The note sets internal CSS variables based on the selected `color`:

- `--coar-note-bg` (background color)
- `--coar-note-border-color` (left border color)

The underlying values come from design tokens, for example:

- `--coar-background-semantic-info-subtle`
- `--coar-border-semantic-info-bold`
- `--coar-background-neutral-secondary`
- `--coar-border-neutral-secondary`
