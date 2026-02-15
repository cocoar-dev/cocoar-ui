# Scenar System Documentation

> **Complete documentation for the Cocoar scenario system, backstage app, and Playwright integration.**

---

## Documentation Index

### For AI Agents (Start Here!)

**Agent Skill:** [.github/skills/cocoar-scenarios/SKILL.md](../../.github/skills/cocoar-scenarios/SKILL.md)

Concise templates and workflow for creating scenarios and Playwright tests. This Agent Skill is automatically loaded by GitHub Copilot when relevant.

### For Human Contributors

| Guide | Purpose | Audience |
|-------|---------|----------|
| **[Writing Scenarios](../writing-scenarios.md)** | Comprehensive scenario guide | Component authors, contributors |
| **[Codec System](./codec-system.md)** | Technical details on URL serialization | Advanced users, system maintainers |
| **[Testing Guide](../testing.md)** | How to run Playwright tests | QA, developers |
| **[Testing Writing Guide](../testing-writing.md)** | How to write Playwright tests | Test authors |

---

## Quick Reference by Task

### Task: Create a Scenario for a Component

**Steps:**
1. See [Agent Skill](../../.github/skills/cocoar-scenarios/SKILL.md) for templates
2. Use component template (simple or with providers)
3. Generate `{component}.scenario.ts` file
4. Run `node scripts/scenar/generate-registry.mjs`
5. Verify at `http://localhost:4300/__scenario/{id}`

**Example:**
```typescript
// libs/ui/components/src/lib/coar-button/button.scenario.ts
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarButtonComponent } from './coar-button.component';

export const scenario = defineScenario<CoarButtonComponent>({
  id: 'button',
  title: 'Button',
  description: 'Default button',
  inputs: { variant: 'primary' },
});
```

---

### Task: Create a Scenario for a Directive

**Steps:**
1. See [Agent Skill](../../.github/skills/cocoar-scenarios/SKILL.md) directive template
2. Create host component that applies directive
3. Generate scenario for the host component
4. Verify directive behavior in backstage

**Example:**
```typescript
// Host component wraps directive
@Component({
  selector: 'coar-tooltip-scenario',
  standalone: true,
  imports: [CoarTooltipDirective],
  template: `<button [coarTooltip]="text()">Hover me</button>`,
})
export class CoarTooltipScenarioComponent {
  text = input<string>('Tooltip text');
}

export const scenario = defineScenario<CoarTooltipScenarioComponent>({
  id: 'tooltip',
  inputs: { text: 'Help text' },
});
```

---

### Task: Write a Playwright Test for a Scenario

**Steps:**
1. See [Agent Skill](../../.github/skills/cocoar-scenarios/SKILL.md) test example
2. Use `openScenario()` helper to navigate to scenario
4. Write assertions with Playwright locators
5. Run with `nx e2e scenar-backstage-e2e`

**Example:**
```typescript
// apps/scenar-backstage-e2e/src/button.spec.ts
import { expect, test } from '@playwright/test';
import { openScenario } from '@cocoar/scenar-testing-playwright';

test('button is clickable', async ({ page }) => {
  await openScenario(page, 'button', { label: 'Test' });
  const button = page.locator('coar-button button');
  await expect(button).toBeVisible();
  await button.click();
});
```

---

### Task: Debug a Failing Test

**Steps:**
1. Run test with trace: `nx e2e scenar-backstage-e2e`
2. Open trace viewer: `npx playwright show-trace test-results/.../trace.zip`
3. Check screenshots, console logs, network requests

**Common issues:**
- Wrong selector → Use more specific locator
- Timing issue → Add explicit waits
- Scenario not loading → Regenerate registry
- Input not applied → Check signal usage in template

---

## Common Commands

```bash
# Generate/regenerate registry (auto-discovers scenarios)
node scripts/scenar/generate-registry.mjs

# Start backstage app for manual testing
nx serve scenar-backstage

# Access scenario in browser
# http://localhost:4300/__scenario/{scenario-id}

# Run all E2E tests
nx e2e scenar-backstage-e2e

# Run specific test file
nx e2e scenar-backstage-e2e --grep button.spec.ts

# Run tests with UI mode (debugging)
nx run scenar-backstage-e2e:e2e-ui

# View test traces
npx playwright show-trace test-results/.../trace.zip
```

---

## System Architecture

**How It Works:**

```
1. SCENARIO DEFINITION
   ↓ (Co-located with component)
   libs/ui/components/src/lib/coar-button/button.scenario.ts

2. REGISTRY GENERATION
   ↓ (Scripts scan workspace for *.scenario.ts)
   node scripts/scenar/generate-registry.mjs

   Generates:
   - apps/scenar-backstage/src/app/registry.generated.ts (runtime)
   - apps/scenar-backstage/public/registry.metadata.json (metadata)

3. BACKSTAGE APP
   ↓ (Angular app serves scenarios)
   nx serve scenar-backstage → http://localhost:4300

   URLs: http://localhost:4300/__scenario/{id}?input1=value&input2=value

4. PLAYWRIGHT TESTS
   ↓ (Tests navigate to scenarios)
   await openScenario(page, 'button', { label: 'Test' });

   Tests interact with rendered component via locators

5. VALIDATION
   ↓ (Assertions verify behavior)
   await expect(button).toBeVisible();
```

---

## Key Concepts

### Scenarios
**What:** Testable, isolated instances of components with specific inputs
**Why:** Enable testing without full application context
**How:** Defined with `defineScenario<T>()` from `@cocoar/scenar-abstractions`

### Backstage App
**What:** Standalone Angular app that renders scenarios via URL navigation
**Why:** Provides isolated runtime environment for component testing
**How:** Routes all `/__scenario/{id}` URLs through scenario loader

### Registry
**What:** Auto-generated index of all scenarios in the workspace
**Why:** Enables dynamic scenario loading without manual registration
**How:** Scripts scan for `*.scenario.ts` files and extract metadata

### Codec System
**What:** Serialization/deserialization system for URL parameters
**Why:** Enables passing complex types (Date, objects, arrays) via query strings
**How:** Format-aware deserialization based on TypeScript types and string patterns

### Host Components
**What:** Wrapper components that apply directives or consume services
**Why:** Directives and services can't be rendered directly
**How:** Component accepts inputs and passes them to directive/service

---

## Advanced Topics

### Custom Codecs
See [Codec System](./codec-system.md) for implementing custom serialization.

### Performance Testing
Backstage app runs in isolation—ideal for performance profiling and optimization.

### Visual Regression Testing
Scenarios provide stable targets for screenshot-based visual testing.

### Accessibility Testing
Use scenarios to systematically test keyboard navigation, ARIA, and screen readers.

---

## Troubleshooting

| Problem | Solution | Reference |
|---------|----------|-----------|
| Scenario not found | Regenerate registry, check ID | [Writing Scenarios](../writing-scenarios.md) |
| Inputs not applied | Check signal usage, regenerate registry | [Agent Skill](../../.github/skills/cocoar-scenarios/SKILL.md) |
| Test times out | Increase timeout, check selector | [Testing Guide](../testing.md) |
| Directive not working | Import directive, check host component | [Agent Skill](../../.github/skills/cocoar-scenarios/SKILL.md) |
| Service not injected | Add to providers array | [Agent Skill](../../.github/skills/cocoar-scenarios/SKILL.md) |
---

## Contributing

When adding new components, directives, or services:

1. ✅ Create scenario file(s) with at least 3 variations
2. ✅ Follow naming conventions: `{name}.scenario.ts`
3. ✅ Use unique scenario IDs: `category/component/variant`
4. ✅ Write Playwright tests for key behaviors
5. ✅ Tag tests appropriately: `@ui-components`, `@a11y`, etc.
6. ✅ Update showcase app with usage examples

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for complete guidelines.

---

## Summary

**For AI Agents:**
- Use [Agent Skill](../../.github/skills/cocoar-scenarios/SKILL.md) for concise templates and workflow
- GitHub Copilot loads this automatically when working with scenarios

**For Humans:**
- Read [Writing Scenarios](../writing-scenarios.md) for comprehensive guide
- Reference [Codec System](./codec-system.md) for advanced serialization
- Check [Testing Guide](../testing.md) for running tests

**Key Files:**
- Scenario definitions: `libs/**/**.scenario.ts`
- Registry: `apps/scenar-backstage/src/app/registry.generated.ts`
- Tests: `apps/scenar-backstage-e2e/src/**.spec.ts`
- Backstage app: `apps/scenar-backstage/`

**Questions?**
- Check existing scenarios in `libs/ui/components/src/lib/*/`
- Review [ARCHITECTURE.md](../../ARCHITECTURE.md) for system design
- See [AGENTS.md](../../AGENTS.md) for AI assistant guidelines
