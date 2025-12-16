# Markdown Viewer API

## Selector

`coar-markdown`

## Import

```ts
import { CoarMarkdownComponent } from '@cocoar/markdown-viewer';
```

## Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `doc` | `MarkdownDocument` | required | Parsed markdown document (use `parse()` from `@cocoar/markdown-core`). |

## Outputs

None.

## Styling

The component exposes theme hooks via CSS variables (override from outside if needed):

- `--coar-markdown-text`
- `--coar-markdown-link`
- `--coar-markdown-muted-text`
- `--coar-markdown-border`
- `--coar-markdown-surface`
- `--coar-markdown-surface-muted`
- `--coar-markdown-radius`
- `--coar-markdown-space-1`
- `--coar-markdown-space-2`
- `--coar-markdown-heading-block-start`

## Security

- External links get `rel="noopener noreferrer"`.
- Fragment-only links (`#...`) are rewritten to stay on the current route.
