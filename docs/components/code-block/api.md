# Code Block API

## Selector

`coar-code-block`

## Import

```ts
import { CoarCodeBlockComponent } from '@cocoar/ui-components';
```

## Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `code` | `string` | required | The code to display. |
| `language` | `string` | `'html'` | Language used for syntax highlighting and (when no `title` is provided) the header label. |
| `title` | `string` | `''` | Optional title shown in the header (replaces the language label). |
| `collapsible` | `boolean` | `true` | Whether the code block can be collapsed/expanded. |
| `collapsed` | `boolean` | `false` | Whether the code block starts collapsed. |
| `showCopy` | `boolean` | `true` | Whether to show the copy-to-clipboard button. |
| `showLineNumbers` | `boolean` | `false` | Whether to render line numbers. |
| `maxHeight` | `number` | `0` | Maximum height (px). Use `0` for no limit. |

## Outputs

None.

## Styling

The component is styled via CSS variables (design tokens). Common tokens include:

- `--coar-code-block-bg`
- `--coar-code-block-border`
- `--coar-code-block-header-bg`
- `--coar-code-block-text`
- `--coar-code-block-text-muted`

Prism token colors also come from CSS variables, for example:

- `--coar-code-block-comment`
- `--coar-code-block-keyword`
- `--coar-code-block-string`
- `--coar-code-block-number`
