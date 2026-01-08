# API Documentation Structure

This document describes the automated API documentation system for the Cocoar Design System.

## Overview

All API documentation is **auto-generated** from TypeScript source code using [Compodoc](https://compodoc.app/).

Two formats are produced:
1. **JSON** (machine-readable, for AI assistants and tools)
2. **Markdown** (human-readable, for developers)

## Folder Structure

### JSON API Files

Location: `libs/ui-docs/api/`

```
libs/ui-docs/api/
├── index.json                    # Package discovery manifest
├── ui-components.json            # @cocoar/ui-components API
├── ui-menu.json                  # @cocoar/ui-menu API
├── ui-overlay.json               # @cocoar/ui-overlay API
├── markdown-viewer.json          # @cocoar/markdown-viewer API
├── logging.json                  # @cocoar/logging API
└── logging-abstractions.json     # @cocoar/logging-abstractions API
```

### Markdown API Files

Location: `docs/libs/{package}/{ClassName}/`

```
docs/
└── libs/
    ├── ui-components/
    │   ├── CoarButtonComponent/
    │   │   └── api.md
    │   ├── CoarTextInputComponent/
    │   │   └── api.md
    │   ├── CoarIconService/
    │   │   └── api.md
    │   └── ...
    ├── ui-menu/
    │   ├── CoarMenuComponent/
    │   │   └── api.md
    │   └── ...
    ├── ui-overlay/
    │   └── CoarOverlayService/
    │       └── api.md
    └── markdown-viewer/
        └── CoarMarkdownComponent/
            └── api.md
```

## Key Features

### 1. Mirrors Package Structure

The folder structure directly mirrors the actual npm packages:
- `docs/libs/ui-components/` ← `@cocoar/ui-components`
- `docs/libs/ui-menu/` ← `@cocoar/ui-menu`
- `docs/libs/ui-overlay/` ← `@cocoar/ui-overlay`

### 2. One Folder Per Class

Each component, directive, service, or pipe gets its own folder:
- `CoarButtonComponent/api.md`
- `CoarMenuComponent/api.md`
- `CoarOverlayService/api.md`

### 3. Fully Automated

- Run `pnpm docs:all` to regenerate everything
- No manual markdown files to maintain
- New components automatically get API docs
- Stays in sync with TypeScript source code

### 4. Scalable

Adding a new component:
1. Write TypeScript code with JSDoc comments
2. Run `pnpm docs:all`
3. API docs are automatically created at `docs/libs/{package}/{ComponentName}/api.md`

### 5. AI-Friendly

- JSON files optimized for AI assistants (OpenAI, Claude, Copilot)
- `index.json` provides package discovery
- Structured format enables precise queries
- Markdown files are also AI-readable

## Generating Documentation

### Full Regeneration

```bash
pnpm docs:all
```

Runs both JSON and markdown generation.

### Individual Steps

Generate JSON only:
```bash
pnpm docs:api
```

Generate markdown only (requires JSON):
```bash
pnpm docs:api:markdown
```

## Markdown Format

Each `api.md` file includes:

### For Components

- **Selector** - HTML element name
- **Package** - Which npm package exports it
- **Description** - JSDoc description
- **Inputs** - Properties with types, defaults, required status
- **Outputs** - Events with types
- **Methods** - Public methods with parameters and return types
- **Host Bindings** - CSS classes and attributes

Example: [`docs/libs/ui-components/CoarButtonComponent/api.md`](../docs/libs/ui-components/CoarButtonComponent/api.md)

### For Services

- **Package** - Which npm package exports it
- **Description** - JSDoc description
- **Properties** - Public properties with types
- **Methods** - Public methods with parameters and return types

Example: [`docs/libs/ui-overlay/CoarOverlayService/api.md`](../docs/libs/ui-overlay/CoarOverlayService/api.md)

### For Directives

- **Selector** - Attribute selector
- **Package** - Which npm package exports it
- **Description** - JSDoc description
- **Inputs** - Properties with types, defaults, required status
- **Outputs** - Events with types

### For Pipes

- **Usage** - Template syntax
- **Package** - Which npm package exports it
- **Description** - JSDoc description

## JSON Format

Compodoc's JSON output includes:

```json
{
  "components": [
    {
      "name": "CoarButtonComponent",
      "selector": "coar-button",
      "description": "...",
      "inputsClass": [...],
      "outputsClass": [...],
      "methods": [...]
    }
  ],
  "directives": [...],
  "injectables": [...],
  "pipes": [...]
}
```

See Compodoc's [JSON output format](https://compodoc.app/guides/usage.html#json-output) for full schema.

## Configuration

### Compodoc Config

Each library has a `.compodocrc.json` file:

```json
{
  "tsconfig": "./tsconfig.lib.json",
  "output": "./compodoc-output",
  "exportFormat": "json",
  "disableDependencies": true,
  "disableGraph": true,
  "disableCoverage": true
}
```

### Build Integration

The `@cocoar/ui-docs` package includes all generated docs in its build output:

- `libs/ui-docs/project.json` copies `docs/` and `api/` folders
- Published package includes both JSON and markdown
- Consumers get documentation alongside code

## Writing Good Documentation

### JSDoc Comments

Add JSDoc comments to your TypeScript code:

```typescript
/**
 * A reusable button component with multiple variants
 *
 * @example
 * ```html
 * <coar-button variant="primary">
 *   Click Me
 * </coar-button>
 * ```
 */
@Component({
  selector: 'coar-button',
  // ...
})
export class CoarButtonComponent {
  /**
   * Button visual variant
   *
   * Available variants: primary, secondary, tertiary, danger, success
   */
  @Input() variant: ButtonVariant = 'primary';
}
```

See [docs/writing-component-docs.md](../docs/writing-component-docs.md) for detailed JSDoc guidelines.

## AI Assistant Usage

AI assistants can use the JSON files for precise queries:

```
Read libs/ui-docs/api/ui-components.json to find all button components
```

Or the markdown for human-readable documentation:

```
Show me the API docs for CoarButtonComponent
```

The `libs/ui-docs/AGENTS.md` file provides AI-specific guidance.

## Maintenance

### When to Regenerate

Run `pnpm docs:all` when:
- Adding new components/services
- Changing public APIs (inputs, outputs, methods)
- Updating JSDoc comments
- Before committing API changes
- Before releasing new versions

### What's Auto-Generated

**Never manually edit:**
- All files in `libs/ui-docs/api/`
- All files in `docs/libs/*/*/api.md`

These are completely regenerated on each run.

### What's Manual

**Safe to edit:**
- Overview documentation in `docs/components/`
- Guides in `docs/consuming/`
- Reference docs in `docs/reference/` (except `*.api.json`)
- README files

## Troubleshooting

### Script fails with "Module not found"

Ensure Compodoc is installed:
```bash
pnpm install
```

### No JSON files generated

Check library `.compodocrc.json` files exist:
```bash
ls libs/*/.compodocrc.json
```

### Markdown generation fails

Ensure JSON files exist first:
```bash
pnpm docs:api
pnpm docs:api:markdown
```

### Missing components in output

Check if component is exported from library `index.ts`:
```typescript
export * from './lib/my-component/my-component.component';
```

## Related Files

- `libs/ui-docs/AGENTS.md` - AI assistant entry point
- `libs/ui-docs/COMPODOC-SETUP.md` - Compodoc setup guide
- `docs/writing-component-docs.md` - JSDoc writing guide
- `scripts/docs/generate-compodoc.mjs` - JSON generation script
- `scripts/docs/generate-api-markdown.mjs` - Markdown generation script

---

**Version:** 1.0.0
**Last Updated:** January 2025
