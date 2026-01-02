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
6. **[docs/testing.md](docs/testing.md)** — Testing (Vitest + Playwright) ⭐
7. **[docs/testing-writing.md](docs/testing-writing.md)** — Writing tests (dev guide) ⭐

**Working with AI assistants?** AI tools must read all documentation files above.

---

## Overview

The **Coar Design System** is an Nx monorepo providing:

* **Angular UI component libraries** (`@cocoar/ui-*`)
* **Design tokens** delivered as CSS variables (`@cocoar/ui-tokens`)
* **Shared logging infrastructure** (`@cocoar/logging-abstractions` + `@cocoar/logging`)
* **A showcase app** for interactive component previews
* High-quality, brand-consistent UI components

---

## Architecture

* **Framework-pure libraries** - No Tailwind, only CSS variables
* **Design tokens as CSS variables** - All styling via `--coar-*` tokens
* **Nx monorepo** - Efficient build and test caching
* **Showcase app** - Interactive component previews
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

See [`libs/logging-abstractions/README.md`](libs/logging-abstractions/README.md) and [`libs/logging/README.md`](libs/logging/README.md) for complete documentation.

---

## Install

```bash
npm install @cocoar/ui-components @cocoar/ui-tokens
```

---

## Usage

```typescript
import { CoarButtonComponent } from '@cocoar/ui-components';

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
# Install dependencies
pnpm install

# Start the showcase app
pnpm start

# Lint / test / build
pnpm lint
pnpm test
pnpm build

# Run e2e tests
pnpm e2e

# Run e2e tests in a different browser (local default is Chromium)
pnpm e2e -- --browsers=firefox

# Run e2e tests in all browsers (mainly for CI or debugging)
pnpm e2e -- --browsers=all
```

---

## Release

This repository currently uses an **artifacts-only** release approach ("Option C"):

- CI builds packages, runs `npm pack`, and uploads `.tgz` artifacts.
- Publishing to npm is intentionally disabled (publish steps are present but commented out).

See [docs/consuming/local-artifacts.md](docs/consuming/local-artifacts.md) for validating the built `.tgz` artifacts locally.

---

## Repository Structure

```
libs/                     # Publishable libraries
apps/                     # Angular apps
  showcase/               Component showcase app
  scenar-backstage/       Scenario host app (Scenar Backstage)
  showcase-e2e/           Playwright e2e tests
  scenar-backstage-e2e/   Playwright e2e tests (scenario host)
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
