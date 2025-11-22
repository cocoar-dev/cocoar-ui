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
* **Shared logging infrastructure** (`@cocoar/logging-abstractions` + `@cocoar/logging`)
* **Storybook documentation** for all components
* High-quality, brand-consistent UI components

---

## Architecture

* **Framework-pure libraries** - No Tailwind, only CSS variables
* **Design tokens from Figma** - All styling via CSS variables
* **Nx monorepo** - Efficient build and test caching
* **Storybook** - Interactive component documentation
* **Playwright** - End-to-end testing
* **Structured logging** - Serilog-style logging with abstractions for libraries and full implementation for applications

---

## Logging

The repository provides a two-package logging solution following the Microsoft.Extensions.Logging pattern:

### For Libraries: `@cocoar/logging-abstractions`

Lightweight interface-only package (~2KB, zero dependencies):

```typescript
import { getLoggerFor } from '@cocoar/logging-abstractions';

export class MyLibraryClass {
  private logger = getLoggerFor(this); // Or getLoggerFor('MyClass')
  
  doWork() {
    this.logger.info('Processing item {id}', { id: 123 });
  }
}
```

**Features:**
- Zero-op `NullLogger` when no logger configured (never crashes)
- Flexible `getLoggerFor()` accepts string, class, or instance
- Global singleton registry using `Symbol.for()`
- Safe for libraries to use without forcing dependencies on applications

### For Applications: `@cocoar/logging`

Full Serilog-style implementation with pipeline architecture:

```typescript
import { configureGlobalLogger, ConsoleSink } from '@cocoar/logging';

// Configure once at startup
configureGlobalLogger((config) =>
  config
    .minLevel('info')
    .enrich({ appName: 'MyApp' })
    .writeTo(new ConsoleSink())
);

// Now all libraries using getLoggerFor() will log
```

**Features:**
- Message template support: `logger.info('User {userId} logged in', { userId: 123 })`
- Pipeline stages: filter, enrich, sink, fork
- Multiple sinks: Console, Observable (callback-based)
- Async/sync sink coordination
- Automatic registration with abstractions

See [`src/libs/logging-abstractions/README.md`](src/libs/logging-abstractions/README.md) and [`src/libs/logging/README.md`](src/libs/logging/README.md) for complete documentation.

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
src/                      # Nx workspace root
  libs/
    ui-tokens/            Design tokens from Figma
    ui-core/              Core UI components
    ui-forms/             Form components
    ui-grid/              Data grid component
    ui-icons/             Icon system
    logging-abstractions/ Lightweight logging interfaces (~2KB)
    logging/              Full Serilog-style logging implementation
  apps/
    storybook/            Component documentation
docs/                     Additional documentation
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
