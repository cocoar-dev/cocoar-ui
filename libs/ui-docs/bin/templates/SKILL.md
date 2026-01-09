---
name: cocoar-component-usage
description: Access Cocoar Design System component documentation and examples. Use when developer needs component API, usage examples, or wants to implement UI patterns with Cocoar components.
---

# Cocoar Component Usage Skill

This skill helps you discover and use Cocoar Design System components by providing direct access to API documentation and usage examples.

## When to use this skill

- Developer asks about available Cocoar components
- Developer needs component API documentation (inputs, outputs, methods)
- Developer wants to see usage examples or implementation patterns
- Developer is implementing forms, overlays, menus, or other UI patterns
- Developer asks "how do I use [component]?"

## Discovery paths

The `@cocoar/ui-docs` package provides structured documentation:

- **Component catalog**: `node_modules/@cocoar/ui-docs/api/index.json`
  - Lists all available components with their package locations
- **API reference**: `node_modules/@cocoar/ui-docs/docs/libs/{package}/{ClassName}/api.md`
  - Complete API documentation (inputs, outputs, methods, properties)
- **Usage examples**: `node_modules/@cocoar/ui-docs/docs/libs/{package}/{ClassName}/overview.md`
  - Code examples, usage patterns, best practices

## Workflow

1. **Discover**: Check `api/index.json` to find available components
2. **Learn**: Read component-specific `api.md` for API details
3. **Implement**: Use examples from `overview.md` as templates
4. **Adapt**: Customize examples to match user's specific requirements

## Example packages

- `@cocoar/ui-components` - Core UI components (buttons, inputs, cards, etc.)
- `@cocoar/ui-menu` - Menu and navigation components
- `@cocoar/ui-overlay` - Overlay, popover, tooltip components
- `@cocoar/markdown-viewer` - Markdown rendering component

## Important notes

- Documentation structure is stable across versions
- Always prefer the installed documentation over assumptions
- Examples in `overview.md` show real-world usage patterns
- API documentation is auto-generated from TypeScript/JSDoc
