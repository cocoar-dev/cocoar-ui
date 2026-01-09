# @cocoar/ui

Complete Cocoar Design System package - all UI components, overlays, and menus in one convenient package.

## Installation

```bash
npm install @cocoar/ui
# or
pnpm add @cocoar/ui
```

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

For complete documentation, install the docs package:

```bash
npm install -D @cocoar/ui-docs
npx @cocoar/ui-docs init
```

## License

Apache-2.0
