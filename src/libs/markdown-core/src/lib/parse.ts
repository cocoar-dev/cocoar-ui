import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type {
  Content,
  Heading,
  Link,
  List,
  ListItem,
  Root,
  Table,
  TableCell,
  TableRow,
} from 'mdast';

import type { MarkdownDocument, MarkdownNode, MarkdownPosition } from './types';
import { createNodeId } from './id';

export interface ParseMarkdownOptions {
  readonly gfm?: boolean;
}

export function parse(markdown: string, options: ParseMarkdownOptions = {}): MarkdownDocument {
  const processor = unified().use(remarkParse);

  if (options.gfm ?? true) {
    processor.use(remarkGfm);
  }

  const root = processor.parse(markdown) as Root;
  return fromMdastRoot(root);
}

function fromMdastRoot(root: Root): MarkdownDocument {
  const headingSlugger = createHeadingSlugger();
  const definitions = collectDefinitions(root);
  const nodes = root.children
    .map((child, index) => fromMdastNode(child, undefined, index, headingSlugger, definitions))
    .filter(isMarkdownNode);
  return { nodes };
}

type LinkDefinition = {
  readonly url: string;
  readonly title?: string;
};

type DefinitionMap = ReadonlyMap<string, LinkDefinition>;

function collectDefinitions(root: Root): DefinitionMap {
  const definitions = new Map<string, LinkDefinition>();

  for (const child of root.children) {
    if (child.type !== 'definition') continue;

    const def = child as unknown as { identifier?: unknown; url?: unknown; title?: unknown };
    const identifier = typeof def.identifier === 'string' ? def.identifier : '';
    const url = typeof def.url === 'string' ? def.url : '';
    const title = typeof def.title === 'string' ? def.title : undefined;

    if (identifier.length === 0 || url.length === 0) continue;
    definitions.set(identifier, { url, title });
  }

  return definitions;
}

function isMarkdownNode(node: MarkdownNode | null): node is MarkdownNode {
  return node !== null;
}

function fromMdastNode(
  node: Content,
  parentId: string | undefined,
  indexInParent: number,
  headingSlugger: HeadingSlugger,
  definitions: DefinitionMap
): MarkdownNode | null {
  const position = toPosition(node.position);
  const idSeed = `${node.type}|${position?.start ?? 'na'}-${position?.end ?? 'na'}|${parentId ?? 'root'}|${indexInParent}`;
  const id = createNodeId(idSeed);

  switch (node.type) {
    case 'heading':
      return fromHeading(node as Heading, id, position, headingSlugger, definitions);
    case 'paragraph':
      return {
        id,
        type: 'paragraph',
        position,
        children: (node.children ?? [])
          .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
          .filter(isMarkdownNode),
      };
    case 'blockquote':
      return {
        id,
        type: 'blockquote',
        position,
        children: (node.children ?? [])
          .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
          .filter(isMarkdownNode),
      };
    case 'list':
      return fromList(node as List, id, position, headingSlugger, definitions);
    case 'listItem':
      return fromListItem(node as ListItem, id, position, headingSlugger, definitions);
    case 'code':
      return {
        id,
        type: 'codeBlock',
        position,
        text: node.value,
        attrs: {
          language: node.lang ?? undefined,
          meta: node.meta ?? undefined,
        },
      };
    case 'inlineCode':
      return {
        id,
        type: 'inlineCode',
        position,
        text: node.value,
      };
    case 'break':
      return {
        id,
        type: 'lineBreak',
        position,
      };
    case 'text':
      return {
        id,
        type: 'text',
        position,
        text: node.value,
      };
    case 'emphasis':
      return {
        id,
        type: 'emphasis',
        position,
        children: (node.children ?? [])
          .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
          .filter(isMarkdownNode),
      };
    case 'strong':
      return {
        id,
        type: 'strong',
        position,
        children: (node.children ?? [])
          .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
          .filter(isMarkdownNode),
      };
    case 'delete':
      return {
        id,
        type: 'strikethrough',
        position,
        children: (node.children ?? [])
          .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
          .filter(isMarkdownNode),
      };
    case 'link':
      return fromLink(node as Link, id, position, headingSlugger, definitions);
    case 'linkReference': {
      const ref = node as unknown as { identifier?: unknown; title?: unknown; children?: unknown };
      const identifier = typeof ref.identifier === 'string' ? ref.identifier : '';
      const definition = identifier.length > 0 ? definitions.get(identifier) : undefined;

      if (!definition?.url) {
        return {
          id,
          type: 'text',
          position,
          text: mdastPlainText(node),
        };
      }

      const children = Array.isArray(ref.children) ? (ref.children as unknown[]) : [];
      return {
        id,
        type: 'link',
        position,
        attrs: {
          url: definition.url,
          title: definition.title ?? undefined,
        },
        children: children
          .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
          .filter(isMarkdownNode),
      };
    }
    case 'image': {
      const img = node as unknown as { url?: unknown; title?: unknown; alt?: unknown };
      const url = typeof img.url === 'string' ? img.url : '';
      const title = typeof img.title === 'string' ? img.title : undefined;
      const alt = typeof img.alt === 'string' ? img.alt : '';

      if (url.length === 0) {
        return {
          id,
          type: 'text',
          position,
          text: alt,
        };
      }

      return {
        id,
        type: 'image',
        position,
        attrs: {
          url,
          title,
          alt,
        },
      };
    }
    case 'imageReference': {
      const ref = node as unknown as { identifier?: unknown; alt?: unknown };
      const identifier = typeof ref.identifier === 'string' ? ref.identifier : '';
      const definition = identifier.length > 0 ? definitions.get(identifier) : undefined;
      const alt = typeof ref.alt === 'string' ? ref.alt : '';

      if (!definition?.url) {
        return {
          id,
          type: 'text',
          position,
          text: alt,
        };
      }

      return {
        id,
        type: 'image',
        position,
        attrs: {
          url: definition.url,
          title: definition.title ?? undefined,
          alt,
        },
      };
    }
    case 'thematicBreak':
      return {
        id,
        type: 'thematicBreak',
        position,
      };
    case 'table':
      return fromTable(node as Table, id, position, headingSlugger, definitions);
    case 'tableRow':
      return fromTableRow(node as TableRow, id, position, headingSlugger, definitions);
    case 'tableCell':
      return fromTableCell(node as TableCell, id, position, headingSlugger, definitions);
    // Reference-style definitions should not render as visible content.
    case 'definition':
      return null;
    // Footnotes are supported by remark-gfm but not rendered as interactive footnotes in v1.
    // Convert them to readable content instead of emitting unsupported placeholders.
    case 'footnoteReference': {
      const ref = node as unknown as { identifier?: unknown; label?: unknown };
      const identifier = typeof ref.identifier === 'string' ? ref.identifier : typeof ref.label === 'string' ? ref.label : '';
      const label = identifier.length > 0 ? identifier : '?';
      return {
        id,
        type: 'text',
        position,
        text: `[^${label}]`,
      };
    }
    case 'footnoteDefinition': {
      const def = node as unknown as { identifier?: unknown; label?: unknown; children?: unknown };
      const identifier = typeof def.identifier === 'string' ? def.identifier : typeof def.label === 'string' ? def.label : '';
      const label = identifier.length > 0 ? identifier : '?';

      const labelTextId = createNodeId(`${idSeed}|footnote-label-text`);
      const labelParagraphId = createNodeId(`${idSeed}|footnote-label-paragraph`);
      const labelParagraph: MarkdownNode = {
        id: labelParagraphId,
        type: 'paragraph',
        position,
        children: [
          {
            id: labelTextId,
            type: 'text',
            position,
            text: `[^${label}]: `,
          },
        ],
      };

      const children = Array.isArray(def.children) ? (def.children as unknown[]) : [];
      return {
        id,
        type: 'blockquote',
        position,
        children: [
          labelParagraph,
          ...children
            .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
            .filter(isMarkdownNode),
        ],
      };
    }
    // Raw HTML is intentionally unsupported in v1.
    case 'html':
      return {
        id,
        type: 'unsupported',
        position,
        attrs: { originalType: 'html' },
        text: node.value,
      };
    default:
      return {
        id,
        // Preserve the original type string for better diagnostics.
        type: 'unsupported',
        position,
        attrs: { originalType: node.type },
      };
  }
}

function fromHeading(
  node: Heading,
  id: string,
  position: MarkdownPosition | undefined,
  headingSlugger: HeadingSlugger,
  definitions: DefinitionMap
): MarkdownNode {
  const plainText = mdastPlainText(node);
  const anchor = plainText.length > 0 ? headingSlugger.slug(plainText) : undefined;

  return {
    id,
    type: 'heading',
    position,
    attrs: { depth: node.depth, anchor },
    children: (node.children ?? [])
      .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
      .filter(isMarkdownNode),
  };
}

function fromLink(
  node: Link,
  id: string,
  position: MarkdownPosition | undefined,
  headingSlugger: HeadingSlugger,
  definitions: DefinitionMap
): MarkdownNode {
  return {
    id,
    type: 'link',
    position,
    attrs: {
      url: node.url,
      title: node.title ?? undefined,
    },
    children: (node.children ?? [])
      .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
      .filter(isMarkdownNode),
  };
}

function fromList(
  node: List,
  id: string,
  position: MarkdownPosition | undefined,
  headingSlugger: HeadingSlugger,
  definitions: DefinitionMap
): MarkdownNode {
  return {
    id,
    type: 'list',
    position,
    attrs: {
      ordered: node.ordered ?? false,
      start: node.start ?? undefined,
      spread: node.spread ?? undefined,
    },
    children: (node.children ?? [])
      .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
      .filter(isMarkdownNode),
  };
}

function fromListItem(
  node: ListItem,
  id: string,
  position: MarkdownPosition | undefined,
  headingSlugger: HeadingSlugger,
  definitions: DefinitionMap
): MarkdownNode {
  return {
    id,
    type: 'listItem',
    position,
    attrs: {
      checked: node.checked ?? undefined,
      spread: node.spread ?? undefined,
    },
    children: (node.children ?? [])
      .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
      .filter(isMarkdownNode),
  };
}

function fromTable(
  node: Table,
  id: string,
  position: MarkdownPosition | undefined,
  headingSlugger: HeadingSlugger,
  definitions: DefinitionMap
): MarkdownNode {
  return {
    id,
    type: 'table',
    position,
    attrs: {
      align: node.align ?? undefined,
    },
    children: (node.children ?? [])
      .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
      .filter(isMarkdownNode),
  };
}

function fromTableRow(
  node: TableRow,
  id: string,
  position: MarkdownPosition | undefined,
  headingSlugger: HeadingSlugger,
  definitions: DefinitionMap
): MarkdownNode {
  return {
    id,
    type: 'tableRow',
    position,
    children: (node.children ?? [])
      .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
      .filter(isMarkdownNode),
  };
}

function fromTableCell(
  node: TableCell,
  id: string,
  position: MarkdownPosition | undefined,
  headingSlugger: HeadingSlugger,
  definitions: DefinitionMap
): MarkdownNode {
  return {
    id,
    type: 'tableCell',
    position,
    children: (node.children ?? [])
      .map((c, i) => fromMdastNode(c as Content, id, i, headingSlugger, definitions))
      .filter(isMarkdownNode),
  };
}

type HeadingSlugger = {
  slug: (value: string) => string;
};

function createHeadingSlugger(): HeadingSlugger {
  const counts = new Map<string, number>();

  return {
    slug(value: string): string {
      const base = slugifyHeading(value);
      const prev = counts.get(base) ?? 0;
      counts.set(base, prev + 1);
      return prev === 0 ? base : `${base}-${prev}`;
    },
  };
}

function slugifyHeading(value: string): string {
  const normalized = value.trim().toLowerCase();

  // Roughly match common GitHub-style anchors for typical docs.
  // - Keep letters/numbers/spaces/hyphens
  // - Convert whitespace to '-'
  // - Collapse duplicate '-'
  const stripped = normalized
    .replace(/[^\p{L}\p{N}\s-]+/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return stripped.length > 0 ? stripped : 'section';
}

function mdastPlainText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';

  const anyNode = node as { type?: unknown; value?: unknown; children?: unknown };
  if (typeof anyNode.type !== 'string') return '';

  if (anyNode.type === 'text' || anyNode.type === 'inlineCode') {
    return typeof anyNode.value === 'string' ? anyNode.value : '';
  }

  const children = Array.isArray(anyNode.children) ? (anyNode.children as unknown[]) : [];
  return children.map((c) => mdastPlainText(c)).join('');
}

function toPosition(position: unknown): MarkdownPosition | undefined {
  const p = position as
    | {
        start?: { offset?: number; line?: number; column?: number };
        end?: { offset?: number; line?: number; column?: number };
      }
    | undefined;

  if (!p?.start || !p?.end) {
    return undefined;
  }

  const startOffset = p.start.offset;
  const endOffset = p.end.offset;
  const line = p.start.line;
  const column = p.start.column;

  if (
    typeof startOffset !== 'number' ||
    typeof endOffset !== 'number' ||
    typeof line !== 'number' ||
    typeof column !== 'number'
  ) {
    return undefined;
  }

  return {
    start: startOffset,
    end: endOffset,
    line,
    column,
  };
}
