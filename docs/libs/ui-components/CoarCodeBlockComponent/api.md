# CoarCodeBlockComponent

**Type:** Component

**Package:** `@cocoar/ui-components`

> 🤖 **Auto-generated** from TypeScript source code using Compodoc.
> Run `pnpm docs:all` to regenerate.

## Selector

```html
<coar-code-block></coar-code-block>
```

## Inputs

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `code` | `string` | - | ✅ | The code to display |
| `collapsed` | `boolean, unknown` | `false, { transform: booleanAttribute }` | - | Whether the code block starts collapsed |
| `collapsible` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Whether the code block can be collapsed |
| `language` | `string` | `'html'` | - | Language for syntax highlighting |
| `maxHeight` | `number` | `0` | - | Maximum height before scrolling (0 = no limit) |
| `showCopy` | `boolean, unknown` | `true, { transform: booleanAttribute }` | - | Whether to show the copy button |
| `showLineNumbers` | `boolean, unknown` | `false, {    transform: booleanAttribute,  }` | - | Whether to show line numbers |
| `title` | `string` | `''` | - | Title/label for the code block |
