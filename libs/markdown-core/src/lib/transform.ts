import type { MarkdownDocument, MarkdownTransform } from './types';

export function transform(doc: MarkdownDocument, ...transforms: readonly MarkdownTransform[]): MarkdownDocument {
  return transforms.reduce((current, applyTransform) => applyTransform(current), doc);
}
