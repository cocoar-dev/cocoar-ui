import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';

import type { MarkdownDocument, MarkdownNode } from './types';

export interface SerializeMarkdownOptions {
  readonly gfm?: boolean;
}

export function serialize(doc: MarkdownDocument, options: SerializeMarkdownOptions = {}): string {
  const mdast = toMdastRoot(doc);
  const processor = unified().use(remarkStringify);

  if (options.gfm ?? true) {
    processor.use(remarkGfm);
  }

  return String(processor.stringify(mdast));
}

function toMdastRoot(doc: MarkdownDocument): Root {
  return {
    type: 'root',
    children: doc.nodes.map((n) => toMdastNode(n) as any),
  };
}

function toMdastNode(node: MarkdownNode): unknown {
  switch (node.type) {
    case 'heading':
      return {
        type: 'heading',
        depth: clampHeadingDepth(node.attrs?.['depth']),
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'paragraph':
      return {
        type: 'paragraph',
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'blockquote':
      return {
        type: 'blockquote',
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'list':
      return {
        type: 'list',
        ordered: Boolean(node.attrs?.['ordered']),
        start: typeof node.attrs?.['start'] === 'number' ? node.attrs['start'] : undefined,
        spread: typeof node.attrs?.['spread'] === 'boolean' ? node.attrs['spread'] : undefined,
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'listItem':
      return {
        type: 'listItem',
        checked: typeof node.attrs?.['checked'] === 'boolean' ? node.attrs['checked'] : null,
        spread: typeof node.attrs?.['spread'] === 'boolean' ? node.attrs['spread'] : undefined,
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'codeBlock':
      return {
        type: 'code',
        lang: typeof node.attrs?.['language'] === 'string' ? node.attrs['language'] : null,
        meta: typeof node.attrs?.['meta'] === 'string' ? node.attrs['meta'] : null,
        value: node.text ?? '',
      };
    case 'inlineCode':
      return {
        type: 'inlineCode',
        value: node.text ?? '',
      };
    case 'text':
      return {
        type: 'text',
        value: node.text ?? '',
      };
    case 'emphasis':
      return {
        type: 'emphasis',
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'strong':
      return {
        type: 'strong',
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'strikethrough':
      return {
        type: 'delete',
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'link':
      return {
        type: 'link',
        url: typeof node.attrs?.['url'] === 'string' ? node.attrs['url'] : '',
        title: typeof node.attrs?.['title'] === 'string' ? node.attrs['title'] : null,
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'image':
      return {
        type: 'image',
        url: typeof node.attrs?.['url'] === 'string' ? node.attrs['url'] : '',
        title: typeof node.attrs?.['title'] === 'string' ? node.attrs['title'] : null,
        alt: typeof node.attrs?.['alt'] === 'string' ? node.attrs['alt'] : '',
      };
    case 'thematicBreak':
      return {
        type: 'thematicBreak',
      };
    case 'lineBreak':
      return {
        type: 'break',
      };
    case 'table':
      return {
        type: 'table',
        align: Array.isArray(node.attrs?.['align']) ? (node.attrs?.['align'] as any) : undefined,
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'tableRow':
      return {
        type: 'tableRow',
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'tableCell':
      return {
        type: 'tableCell',
        children: (node.children ?? []).map(toMdastNode),
      };
    case 'unsupported':
      return {
        type: 'html',
        value: `<!-- Unsupported node: ${String(node.attrs?.['originalType'] ?? 'unknown')} -->`,
      };
    default:
      return {
        type: 'html',
        value: `<!-- Unsupported node: ${String(node.type)} -->`,
      };
  }
}

function clampHeadingDepth(depth: unknown): 1 | 2 | 3 | 4 | 5 | 6 {
  const value = typeof depth === 'number' ? Math.trunc(depth) : 1;
  if (value <= 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  if (value === 4) return 4;
  if (value === 5) return 5;
  return 6;
}
