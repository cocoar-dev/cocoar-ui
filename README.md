# Coar Design System

> Angular-based UI component libraries and design system

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

---

## 📚 Documentation

**New to this repository? Start here:**

1. **[README.md](README.md)** (this file) — Overview and quick start
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** — Technical architecture and patterns ⭐ **REQUIRED**
3. **[NAMING.md](NAMING.md)** — Naming conventions ⭐ **REQUIRED**
4. **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to contribute
5. **[AGENTS.md](AGENTS.md)** — AI assistant guidelines

**Working with AI assistants?** AI tools must read all documentation files above.

---

## Overview

The **Coar Design System** is an Nx monorepo providing:

* **Angular UI component libraries** (`@cocoar/ui-*`)
* **Design tokens** generated from Figma
* **Shared logging infrastructure** (`@cocoar/logging-core`)
* **Storybook documentation** for all components
* High-quality, brand-consistent UI components

---

## Architecture

* **Framework-pure libraries** - No Tailwind, only CSS variables
* **Design tokens from Figma** - All styling via CSS variables
* **Nx monorepo** - Efficient build and test caching
* **Storybook** - Interactive component documentation
* **Playwright** - End-to-end testing
* **Structured logging** - Via `@cocoar/logging-core`

---

## Install

```bash
npm install @cocoar/ui-core @cocoar/ui-tokens
```

---

## Usage

```typescript
import { CoarButtonComponent } from '@cocoar/ui-core';

@Component({
  selector: 'app-root',
  imports: [CoarButtonComponent],
  template: '<coar-button variant="primary">Click me</coar-button>'
})
export class AppComponent {}
```

---

## Development

```bash
# Install dependencies (from src/ directory)
cd src
npm install

# Run Storybook
npm run storybook

# Build all libraries
nx run-many --target=build --all

# Run tests
nx run-many --target=test --all

# Run e2e tests
nx e2e storybook-e2e
```

---

## Repository Structure

**Note:** The Nx workspace is located in `src/`, not at the repository root.

```
src/                  # Nx workspace root
  libs/
    ui-tokens/        Design tokens from Figma
    ui-core/          Core UI components
    ui-forms/         Form components
    ui-grid/          Data grid component
    ui-icons/         Icon system
    logging-core/     Structured logging library
  apps/
  storybook/          Component documentation
docs/                 Additional documentation
```

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Important:** Please read [AGENTS.md](AGENTS.md) and [NAMING.md](NAMING.md) for architecture and naming conventions.

---

## Security

To report security vulnerabilities, see [SECURITY.md](SECURITY.md).

---

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.
