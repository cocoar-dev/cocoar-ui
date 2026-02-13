# Code Block

The `coar-code-block` component displays formatted code with syntax highlighting.

It supports an optional header (title or language label), copy-to-clipboard, collapsing, and optional line numbers.

## Import

```ts
import { CoarCodeBlockComponent } from '@cocoar/ui/components';
```

## Basic usage

```html
<coar-code-block
  [code]="myCode"
  language="typescript"
  title="example.component.ts"
/>
```

## Syntax highlighting

`language` controls which Prism grammar is used.

Common values include:

- `typescript` (alias: `ts`)
- `javascript` (alias: `js`)
- `html` (mapped to Prism `markup`)
- `css`
- `scss`
- `json`
- `bash` (aliases: `sh`, `shell`)
- `xml`, `svg` (mapped to Prism `markup`)

If a grammar is not available, the code is still rendered (without highlighting).

## Collapsible

```html
<coar-code-block
  [code]="myCode"
  title="Advanced"
  [collapsible]="true"
  [collapsed]="true"
/>
```

## Copy button

By default, a copy button is shown. The component uses `navigator.clipboard.writeText(...)`.

```html
<coar-code-block [code]="myCode" [showCopy]="false" />
```

## Scrolling / max height

Use `maxHeight` (pixels) to constrain the block height and enable internal scrolling.

```html
<coar-code-block [code]="myLongCode" language="typescript" [maxHeight]="200" />
```

## Line numbers

```html
<coar-code-block [code]="myCode" [showLineNumbers]="true" />
```

## Accessibility

- When `collapsible` is enabled, the header toggle button updates `aria-expanded`.
- The copy button uses an `aria-label` that reflects the current feedback state.
