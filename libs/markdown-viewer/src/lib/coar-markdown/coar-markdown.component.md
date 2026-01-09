# Markdown Viewer

The `coar-markdown` component renders a pre-parsed `MarkdownDocument` from `@cocoar/markdown-core`.

This avoids rendering raw HTML strings. Instead, the viewer renders the parsed node tree.

## Import

```ts
import { CoarMarkdownComponent } from '@cocoar/markdown-viewer';
import { parse, type MarkdownDocument } from '@cocoar/markdown-core';
```

## Basic usage

```ts
import { Component } from '@angular/core';
import { CoarMarkdownComponent } from '@cocoar/markdown-viewer';
import { parse, type MarkdownDocument } from '@cocoar/markdown-core';

@Component({
  standalone: true,
  imports: [CoarMarkdownComponent],
  template: `<coar-markdown [doc]="doc" />`,
})
export class ExampleComponent {
  doc: MarkdownDocument = parse('# Hello\n\nThis is **Markdown**.');
}
```

## Supported content

`coar-markdown` renders common Markdown features, including:

- Headings (`h1`–`h6`) with optional anchors
- Paragraphs and inline formatting (strong/emphasis/strikethrough/inline code)
- Lists (ordered/unordered), including task list items
- Blockquotes
- Thematic breaks (`---`)
- Tables
- Fenced code blocks

Code blocks are rendered using `coar-code-block` from `@cocoar/ui-components`.
Tables are rendered using `coar-table` from `@cocoar/ui-components`.

## Link behavior

- External `http(s)` links open in a new tab (`target="_blank"`) and add `rel="noopener noreferrer"`.
- Fragment-only links like `#section` are kept on the current route (to avoid navigating to the app root).
