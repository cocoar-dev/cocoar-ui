# Writing Scenarios — Component Testing Guide

> **For Humans & AI Agents**
>
> This guide explains how to write scenarios for isolated component testing in the Cocoar Design System.
> Scenarios enable testing UI components in isolation using Playwright, without needing full application context.

---

## Table of Contents

- [What are Scenarios?](#what-are-scenarios)
- [Why Use Scenarios?](#why-use-scenarios)
- [Quick Start](#quick-start)
- [File Organization](#file-organization)
- [Writing Your First Scenario](#writing-your-first-scenario)
- [Scenario Anatomy](#scenario-anatomy)
- [Component Input Patterns](#component-input-patterns)
- [Multiple Scenarios per Component](#multiple-scenarios-per-component)
- [Co-located vs Separate Files](#co-located-vs-separate-files)
- [Auto-Discovery & Registry](#auto-discovery--registry)
- [Testing with Playwright](#testing-with-playwright)
- [Best Practices](#best-practices)
- [AI Agent Guidelines](#ai-agent-guidelines)

---

## What are Scenarios?

A **scenario** is a testable, isolated instance of a component with specific input values and configuration. Think of it as a "live example" that can be:

- Rendered in isolation (via scenar-backstage app)
- Tested automatically (via Playwright)
- Viewed during development
- Used as documentation

Scenarios are defined using `defineScenario<T>()` from `@cocoar/scenar-abstractions`.

---

## Why Use Scenarios?

**Benefits:**

- **Isolation** — Test components without app dependencies
- **Speed** — Playwright tests run faster on isolated scenarios
- **Reusability** — Same scenarios for development, testing, and docs
- **Auto-Discovery** — No manual registration needed
- **Type Safety** — Full TypeScript support with component types

**Use Cases:**

- Playwright E2E tests for component behavior
- Visual regression testing
- Accessibility testing (keyboard navigation, ARIA, screen readers)
- Manual QA and development preview
- Living documentation

---

## Quick Start

**1. Create a scenario file:**

```typescript
// libs/ui/components/src/lib/coar-button/button.scenario.ts
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarButtonComponent } from './coar-button.component';

export const scenario = defineScenario<CoarButtonComponent>({
  id: 'ui/button/primary',
  title: 'Primary Button',
  description: 'Default primary button with label',
  inputs: {
    label: 'Click Me',
    variant: 'primary',
    disabled: false
  }
});
```

**2. That's it!** The scenario is automatically discovered and registered.

**3. Access it:**

- Development: `http://localhost:4300/__scenario/ui/button/primary`
- Metadata: `http://localhost:4300/registry.metadata.json`

---

## File Organization

### Option 1: Separate Scenario Files (Recommended for Libraries)

```
libs/ui/components/src/lib/
├── coar-button/
│   ├── coar-button.component.ts
│   ├── coar-button.component.spec.ts
│   └── button.scenario.ts              ← Scenario file
├── coar-icon/
│   ├── coar-icon.component.ts
│   └── icon.scenario.ts
```

**Naming Convention:**
- Pattern: `*.scenario.ts` (e.g., `button.scenario.ts`, `icon.scenario.ts`)
- Location: Same folder as component

### Option 2: Co-located Scenarios (For Complex Components)

```
libs/ui/components/src/lib/
├── coar-table/
│   ├── coar-table.component.ts
│   └── coar-table.component.scenario.ts    ← Co-located scenario
```

**Naming Convention:**
- Pattern: `*.component.scenario.ts`
- The component class must be in the same file as the scenario

### Option 3: Scenario Folder (For Apps)

```
apps/scenar-backstage/src/
├── scenarios/
│   ├── scenario-providers-probe.component.scenario.ts
│   ├── complex-form.scenario.ts
│   └── edge-cases.scenario.ts
```

**All three patterns are auto-discovered!**

---

## Writing Your First Scenario

### Step 1: Import Dependencies

```typescript
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarIconComponent } from './coar-icon.component';
```

### Step 2: Define the Scenario

```typescript
export const scenario = defineScenario<CoarIconComponent>({
  id: 'icon',
  title: 'Icon Component',
  description: 'Icon with default settings',
  inputs: {
    name: 'home',
    size: 'md',
    color: 'inherit'
  }
});
```

### Step 3: Save and Done

The registry generator automatically:
- Discovers your scenario file
- Extracts the scenario definition
- Generates component loader: `async () => (await import('...')).CoarIconComponent`
- Extracts input defaults from the component
- Registers it in the scenario registry

---

## Scenario Anatomy

```typescript
export const scenario = defineScenario<ComponentType>({
  id: string;            // Unique identifier (e.g., 'ui/button/primary')
  title: string;         // Human-readable title
  description?: string;  // Optional: What this scenario demonstrates
  inputs?: object;       // Optional: Default input values (overridable via URL query params)
  providers?: any[];     // Optional: Angular providers
  // component is auto-generated - do not provide it!
});
```

### Field Details

**`id`** (required)
- Unique identifier across all scenarios
- Use slash-separated format: `category/component/variant`
- Examples: `'ui/button/primary'`, `'forms/input/error-state'`, `'icon'`
- Used in URL: `http://localhost:4300/__scenario/{id}`

**`title`** (required)
- Human-readable title shown in UI
- Examples: `'Primary Button'`, `'Icon with Rotation'`

**`description`** (optional)
- Longer explanation of what this scenario demonstrates
- Shown in metadata JSON and can be used for documentation
- Use full sentences
- Examples: `'Button in disabled state showing reduced opacity'`, `'Icon with 90-degree rotation applied via rotate input'`

**`inputs`** (optional)
- Default values for component inputs
- Can be overridden via URL query parameters at runtime
- Auto-discovery also extracts component defaults, so you can omit values you don't want to change
- Example: `{ label: 'Submit', disabled: true }`
- Runtime behavior:
  - Scenario URL: `/__scenario/ui/button/primary?label=Cancel`
  - Final inputs: Scenario defaults merged with query params (query params win)

**`providers`** (optional)
- Angular providers needed for the component
- Example: `providers: [MyService, { provide: CONFIG, useValue: {...} }]`

**`component`** (auto-generated)
- **DO NOT PROVIDE THIS!** The registry generator creates it automatically
- Auto-generated as: `async () => (await import('./component')).ComponentClass`

---

## Component Input Patterns

### Override Specific Inputs

The generator extracts default values from your component, so you only need to specify what's different:

```typescript
// Component has: size = input<string>('md')
// Scenario only overrides what's needed:
export const largeIcon = defineScenario<CoarIconComponent>({
  id: 'icon/large',
  title: 'Large Icon',
  description: 'Icon with large size',
  inputs: {
    size: 'lg'  // Only override size, other defaults are auto-extracted
  }
});
```

### No Inputs Needed

If defaults are sufficient, omit `inputs` entirely:

```typescript
export const defaultButton = defineScenario<CoarButtonComponent>({
  id: 'ui/button/default',
  title: 'Default Button',
  description: 'Button with all default values'
  // No inputs needed - component defaults are used
});
```

### Complex Inputs

For complex objects or arrays:

```typescript
export const tableScenario = defineScenario<CoarTableComponent>({
  id: 'ui/table/with-data',
  title: 'Table with Data',
  description: 'Table showing sample user data',
  inputs: {
    columns: [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' }
    ],
    data: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' }
    ]
  }
});
```

---

## Multiple Scenarios per Component

You can export multiple scenarios from one file to test different states:

```typescript
// button.scenario.ts
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarButtonComponent } from './coar-button.component';

export const primaryButton = defineScenario<CoarButtonComponent>({
  id: 'ui/button/primary',
  title: 'Primary Button',
  description: 'Default primary button',
  inputs: { variant: 'primary' }
});

export const disabledButton = defineScenario<CoarButtonComponent>({
  id: 'ui/button/disabled',
  title: 'Disabled Button',
  description: 'Button in disabled state',
  inputs: { variant: 'primary', disabled: true }
});

export const loadingButton = defineScenario<CoarButtonComponent>({
  id: 'ui/button/loading',
  title: 'Loading Button',
  description: 'Button showing loading spinner',
  inputs: { variant: 'primary', loading: true }
});
```

**Each export is automatically discovered and registered.**

---

## Co-located vs Separate Files

### Use Separate Files When:

✅ Component is in a library (`libs/`)
✅ Scenario is reusable across tests
✅ You want clean separation of concerns

```typescript
// libs/ui/components/src/lib/coar-badge/badge.scenario.ts
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarBadgeComponent } from './coar-badge.component';

export const scenario = defineScenario<CoarBadgeComponent>({
  id: 'ui/badge/success',
  title: 'Success Badge',
  description: 'Badge with success variant',
  inputs: { variant: 'success', label: 'Done' }
});
```

### Use Co-located Files When:

✅ Component is only for testing/demo purposes
✅ Component and scenario are tightly coupled
✅ You want everything in one file

```typescript
// apps/scenar-backstage/src/scenarios/scenario-providers-probe.component.scenario.ts
import { defineScenario } from '@cocoar/scenar-abstractions';

export const withProviders = defineScenario<ScenarioProvidersProbeComponent>({
  id: 'providers/probe',
  title: 'Providers Probe',
  description: 'Proves scenario.providers is applied at runtime'
});
```

---

## Auto-Discovery & Registry

### How It Works

1. **File Scanning**: Generator scans `libs/` and `apps/scenar-backstage/src/scenarios/` for `*.scenario.ts` files
2. **AST Parsing**: Uses TypeScript AST to find `defineScenario()` calls
3. **Metadata Extraction**:
   - Scenario ID from the `id` property
   - Component class from type parameter `<CoarIconComponent>`
   - Component file path using naming patterns
   - Input defaults from component class
4. **Code Generation**:
   - Creates `registry.generated.ts` with imports and loaders
   - Creates `registry.metadata.json` with HTTP-accessible metadata
5. **Collision Handling**: Automatically aliases duplicate export names (`scenario_1`, `scenario_2`)

### Trigger Registry Generation

**During Development (Watch Mode):**
```bash
nx serve:watch scenar-backstage
```
Auto-regenerates on every `.scenario.ts` file change (with 100ms debouncing).

**Manual Generation:**
```bash
node scripts/scenar/generate-registry.mjs
```

**Build (Automatic):**
```bash
nx build scenar-backstage
```
Registry generation runs automatically as a build dependency.

### Generated Files

**`apps/scenar-backstage/src/app/registry.generated.ts`**
```typescript
import { scenario as scenario_base } from '../../../../libs/ui/components/src/lib/coar-icon/icon.scenario';
import { scenario as scenario_base_1 } from '../../../../libs/ui/components/src/lib/coar-label/label.scenario';

export const SCENARIO_REGISTRY: Record<string, ScenarioDefinition> = {
  [scenario_base.id]: {
    ...scenario_base,
    component: async () => (await import('../../../../libs/ui/components/src/lib/coar-icon/coar-icon.component')).CoarIconComponent,
    inputs: { size: 'md', rotate: 0, spin: false, color: 'inherit' }
  },
  // ... more scenarios
};
```

**`apps/scenar-backstage/public/registry.metadata.json`**
```json
{
  "generatedAt": "2026-01-01T18:30:00.000Z",
  "count": 5,
  "scenarios": [
    {
      "id": "icon",
      "url": "/__scenario/icon",
      "title": "Icon Component",
      "description": "Icon with default settings",
      "component": {
        "path": "libs/ui/components/src/lib/coar-icon/coar-icon.component.ts",
        "className": "CoarIconComponent"
      },
      "inputs": {
        "size": {
          "type": "input",
          "required": false,
          "defaultValue": "md",
          "tsType": "CoarIconSize | string"
        },
        "name": {
          "type": "input",
          "required": true,
          "tsType": "string"
        }
      }
    }
  ]
}
```

---

## Testing with Playwright

### Access Scenarios in Tests

Scenarios are accessible via URL pattern: `/__scenario/{scenario-id}`

```typescript
// e2e/button.spec.ts
import { test, expect } from '@playwright/test';

test('primary button is clickable', async ({ page }) => {
  // Navigate to isolated scenario
  await page.goto('http://localhost:4300/__scenario/ui/button/primary');

  // Test the component
  const button = page.locator('coar-button button');
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  await button.click();
});

test('disabled button cannot be clicked', async ({ page }) => {
  await page.goto('http://localhost:4300/__scenario/ui/button/disabled');

  const button = page.locator('coar-button button');
  await expect(button).toBeDisabled();
});
```

### Use Metadata for Dynamic Tests

```typescript
import { test } from '@playwright/test';
import metadata from '../apps/scenar-backstage/public/registry.metadata.json';

// Generate tests for all button scenarios
const buttonScenarios = metadata.scenarios.filter(s => s.id.startsWith('ui/button/'));

for (const scenario of buttonScenarios) {
  test(`${scenario.title} - accessibility`, async ({ page }) => {
    await page.goto(`http://localhost:4300${scenario.url}`);

    // Run accessibility tests
    const button = page.locator('coar-button button');
    await expect(button).toHaveAttribute('type', 'button');
    // ... more a11y checks
  });
}
```

### Testing Patterns

**Component Isolation:**
```typescript
test('icon rotation', async ({ page }) => {
  await page.goto('http://localhost:4300/__scenario/icon/rotated');

  const icon = page.locator('coar-icon');
  await expect(icon).toHaveCSS('transform', 'matrix(0, 1, -1, 0, 0, 0)'); // 90deg
});
```

**Interaction Testing:**
```typescript
test('button emits click event', async ({ page }) => {
  await page.goto('http://localhost:4300/__scenario/ui/button/primary');

  // Listen for custom events
  await page.evaluate(() => {
    window.clickCount = 0;
    document.querySelector('coar-button')?.addEventListener('buttonClick', () => {
      window.clickCount++;
    });
  });

  await page.click('coar-button button');

  const clickCount = await page.evaluate(() => window.clickCount);
  expect(clickCount).toBe(1);
});
```

**Visual Regression:**
```typescript
test('button visual regression', async ({ page }) => {
  await page.goto('http://localhost:4300/__scenario/ui/button/primary');
  await expect(page.locator('coar-button')).toHaveScreenshot();
});
```

---

## Best Practices

### ✅ DO

- **Use descriptive scenario IDs**: `'ui/button/primary'` not `'btn1'`
- **Write clear descriptions**: Explain what's being demonstrated
- **Test edge cases**: Create scenarios for error states, empty states, loading states
- **One scenario per state**: Don't combine multiple states in one scenario
- **Keep scenarios simple**: Focus on one aspect at a time
- **Use multiple scenarios**: Cover all variations of a component
- **Follow naming conventions**: `*.scenario.ts` or `*.component.scenario.ts`

### ❌ DON'T

- **Don't provide `component` property**: It's auto-generated
- **Don't use dynamic IDs**: IDs must be static strings for URL routing
- **Don't include app logic**: Scenarios are for isolated components only
- **Don't share state**: Each scenario should be independent
- **Don't hardcode URLs in tests**: Use the `/__scenario/{id}` pattern
- **Don't duplicate scenario IDs**: Each ID must be unique across workspace

### Naming Conventions

**Scenario IDs:**
- Format: `category/component/variant`
- Examples:
  - `'ui/button/primary'`
  - `'forms/input/error'`
  - `'icon/large'`
  - `'accessibility/keyboard-nav'`

**File Names:**
- Separate files: `{component-name}.scenario.ts`
  - `button.scenario.ts`
  - `icon.scenario.ts`
  - `table.scenario.ts`
- Co-located files: `{component-name}.component.scenario.ts`
  - `coar-table.component.scenario.ts`

**Export Names:**
- Can be anything (`scenario`, `primaryButton`, `loadingState`)
- Collisions are automatically handled with aliases
- Use descriptive names when exporting multiple scenarios from one file

---

## AI Agent Guidelines

> **For AI Assistants (GitHub Copilot, Claude, ChatGPT, etc.)**

### 🚀 Quick Start for AI Agents

**Agent Skill:** [.github/skills/cocoar-scenarios/SKILL.md](../.github/skills/cocoar-scenarios/SKILL.md)

Concise guide with copy-paste templates for components, directives, and services. GitHub Copilot loads this automatically.

### When Creating Scenarios

1. **Check component location first**:
   ```bash
   # Find component file
   find libs/ -name "*{component-name}.component.ts"
   ```

2. **Read component to understand inputs**:
   - Check for `input<T>()` or `model<T>()` signal inputs
   - Note which inputs are required: `input.required<T>()`
   - Check default values

3. **Create scenario file**:
   - For library components: Use `{name}.scenario.ts` in same folder
   - For demo components: Use `{name}.component.scenario.ts`

4. **Write comprehensive scenarios**:
   - Create at least 3 scenarios per component: default, edge case, error state
   - Use descriptive IDs following `category/component/variant` pattern
   - Provide clear `title` and `description`

5. **Do NOT provide `component` property**: Generator creates it automatically

6. **Test the scenario**:
   ```bash
   # Regenerate registry
   node scripts/scenar/generate-registry.mjs

   # Start server (if not running)
   nx serve scenar-backstage

   # Access scenario
   # http://localhost:4300/__scenario/{scenario-id}
   ```

### Example Workflow

```typescript
// 1. Read component
// libs/ui/components/src/lib/coar-badge/coar-badge.component.ts
export class CoarBadgeComponent {
  variant = input<'info' | 'success' | 'warning' | 'error'>('info');
  label = input.required<string>();
  size = input<'sm' | 'md' | 'lg'>('md');
}

// 2. Create scenario file
// libs/ui/components/src/lib/coar-badge/badge.scenario.ts
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarBadgeComponent } from './coar-badge.component';

export const infoScenario = defineScenario<CoarBadgeComponent>({
  id: 'ui/badge/info',
  title: 'Info Badge',
  description: 'Badge with info variant (default)',
  inputs: {
    label: 'Information'
    // variant and size use component defaults
  }
});

export const successScenario = defineScenario<CoarBadgeComponent>({
  id: 'ui/badge/success',
  title: 'Success Badge',
  description: 'Badge indicating successful operation',
  inputs: {
    label: 'Success',
    variant: 'success'
  }
});

export const errorScenario = defineScenario<CoarBadgeComponent>({
  id: 'ui/badge/error',
  title: 'Error Badge',
  description: 'Badge indicating error state',
  inputs: {
    label: 'Error',
    variant: 'error',
    size: 'lg'
  }
});

// 3. Registry auto-generates component loaders and merges defaults
// 4. Access at:
//    http://localhost:4300/__scenario/ui/badge/info
//    http://localhost:4300/__scenario/ui/badge/success
//    http://localhost:4300/__scenario/ui/badge/error
```

### Common Patterns for AI Agents

**Creating scenarios for all components in a library:**

```bash
# 1. Find all components
find libs/ui/components/src/lib -name "*.component.ts" -not -name "*.spec.ts" -not -name "*.scenario.ts"

# 2. For each component, create {name}.scenario.ts with at least:
#    - Default scenario
#    - Edge case scenario
#    - Error/disabled scenario (if applicable)

# 3. Regenerate registry
node scripts/scenar/generate-registry.mjs
```

**Verifying scenarios work:**

```bash
# Check generated registry
cat apps/scenar-backstage/src/app/registry.generated.ts

# Check metadata
cat apps/scenar-backstage/public/registry.metadata.json

# List all scenario IDs
node -e "console.log(Object.keys(require('./apps/scenar-backstage/public/registry.metadata.json').scenarios.map(s => s.id)))"
```

---

## Additional Resources

- **[scripts/scenar/README.md](../scripts/scenar/README.md)** — Registry generator technical details
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** — Overall system architecture
- **[NAMING.md](../NAMING.md)** — Naming conventions for components and scenarios
- **[docs/testing.md](./testing.md)** — How to run Playwright tests
- **[docs/testing-writing.md](./testing-writing.md)** — Writing Playwright tests

---

## Summary

**To write a scenario:**

1. Create `*.scenario.ts` file next to your component
2. Import `defineScenario` and your component class
3. Export scenario(s) with `id`, `title`, `description`, and optional `inputs`
4. Save — auto-discovery handles the rest!

**To test a scenario:**

1. Navigate to `http://localhost:4300/__scenario/{id}`
2. Write Playwright tests using the scenario URL
3. Run tests with `nx e2e showcase-e2e`

If you're testing the scenario host directly, run `nx run scenar-backstage-e2e:e2e`.

**Remember:**
- Don't provide `component` property (auto-generated)
- Use unique, descriptive scenario IDs
- Create multiple scenarios to cover all component states
- Keep scenarios simple and focused

---

**Questions? Issues?**

- Check [scripts/scenar/README.md](../scripts/scenar/README.md) for generator details
- See existing scenarios in `libs/ui/components/src/lib/*/` for examples
- Review ARCHITECTURE.md for system design decisions
