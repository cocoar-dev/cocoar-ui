# Scenar Registry Generator

Automatically generates the scenario registry for the backstage app by discovering `*.scenario.ts` files across the workspace.

## What It Does

1. **Scans workspace** for all `*.scenario.ts` files in:
   - `libs/**/src/**/*.scenario.ts` (component libraries)
   - `apps/scenar-backstage/src/scenarios/**/*.scenario.ts` (backstage-specific scenarios)

2. **Extracts scenario exports** using TypeScript AST parsing
   - Finds all `export const X = defineScenario(...)` statements
   - Supports multiple scenarios per file
   - Handles naming collisions with import aliases

3. **Generates registry** at `apps/scenar-backstage/src/app/registry.generated.ts`
   - Imports all discovered scenarios
   - Creates registry map: `{ [scenario.id]: scenario }`
   - Handles duplicate export names automatically

## Usage

### Manual Generation

```bash
# From workspace root
node scripts/scenar/generate-registry.mjs

# Or via npm script
pnpm build:scenar-registry
```

### Automatic Generation

The registry is automatically regenerated when:
- Running `nx serve scenar-backstage` (before dev server starts)
- Running `nx build scenar-backstage` (before production build)

## Co-Located Scenarios

Scenarios live next to their components, not in the backstage app:

```
libs/ui-components/
  src/lib/coar-button/
    button.component.ts
    button.scenario.ts      ← Scenarios live here!
    button.spec.ts
```

The generator automatically discovers and imports them.

## Multiple Scenarios Per File

You can export multiple scenarios from a single file:

```typescript
// button.scenario.ts
export const buttonPrimary = defineScenario<ButtonComponent>({
  id: 'button/primary',
  title: 'Button / Primary',
});

export const buttonSecondary = defineScenario<ButtonComponent>({
  id: 'button/secondary',
  title: 'Button / Secondary',
});

export const buttonLarge = defineScenario<ButtonComponent>({
  id: 'button/large',
  title: 'Button / Large',
});
```

All three will be discovered and registered automatically.

## Naming Collisions

If multiple files export scenarios with the same name (e.g., `scenario`), the generator automatically creates unique aliases:

```typescript
// Generated registry
import { scenario } from '../icon/icon.scenario';
import { scenario as scenario_1 } from '../label/label.scenario';

export const SCENARIO_REGISTRY = {
  [scenario.id]: scenario,
  [scenario_1.id]: scenario_1,
};
```

## How It Works

1. **File Discovery:** Recursively walks workspace directories, filtering for `*.scenario.ts`
2. **AST Parsing:** Uses TypeScript compiler API to parse each file
3. **Export Detection:** Finds `defineScenario` calls in exported const declarations
4. **Path Resolution:** Calculates relative import paths from registry location
5. **Collision Handling:** Generates unique aliases when export names conflict
6. **Registry Generation:** Creates TypeScript file with all imports and registry map

## Benefits

✅ **No manual maintenance** - Add a scenario file anywhere, it's auto-discovered
✅ **Co-location** - Scenarios live with components (like tests)
✅ **Type-safe** - Generated TypeScript with proper imports
✅ **Lazy loading** - Components still load on-demand via async imports
✅ **Scalable** - Supports unlimited scenarios across unlimited libraries
✅ **Convention-based** - Just follow naming pattern, no configuration needed
