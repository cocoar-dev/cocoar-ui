# Cocoar Scenarios — Agent Skill

> **For AI Agents:** How to create scenarios for component testing in Cocoar.

---

## Quick Facts

- **Scenarios** = Isolated component instances for Playwright testing
- **File pattern**: `*.scenario.ts` co-located with component
- **Helper**: `defineScenario<T>()` from `@cocoar/scenar-abstractions`
- **Auto-discovery**: Registry generator finds all `*.scenario.ts` files
- **Default practice**: Create scenarios for all new components/features
- **Integrated testing**: One scenario can test service + pipe + directive together (more reliable than Vitest with heavy mocking)

---

## Templates

### Component (Simple)

```typescript
// libs/ui-components/src/lib/coar-button/button.scenario.ts
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarButtonComponent } from './coar-button.component';

export const scenario = defineScenario<CoarButtonComponent>({
  id: 'button',  // Unique ID for URL
  title: 'Button',
  description: 'Default button',
  // inputs: auto-generated from component defaults
  // Only add inputs if you want custom defaults!
});
```

### Component with Providers

```typescript
// libs/ui-components/src/lib/coar-icon/icon.scenario.ts
import { defineScenario } from '@cocoar/scenar-abstractions';
import { provideHttpClient } from '@angular/common/http';
import { CoarIconComponent } from './coar-icon.component';
import { CoarIconService } from './coar-icon.service';

export const scenario = defineScenario<CoarIconComponent>({
  id: 'icon',
  providers: [provideHttpClient(), CoarIconService],
  // No inputs needed - pass via openScenario() in test
});
```

### Directive (Host Component)

```typescript
// libs/ui-components/src/lib/coar-tooltip/tooltip.scenario.ts
import { Component, input } from '@angular/core';
import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarTooltipDirective } from './coar-tooltip.directive';

@Component({
  selector: 'coar-tooltip-scenario',
  standalone: true,
  imports: [CoarTooltipDirective],
  template: `<button [coarTooltip]="text()">Hover</button>`,
})
export class CoarTooltipScenarioComponent {
  text = input<string>('Help text');
}

export const scenario = defineScenario<CoarTooltipScenarioComponent>({
  id: 'tooltip',
  // inputs: optional - pass via openScenario()
});
```

### Integrated Scenario (Service + Pipe + Directive)

```typescript
// libs/localization/src/lib/localization.scenario.ts
import { Component, inject, signal } from '@angular/core';
import { defineScenario } from '@cocoar/scenar-abstractions';
import { LocalizationService } from './localization.service';
import { TranslatePipe } from './translate.pipe';
import { LocaleDirective } from './locale.directive';

@Component({
  selector: 'coar-localization-scenario',
  standalone: true,
  imports: [TranslatePipe, LocaleDirective],
  template: `
    <div [locale]="currentLocale()">
      <h3>{{ 'common.welcome' | translate }}</h3>
      <p>{{ 'common.description' | translate }}</p>
      <button (click)="switchLocale()">Switch to {{ nextLocale() }}</button>
    </div>
  `,
})
export class LocalizationScenarioComponent {
  private localizationService = inject(LocalizationService);
  currentLocale = signal('en');

  nextLocale() {
    return this.currentLocale() === 'en' ? 'de' : 'en';
  }

  switchLocale() {
    const next = this.nextLocale();
    this.currentLocale.set(next);
    this.localizationService.setLocale(next);
  }
}

export const scenario = defineScenario<LocalizationScenarioComponent>({
  id: 'localization',
  title: 'Localization (Service + Pipe + Directive)',
  providers: [LocalizationService],
  // Tests service.setLocale(), translate pipe, and locale directive together
});
```

---

## Workflow

```bash
# 1. Create scenario file (use template above)
# 2. Regenerate registry
node scripts/scenar/generate-registry.mjs

# 3. Start backstage app
nx serve scenar-backstage

# 4. Access scenario
# http://localhost:4300/__scenario/{id}

# 5. Write Playwright test
# apps/scenar-backstage-e2e/src/{component}.spec.ts
```

---

## Playwright Test Example

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

## Rules

- ❌ Do NOT include `component` property (auto-generated)
- ❌ Do NOT include `inputs` unless you need custom defaults (auto-generated from component)
- ✅ Use unique scenario IDs (`component` or `component/variant`)
- ✅ Name file `*.scenario.ts` (required for auto-discovery)
- ✅ Place next to component source file
- ✅ For directives/services: create host component wrapper
- ✅ Include providers if component has dependencies
- ✅ Pass actual input values via `openScenario()` in tests

---

## Complex Inputs
```typescript
// Only add inputs if you need different defaults
// Usually you pass them in openScenario() instead:
await openScenario(page, 'date-picker', {
  date: new Date('2025-01-15T12:00:00Z'),
  config: { theme: 'dark', autoHide: true },
  items: ['a', 'b', 'c'],
}); config: { theme: 'dark', autoHide: true },
  items: ['a', 'b', 'c'],
}
```

---

## Multiple Scenarios

```typescript
// Only needed when you want different component providers per scenario
// Most components: just create one scenario, vary inputs in tests
export const defaultScenario = defineScenario<T>({ id: 'badge/default' });
export const successScenario = defineScenario<T>({ id: 'badge/success' });

// In test: pass different inputs to same scenario
await openScenario(page, 'badge/default', { variant: 'success', label: 'OK' ... });
export const errorScenario = defineScenario<T>({ id: 'badge/error', ... });
```

---

## Reference

- Full docs: [docs/writing-scenarios.md](../../../docs/writing-scenarios.md)
- Codec details: [docs/scenar/codec-system.md](../../../docs/scenar/codec-system.md)
- Testing guide: [docs/testing.md](../../../docs/testing.md)
