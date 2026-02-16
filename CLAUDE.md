# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

The Coar Design System is an Nx monorepo providing Angular UI component libraries styled entirely with CSS custom properties (design tokens). All commands run from the repository root.

**Tech stack:** Angular 21.x, Nx 22.x, Node.js 22.x, pnpm 10.x

## Commands

```bash
pnpm install                          # install dependencies
pnpm start                            # showcase app → http://localhost:4200
pnpm lint                             # lint all projects
pnpm test                             # unit tests (Vitest) for all projects
pnpm build                            # build all projects
pnpm e2e                              # Playwright E2E (Chromium)
pnpm e2e -- --ui                      # Playwright UI mode
pnpm e2e -- --browsers=firefox        # specific browser
pnpm e2e -- --grep "@menu"            # run tagged subset

# Single project
pnpm nx test ui                       # test one Nx project
pnpm nx test ui --skip-nx-cache       # skip cache while iterating
pnpm nx run scenar-backstage-e2e:lint-tags    # validate E2E test tags

# Scenarios (isolated component testing)
node scripts/scenar/generate-registry.mjs   # regenerate scenario registry
# Verify at http://localhost:4300/__scenario/{id}

# Generated docs
node scripts/docs/extract-component-api.mjs # regenerate llms.txt / llms-full.txt
```

Always run tasks through Nx (`pnpm nx ...`), never `ng` directly.

## Architecture

### Repository Layout

```
libs/
  ui/                          # @cocoar/ui — the main published package
    styles/tokens/               Design tokens as CSS variables
    components/src/lib/          Angular components (categorized below)
      display/                     button, badge, tag, card, note, icon, avatar, etc.
      forms/                       text-input, number-input, checkbox, radio, select, switch
      navigation/                  tabs, sidebar, breadcrumb, pagination, navbar
      overlay/                     popover, tooltip, popconfirm, dialog, toast
      date-time/                   date pickers, time picker, calendars
    menu/                        Context menu and menu bar
    overlay/                     Generic overlay positioning system (builder API)
  localization/                # @cocoar/localization — i18n + timezone
  data-grid/                   # @cocoar/data-grid
  markdown-core/               # Markdown parsing
  markdown-viewer/             # Markdown rendering component
  ui-routing/                  # Router utilities
tools/
  testing-angular/             # @cocoar/testing-angular — shared Vitest helpers
  scenar/                      # Scenario testing infrastructure
apps/
  showcase/                    # Interactive component showcase
  scenar-backstage/            # Scenario host app (http://localhost:4300)
  scenar-backstage-e2e/        # Playwright tests for scenarios
```

### Key Architectural Rules

**Framework purity:** UI libraries use only CSS variables for styling. No Tailwind, no global CSS, no hardcoded colors/spacing. All visual values route through `--coar-*` tokens from Figma.

**Nx executors:**
- Angular apps → `@angular-devkit/build-angular:application`
- Angular publishable libraries → `@nx/angular:package` (APF via ng-packagr)
- Pure TypeScript libraries → `@nx/js:tsc`

**Logging:** No `console.log` in libraries. Logging packages live in the separate [cocoar-logging](https://github.com/cocoar-dev/cocoar-logging) repo.

### Naming Conventions

- **Selectors:** `coar-` prefix, kebab-case → `<coar-button>`
- **Classes:** `Coar` prefix, PascalCase → `CoarButtonComponent`
- **CSS variables:** `--coar-*` → `--coar-color-primary`
- **CSS classes:** `.coar-*` with BEM-like structure → `.coar-button__icon`
- **Packages:** `@cocoar/ui/*` secondary entry points
- **Sizes:** `s`, `m`, `l` (not `sm`, `md`, `lg`)
- **Color input name:** `variant` (not `color`)

See NAMING.md for the full reference.

### Overlay System

The overlay library (`@cocoar/ui/overlay`) uses a builder API:

```typescript
import { createOverlayBuilder, coarMenuPreset } from '@cocoar/ui/overlay';

const ref = createOverlayBuilder(coarMenuPreset)
  .anchor({ kind: 'point', x: 120, y: 120 })
  .fromTemplate(menuTemplate)
  .open(undefined);
```

Presets: `coarMenuPreset`, `coarModalPreset`, `coarTooltipPreset`, `coarHoverMenuPreset`.

## Testing

### Unit Tests (Vitest)

Use `@cocoar/testing-angular` helpers from `tools/testing-angular/`:

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

Additional test helpers: `createCoarLocaleServiceStub()`, `createCoarOverlayTestContainer()`, `cleanupCoarOverlays()`, `dispatchKeyboardEvent()`, `dispatchPointerEvent()`.

### E2E Tests (Playwright)

- Tests in `apps/scenar-backstage-e2e/src/`
- **Must include tags** in describe/test titles: `@menu`, `@smoke`, `@a11y`, etc.
- Tag lint: `pnpm nx run scenar-backstage-e2e:lint-tags`

### Scenarios

Scenarios are isolated component states for Playwright testing. Co-located with components as `*.scenario.ts` files.

```typescript
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarButtonComponent } from './coar-button.component';

export const scenario = defineScenario<CoarButtonComponent>({
  id: 'button',
  title: 'Button',
  inputs: { variant: 'primary' },
});
```

After creating/changing scenarios: `node scripts/scenar/generate-registry.mjs`

Full guide: `.github/skills/cocoar-scenarios/SKILL.md`

## Required Reading

For full context on non-trivial changes, read:
1. **ARCHITECTURE.md** — Design token system, executor policy, framework purity rules
2. **NAMING.md** — All naming conventions
3. **CONTRIBUTING.md** — Quality standards, definition of done
4. **docs/testing.md** — Test infrastructure
5. **docs/testing-writing.md** — Writing tests and tagging conventions
