# Coar Design System

> A design system and Angular component library built on CSS custom properties.

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

## What is Coar?

Coar is a design system for Angular applications. It provides 40+ production-ready UI components, a full set of design tokens as CSS variables, and a showcase app for browsing them interactively.

**Key principles:**

- **Framework-pure** — All styling uses CSS custom properties (`--coar-*`). No Tailwind, no global CSS.
- **Angular-native** — Built with Angular 21 signals, standalone components, and `ControlValueAccessor` for forms.
- **Token-driven** — Colors, spacing, radii, and typography are all design tokens. Swap the token layer to re-theme.

## Components

| Category | Components |
|----------|------------|
| **Display** | Button, Badge, Tag, Card, Note, Divider, Table, Label, Icon, Avatar, Code Block, Progress Bar, Spinner, Link |
| **Forms** | Text Input, Number Input, Password Input, Checkbox, Radio, Select (single, multi, tag), Switch |
| **Navigation** | Tabs, Sidebar, Breadcrumb, Pagination, Navbar |
| **Overlay** | Popover, Tooltip, Popconfirm, Dialog, Toast |
| **Date & Time** | Date Picker, Date-Time Picker, Zoned Date-Time Picker, Time Picker, Scrollable Calendar, Mini Calendar, Month List |
| **Menu** | Context Menu, Menu Bar |

All form components support Angular Reactive Forms via `ControlValueAccessor`.

## Install

```bash
npm install @cocoar/ui
```

## Quick Start

1. Import the component:

```typescript
import { CoarButtonComponent } from '@cocoar/ui/components';

@Component({
  selector: 'app-root',
  imports: [CoarButtonComponent],
  template: '<coar-button variant="primary">Click me</coar-button>',
})
export class AppComponent {}
```

2. Include the design tokens (CSS variables) in your global styles:

```css
@import '@cocoar/ui/styles';
```

That's it. Components are standalone — import only what you need.

## Development

**Prerequisites:** Node.js 22.x, pnpm 10.x

```bash
# Install dependencies
pnpm install

# Start the showcase app (http://localhost:4200)
pnpm start

# Lint / test / build
pnpm lint
pnpm test
pnpm build

# E2E tests (Playwright)
pnpm e2e
pnpm e2e -- --ui                  # Playwright UI mode
pnpm e2e -- --browsers=firefox    # specific browser
```

## Repository Structure

```
libs/
  ui/                       @cocoar/ui — components, tokens, menu, overlay
apps/
  showcase/                 Interactive component showcase
  showcase-e2e/             Playwright tests for showcase
docs/                       Guides, patterns, and recipes
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details.

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture and design token system |
| [NAMING.md](NAMING.md) | Naming conventions for selectors, classes, and tokens |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [docs/testing.md](docs/testing.md) | Running tests (Vitest + Playwright) |
| [docs/testing-writing.md](docs/testing-writing.md) | Writing tests |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, quality standards, and the definition of done.

## Security

To report security vulnerabilities, see [SECURITY.md](SECURITY.md).

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.
