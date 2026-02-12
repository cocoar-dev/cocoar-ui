# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

The Coar Design System is an Nx monorepo providing Angular-based UI component libraries with design tokens (CSS variables). All commands must be run from the repository root.

**Tech stack:** Angular 21.x, Nx 22.x, Node.js 22.x (pnpm 10.x)

## Essential Commands

```bash
# Install dependencies
pnpm install

# Start showcase app (http://localhost:4200)
pnpm start

# Lint / test / build all projects
pnpm lint
pnpm test
pnpm build

# Run a single project's tests
pnpm nx test ui-menu
pnpm nx test ui-menu --skip-nx-cache  # skip cache while iterating

# E2E tests (Playwright, default: Chromium)
pnpm e2e
pnpm e2e -- --ui                      # Playwright UI mode
pnpm e2e -- --browsers=firefox        # specific browser
pnpm e2e -- --grep "@menu"            # run tagged subset
pnpm e2e -- --grep "@smoke|@a11y"     # combine tags
```

## Architecture

### Repository Structure

```
libs/
├── ui-tokens/              # Design tokens as CSS variables
├── ui-components/          # Core Angular UI components
├── ui-menu/                # Menu components
├── ui-overlay/             # Overlay/popover system
├── testing-angular/        # Shared Vitest setup + test helpers
└── scenar/                 # Scenario testing infrastructure
apps/
├── showcase/               # Component showcase app
├── showcase-e2e/           # Playwright tests for showcase
└── scenar-backstage/       # Scenario host app
```

### Framework Purity (Critical)

UI libraries must be framework-pure:
- **Only CSS variables** for styling (`var(--coar-color-primary)`)
- **No Tailwind**, no global CSS, no hardcoded colors/spacing
- Design tokens come from Figma via `@cocoar/ui-tokens`

### Naming Conventions (from NAMING.md)

- **Component selectors:** `coar-` prefix, kebab-case (`<coar-button>`)
- **Class names:** `Coar` prefix, PascalCase (`CoarButtonComponent`)
- **CSS variables:** `--coar-*` prefix (`--coar-color-primary`)
- **CSS classes:** `.coar-*` prefix with BEM-like structure
- **npm packages:** `@cocoar/ui-*` for UI

### Logging

Logging packages (`@cocoar/logging`, `@cocoar/logging-abstractions`) have been extracted to the separate [`cocoar-logging`](https://github.com/cocoar-dev/cocoar-logging) repository. Never use `console.log` in libraries.

### Nx Usage

- Angular apps use `@angular-devkit/build-angular:application`
- Angular publishable libraries use `@nx/angular:package` (APF via ng-packagr)
- Pure TypeScript libraries use `@nx/js:tsc`
- Always run tasks through Nx (`pnpm nx ...`), not `ng` directly

## Testing

### Unit Tests (Vitest)

Use `@cocoar/testing-angular` helpers:
```typescript
import { describe, it, expect } from 'vitest';
import { renderCoarComponent, queryRequired } from '@cocoar/testing-angular';
import { CoarButtonComponent } from './coar-button.component';

describe('CoarButtonComponent', () => {
  it('renders', async () => {
    const fixture = await renderCoarComponent(CoarButtonComponent);
    const button = queryRequired<HTMLButtonElement>(fixture.nativeElement, 'button');
    expect(button).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

- Tests live in `apps/showcase-e2e/src/`
- **Must include tags** in describe/test titles: `@menu`, `@smoke`, `@a11y`
- Run tag lint check: `pnpm nx run showcase-e2e:lint-tags`

### Scenarios

For isolated component testing, create `*.scenario.ts` files, then:
```bash
node scripts/scenar/generate-registry.mjs
# Verify at http://localhost:4300/__scenario/{id}
```

## Required Documentation

AI assistants must read these files for full context:
1. **ARCHITECTURE.md** - Technical patterns, design token system, security
2. **NAMING.md** - All naming conventions (selectors, classes, CSS vars)
3. **CONTRIBUTING.md** - Quality standards, definition of done
4. **docs/testing.md** - Test running and infrastructure
5. **docs/testing-writing.md** - How to write tests, tagging conventions
