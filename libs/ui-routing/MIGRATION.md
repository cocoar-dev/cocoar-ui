# @cocoar/ui-routing - Migration Complete

## ✅ Successfully Created

New library `@cocoar/ui-routing` following Cocoar design system patterns.

### 📦 Structure

```
libs/ui-routing/
├── src/
│   ├── lib/
│   │   └── routed-fragments/
│   │       ├── routed-fragment.ts         # Core types (overlay-agnostic)
│   │       ├── fragment-parser.ts         # URL fragment parser
│   │       ├── routed-fragment.service.ts # Angular service
│   │       ├── create-route-data.ts       # Helper utilities
│   │       └── index.ts
│   ├── index.ts                           # Public API exports
│   └── test-setup.ts
├── package.json                           # @cocoar/ui-routing metadata
├── project.json                           # Nx configuration
├── ng-package.json                        # Angular Package Format config
├── README.md                              # Comprehensive documentation
└── tsconfig.*.json                        # TypeScript configurations
```

### 🔧 Key Changes from Original

#### 1. **Base Interface Pattern (Extensible, Not Union Type)**
**Before (timetodo):**
```typescript
// Union type - can't be extended by consumers
export type RoutedFragment<TOptions> =
  | ModalRoutedFragment<TOptions>
  | ActionRoutedFragment;

// If you want a new type, you can't add it
```

**After (@cocoar/ui-routing):**
```typescript
// Base interface - extensible via inheritance
export interface RoutedFragmentBase<TOptions = unknown> {
  type: string;
  path: string;
  options?: TOptions;
}

// Built-in types extend the base
export interface ComponentRoutedFragment<TOptions> extends RoutedFragmentBase<TOptions> {
  type: 'component';
  loadComponent: () => Type<unknown> | Promise<Type<unknown>>;
}

// Consumers can create their own types!
export interface DrawerRoutedFragment extends RoutedFragmentBase<DrawerConfig> {
  type: 'drawer';
  loadComponent: () => Type<unknown> | Promise<Type<unknown>>;
  side: 'left' | 'right';
}
```

**Why?** Base interface allows consumers to extend with their own fragment types. No need to modify the library.

#### 2. **Generic Component Loading (Not Modal-Specific)**
**Before (timetodo):**
```typescript
import { ModalComponentOverlayBuilder } from '../overlay';

interface ModalRoutedFragment {
  type: 'modal'; // Implies built-in modal support
  modalOptions?: (builder: Omit<ModalComponentOverlayBuilder<unknown>, 'fromComponent'>) => void;
}
```

**After (@cocoar/ui-routing):**
```typescript
// No UI assumptions - works with modals, drawers, panels, etc.
interface ComponentRoutedFragment<TOptions = unknown> {
  type: 'component'; // Generic component loading
  options?: TOptions; // Consumer provides their config type
}
```

**Why?** The library doesn't know or care about modals—it just parses fragments and loads components. The modal-specific logic lives in consumer code (like `RoutedModalService` in timetodo).

#### 2. **Enhanced Documentation**
- JSDoc comments on all public APIs
- Usage examples in TypeScript
- Integration patterns for different overlay systems
- Accessibility considerations

#### 3. **Proper Package Metadata**
- Apache-2.0 license
- Keywords for discoverability
- Correct peer dependencies (`@angular/router`, `rxjs`)
- Repository and issue tracking URLs

### 📋 Build Configuration

**Dependencies:**
- `path-to-regexp` - Path pattern matching (bundled as allowed non-peer dependency)
- Peer dependencies: Angular 21+, RxJS 7.8+

**Build targets:**
- ✅ `nx build ui-routing` - Angular Package Format (APF)
- ✅ `nx test ui-routing` - Vitest unit tests
- ✅ `nx lint ui-routing` - ESLint

### 🎯 Integration Example (for timetodo)

```typescript
// In timetodo: Create a service that bridges fragments → modal system

import { Injectable, inject } from '@angular/core';
import { RoutedFragmentService, ComponentRoutedFragment } from '@cocoar/ui-routing';
import { ModalComponentOverlayBuilder } from '@timetodo/overlay';

// Define your modal-specific options type
type ModalOptions = (builder: ModalComponentOverlayBuilder) => void;

// Create typed component fragments for modals
type ModalFragment = ComponentRoutedFragment<ModalOptions>;

@Injectable({ providedIn: 'root' })
export class RoutedModalService {
  private modalService = inject(DUIModalService);
  private fragmentService = inject(RoutedFragmentService);
  private openModals = new Map<string, any>();

  constructor() {
    // Subscribe to component fragments and treat them as modals
    this.fragmentService.getParsedFragments('component').subscribe(async items => {
      const currentFragments = new Set(items.map(item => item.fragment));

      // Open new modals
      for (const item of items) {
        if (!this.openModals.has(item.fragment)) {
          const component = await item.route.loadComponent();
          const handle = await this.modalService.openModalFromComponent(
            component,
            item.params,
            (builder) => {
              // Apply consumer-provided modal options
              if (typeof item.route.options === 'function') {
                item.route.options(builder);
              }
              // Hook up close handler
              builder.onClosed(() => {
                this.openModals.delete(item.fragment);
                this.fragmentService.removeFragmentPart(item.fragment);
              });
            }
          );
          this.openModals.set(item.fragment, handle);
        }
      }

      // Close removed modals
      for (const fragment of Array.from(this.openModals.keys())) {
        if (!currentFragments.has(fragment)) {
          this.openModals.get(fragment).close();
          this.openModals.delete(fragment);
        }
      }
    });
  }
}

// Usage in route configuration:
const routes = [{
  path: 'dashboard',
  component: DashboardComponent,
  data: {
    routedFragments: [
      {
        type: 'component',
        path: 'details/:id',
        loadComponent: () => import('./details-modal.component'),
        options: (builder) => builder.withWidth('800px')
      }
    ] as ModalFragment[]
  }
}];
```

### 📚 Next Steps

1. **Port to timetodo** — Replace local `routed-fragments` with `@cocoar/ui-routing`
2. **Create scenarios** — Add Playwright tests per `.github/skills/cocoar-scenarios/SKILL.md`
3. **Showcase integration** — Demonstrate fragment routing in showcase app
4. **Consider publishing** — Package is npm-ready when ready to release

### 🔗 Public API Exports

```typescript
// Base type (extend this!)
export { RoutedFragmentBase }

// Built-in implementations
export { ComponentRoutedFragment }  // Generic component loading
export { ActionRoutedFragment }     // Side effects without UI

// Configuration
export { IRoutedFragmentConfig }

// Parsing
export { ParsedRoute }
export { parseFragment }

// Service
export { RoutedFragmentService }

// Utilities
export { createRouteData }
```

### ✨ Benefits

- **Extensible** — Create custom fragment types via inheritance (drawers, toasts, panels, etc.)
- **Type-safe** — Full TypeScript inference with generics
- **Framework-pure** — No assumptions about UI systems
- **Well-documented** — README + JSDoc comments + extensibility examples
- **Tested** — 8 passing unit tests
- **Publishable** — Ready for npm
- **Correctly Named** — Base interface pattern, no false promises

---

**Version:** 0.1.0
**Status:** ✅ Built successfully
**Location:** `libs/ui-routing` → `dist/libs/ui-routing`
