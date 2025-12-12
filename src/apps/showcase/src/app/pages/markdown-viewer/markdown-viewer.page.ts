import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoarCodeBlockComponent, CoarDividerComponent } from '@cocoar/ui-components';
import { CoarMarkdownComponent } from '@cocoar/markdown-viewer';
import { parse, type MarkdownDocument } from '@cocoar/markdown-core';

@Component({
  selector: 'app-markdown-viewer',
  standalone: true,
  imports: [CommonModule, CoarMarkdownComponent, CoarCodeBlockComponent, CoarDividerComponent],
  templateUrl: './markdown-viewer.page.html',
  styleUrl: './markdown-viewer.page.css',
})
export class MarkdownViewerPage {
  private readonly http = inject(HttpClient);

  protected readonly markdownPath = '/docs/markdown-test.md';

  private readonly fallbackMarkdown = [
    '# Markdown Viewer',
    '',
    'This is a **viewer** for [Cocoar](https://example.com).',
    '',
    'Inline code: `const x = 1` and ~~strikethrough~~.',
    '',
    '- Unordered item 1',
    '- Unordered item 2',
    '',
    '1. Ordered item 1',
    '2. Ordered item 2',
    '',
    '- [x] Done',
    '- [ ] Todo',
    '',
    '> Blockquote example',
    '',
    '```ts',
    'export function add(a: number, b: number) {',
    '  return a + b;',
    '}',
    '```',
    '',
    '| A | B |',
    '|---|---|',
    '| 1 | 2 |',
    '',
    '<div>Raw HTML is disabled by default</div>',
  ].join('\n');

  protected readonly markdownSource = signal<string>(this.fallbackMarkdown);

  protected readonly doc = computed<MarkdownDocument>(() => parse(this.markdownSource()));

  public constructor() {
    this.http.get(this.markdownPath, { responseType: 'text' }).subscribe({
      next: (markdown) => this.markdownSource.set(markdown),
      error: () => this.markdownSource.set(this.fallbackMarkdown),
    });
  }

  protected readonly usageCode = [
    "import { CoarMarkdownComponent } from '@cocoar/markdown-viewer';",
    "import { parse, type MarkdownDocument } from '@cocoar/markdown-core';",
    '',
    'doc: MarkdownDocument = parse(\'# Hello\\n\\nThis is **Markdown**.\');',
    '',
    '<coar-markdown [doc]="doc" />',
  ].join('\n');
}
