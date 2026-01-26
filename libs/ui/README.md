# @cocoar/ui

Complete Cocoar Design System package - all UI components, overlays, and menus in one convenient package.

## Installation

```bash
npm install @cocoar/ui
# or
pnpm add @cocoar/ui
# or
yarn add @cocoar/ui
```

### Important: pnpm Configuration

If you're using **pnpm**, you **must** add this to your `.npmrc` file in your project root:

```
public-hoist-pattern[]=@cocoar/*
```

This ensures that all Cocoar packages and their dependencies are properly hoisted and accessible.

**Why is this required?** pnpm uses strict isolated node_modules by default. The `@cocoar/ui` meta-package re-exports from sub-packages, which won't work without hoisting.

**npm and yarn users:** No configuration needed - works out of the box!

## What's Included

This meta-package includes:
- **@cocoar/ui-components** - Core UI components (buttons, inputs, cards, etc.)
- **@cocoar/ui-menu** - Menu and navigation components
- **@cocoar/ui-overlay** - Overlay service for tooltips, popovers, dialogs

## Usage

Import everything from a single package:

```typescript
import {
  CoarButtonComponent,
  CoarMenuComponent,
  CoarOverlayService
} from '@cocoar/ui';
```

## Advanced Usage

If you need granular control or want to minimize bundle size, you can install individual packages:

```bash
npm install @cocoar/ui-components  # Just the core components
npm install @cocoar/ui-menu        # Just the menu
```

## Documentation

See the [Cocoar Design System documentation](../../docs/) for complete API reference and usage guides.

## License

Apache-2.0
