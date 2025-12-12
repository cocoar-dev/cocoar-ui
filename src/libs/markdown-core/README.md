# @cocoar/markdown-core

Framework-agnostic Markdown core for Cocoar.

Provides a COCOAR-owned AST plus `parse()` / `serialize()` / `transform()`.

## Usage

```ts
import { parse, serialize } from '@cocoar/markdown-core';

const doc = parse('# Hello\n\nThis is **Markdown**.');
const markdown = serialize(doc);
```

Notes:
- GFM parsing/serialization is enabled by default.
- Raw HTML nodes are mapped to `unsupported`.

## Nx targets

- `nx test markdown-core`
- `nx build markdown-core`
