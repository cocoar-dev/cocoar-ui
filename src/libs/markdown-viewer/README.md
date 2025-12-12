# @cocoar/markdown-viewer

Angular Markdown viewer for Cocoar.

## Usage

This component renders a pre-parsed document:

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
	doc: MarkdownDocument = parse('Hello **world**');
}
```

Link rendering opens external `http(s)` links in a new tab with `rel="noopener noreferrer"`.
In-document anchors (e.g. `#overview`) and other non-external links do not force a new tab.

## Nx targets

- `nx test markdown-viewer`
- `nx build markdown-viewer`
