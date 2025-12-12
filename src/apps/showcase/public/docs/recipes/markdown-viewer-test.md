# Markdown Viewer Test

This document is used to validate the rendering of `@cocoar/markdown-viewer` in the showcase.

## Links

- External link: https://github.com/
- Heading link: [Go to “Lists”](#lists)

## Inline formatting

- Bold: **bold text**
- Italic: *italic text*
- Strikethrough: ~~struck~~
- Inline code: `const value = 123`

## Lists

- Unordered item 1
- Unordered item 2
  - Nested item 2.1
  - Nested item 2.2

1. Ordered item 1
2. Ordered item 2
   1. Nested ordered 2.1
   2. Nested ordered 2.2

### Task list

- [x] Done
- [ ] Todo

## Blockquote

> This is a blockquote.
> It can span multiple lines.

## Line breaks

Hard break after this sentence.  
Next line should be separated with a `<br>`.

## Code blocks

```ts
export function add(a: number, b: number) {
  return a + b;
}
```

```json
{
  "name": "cocoar",
  "type": "design-system"
}
```

## Table

| A | B |
|---|---|
| 1 | 2 |
| 3 | 4 |
