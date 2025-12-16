export interface MarkdownPosition {
  readonly start: number;
  readonly end: number;
  readonly line: number;
  readonly column: number;
}

export type MarkdownNodeType =
  | 'heading'
  | 'paragraph'
  | 'blockquote'
  | 'list'
  | 'listItem'
  | 'codeBlock'
  | 'table'
  | 'tableRow'
  | 'tableCell'
  | 'thematicBreak'
  | 'lineBreak'
  | 'text'
  | 'emphasis'
  | 'strong'
  | 'strikethrough'
  | 'inlineCode'
  | 'link'
  | 'image'
  | 'unsupported';

export interface MarkdownNode {
  readonly id: string;
  readonly type: MarkdownNodeType | (string & {});
  readonly children?: readonly MarkdownNode[];
  readonly text?: string;
  readonly attrs?: Readonly<Record<string, unknown>>;
  readonly position?: MarkdownPosition;
}

export interface MarkdownDocument {
  readonly nodes: readonly MarkdownNode[];
  readonly meta?: {
    readonly sourceMap?: unknown;
  };
}

export type MarkdownTransform = (doc: MarkdownDocument) => MarkdownDocument;
