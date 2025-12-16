import { describe, expect, it } from 'vitest';
import { parse } from './parse';
import { serialize } from './serialize';

describe('markdown-core parse/serialize', () => {
  it('parses basic markdown with positions and stable ids', () => {
    const doc = parse('# Title\n\nHello **world**.');
    expect(doc.nodes.length).toBeGreaterThan(0);
    expect(doc.nodes[0]?.id).toBeTruthy();
    expect(doc.nodes[0]?.position).toBeTruthy();
  });

  it('generates stable heading anchors for in-document links', () => {
    const doc = parse('# Title\n\n## Features\n\n## Features\n');
    const headings = doc.nodes.filter((n) => n.type === 'heading');
    expect(headings.length).toBe(3);
    expect(headings[0]?.attrs?.['anchor']).toBe('title');
    expect(headings[1]?.attrs?.['anchor']).toBe('features');
    expect(headings[2]?.attrs?.['anchor']).toBe('features-1');
  });

  it('round-trips GFM table content', () => {
    const input = `| A | B |\n|---|---|\n| 1 | 2 |\n`;
    const doc = parse(input);
    const output = serialize(doc);
    expect(output).toContain('| A | B |');
  });

  it('parses hard line breaks (two trailing spaces) as lineBreak nodes', () => {
    const doc = parse('Hello  \nWorld');
    expect(doc.nodes[0]?.type).toBe('paragraph');

    const children = doc.nodes[0]?.children ?? [];
    expect(children.map((c) => c.type)).toEqual(['text', 'lineBreak', 'text']);
  });

  it('resolves reference-style links and ignores definition nodes', () => {
    const input = ['[link text][ref]', '', '[ref]: https://example.com "Title"', ''].join('\n');
    const doc = parse(input);

    // Only the visible paragraph should remain.
    expect(doc.nodes.map((n) => n.type)).toEqual(['paragraph']);

    const paraChildren = doc.nodes[0]?.children ?? [];
    expect(paraChildren[0]?.type).toBe('link');
    expect(paraChildren[0]?.attrs?.['url']).toBe('https://example.com');
    expect(paraChildren[0]?.attrs?.['title']).toBe('Title');
  });

  it('resolves reference-style images', () => {
    const input = ['![Alt text][img]', '', '[img]: https://example.com/image.png "Image"', ''].join('\n');
    const doc = parse(input);

    expect(doc.nodes.map((n) => n.type)).toEqual(['paragraph']);
    const paraChildren = doc.nodes[0]?.children ?? [];

    expect(paraChildren[0]?.type).toBe('image');
    expect(paraChildren[0]?.attrs?.['url']).toBe('https://example.com/image.png');
    expect(paraChildren[0]?.attrs?.['alt']).toBe('Alt text');
    expect(paraChildren[0]?.attrs?.['title']).toBe('Image');
  });
});
