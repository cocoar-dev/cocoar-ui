# @cocoar/ui-routing

Fragment-based routing utilities for Angular applications. Enable deep-linkable components (modals, drawers, panels) and custom actions through URL fragments.

## Features

- **Fragment-as-Route Pattern** — Treat URL fragments (`#details/123`) like declarative routes
- **Path Parameter Extraction** — Use path patterns (`:id`, `:customer`) in fragments
- **Query Parameter Support** — Parse and type query parameters (`?edit=true&mode=advanced`)
- **Component Deep-linking** — Open any component via URL (modals, drawers, panels, etc.)
- **Action Handlers** — Execute side effects through fragment changes
- **Framework-Agnostic** — No assumptions about UI implementation (bring your own overlay system)
- **Type-Safe** — Full TypeScript support with inference

## Installation

```bash
npm install @cocoar/ui-routing
```

## Quick Start

### 1. Define Fragment Routes

```typescript
import { ComponentRoutedFragment, ActionRoutedFragment } from '@cocoar/ui-routing';

// For modals, drawers, or any component-based UI:
const fragments: ComponentRoutedFragment[] = [
  {
    type: 'component',
    path: 'details/:id',
    loadComponent: () => import('./details.component').then(m => m.DetailsComponent),
    options: { width: '800px', closeOnBackdrop: true } // Your custom config
  }
];

// For actions without UI:
const actionFragments: ActionRoutedFragment[] = [
  {
    type: 'action',
    path: 'logout',
    handler: () => authService.logout()
  }
];
```

### 2. Add to Route Configuration

```typescript
import { createRouteData, IRoutedFragmentConfig } from '@cocoar/ui-routing';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: createRouteData<IRoutedFragmentConfig>({
      routedFragments: fragments
    })
  }
];
```

### 3. React to Fragment Changes

```typescript
import { RoutedFragmentService } from '@cocoar/ui-routing';

@Component({ /* ... */ })
export class DashboardComponent {
  private fragmentService = inject(RoutedFragmentService);
  private modalService = inject(MyModalService); // Your modal implementation

  ngOnInit() {
    // Handle component fragments (modals, drawers, etc.)
    this.fragmentService.getParsedFragments('component').subscribe(components => {
      components.forEach(async item => {
        const component = await item.route.loadComponent();
        this.modalService.open(component, {
          data: item.params,
          ...item.route.options // Your custom options
        });
      });
    });

    // Handle action fragments
    this.fragmentService.getParsedFragments('action').subscribe(actions => {
      actions.forEach(item => item.route.handler(item.params));
    });
  }
}
```component via fragment
this.router.navigate([], { fragment: 'details/123?edit=true' });

// Multiple fragments (component + confirmation)
this.router.navigate([], { fragment: 'details/123#confirm' });

// Remove fragment (close component)
this.fragmentService.removeFragmentPart('details/123');
```

## API Reference

### Types

#### `ComponentRoutedFragment<TOptions>`
Configuration for component fragments (modals, drawers, panels, etc.) with generic options.

```typescript
interface ComponentRoutedFragment<TOptions = unknown> {
  type: 'component';
  path: string; // Path pattern (e.g., 'details/:id/:tab')
  loadComponent: () => Type<unknown> | Promise<Type<unknown>>;
  options?: TOptions; // Your custom
interface ModalRoutedFragment<TModalOptions = unknown> {
  type: 'modal';
  path: string; // Path pattern (e.g., 'details/:id/:tab')
  loadComponent: () => Type<unknown> | Promise<Type<unknown>>;
  modalOptions?: TModalOptions; // Your overlay config type
}
```

#### `ActionRoutedFragment`
Configuration for action fragments (no UI).

```typescript
interface ActionRoutedFragment extends RoutedFragmentBase<never> {
  type: 'action';
  handler: (params: any) => void;
  options?: never; // Actions don't have options
}
```

#### `IRoutedFragmentConfig<TFragment>`
Route data configuration. Generic parameter allows type-safe fragment arrays.

```typescript
interface IRoutedFragmentConfig<TFragment extends RoutedFragmentBase = RoutedFragmentBase> {
  routedFragments: TFragment[];
}
```

#### `ParsedRoute<T>`
Parsed fragment with extracted parameters.

```typescript
interface ParsedRoute<T extends RoutedFragment = RoutedFragment> {
  params: { [key: string]: any }; // Extracted path & query params
  route: T; // Matched route configuration
  fragment: string; // Original fragment string
}
```

### Services

#### `RoutedFragmentService`
component fragments (modals, drawers, etc.)
fragmentService.getParsedFragments('component').subscribe(components => {
  // Handle components
});

// Get action fragments
fragmentService.getParsedFragments('action').subscribe(actions => {
  // Handle actionmits parsed fragments filtered bycomponents).

```typescript
fragmentService.removeFragmentPart('details/123');
```

## Integration Examples

The library is completely generic and works with any UI system. Here are integration patterns:

### With Modals (Angular Material Dialog)

```typescript
import { MatDialogConfig } from '@angular/material/dialog';
import { ComponentRoutedFragment } from '@cocoar/ui-routing';

type ModalFragment = ComponentRoutedFragment<MatDialogConfig>;

const fragments: ModalFragment[] = [{
  type: 'component',
  path: 'details/:id',
  loadComponent: () => DetailsComponent,
  options: { width: '600px', hasBackdrop: true }
}];

// In component:
this.fragmentService.getParsedFragments('component').subscribe(items => {
  items.forEach(async item => {
    const component = await item.route.loadComponent();
    this.dialog.open(component, {
      data: item.params,
      ...item.route.options
    });
  });
});
```

### With Drawers/Side Panels

```typescript
interface DrawerConfig {
  position: 'left' | 'right';
  width: string;
}

type DrawerFragment = ComponentRoutedFragment<DrawerConfig>;

const fragments: DrawerFragment[] = [{
  type: 'component',
  path: 'settings',
  loadComponent: () => SettingsComponent,
  options: { position: 'right', width: '400px' }
}];
```

### With Custom Overlay System

```typescript
interface MyOverlayConfig {
  width?: string;
  closeOnEscape?: boolean;
  backdrop?: boolean;
}

type CustomFragment = ComponentRoutedFragment<MyOverlayConfig>;

// Create a service that bridges fragments → your overlay system
@Injectable({ providedIn: 'root' })
export class RoutedOverlayService {
  private fragmentService = inject(RoutedFragmentService);
  private overlayService = inject(MyOverlayService);

  constructor() {
    this.fragmentService.getParsedFragments('component').subscribe(items => {
      items.forEach(async item => {
        const component = await item.route.loadComponent();
        this.overlayService.open(component, {
          data: item.params,
          config: item.route.options
        });
      });
    });
  }
}loseOnEscape?: boolean;
}

type CustomModalFragment = ModalRoutedFragment<MyOverlayConfig>;

const fragments: CustomModalFragment[] = [{
  type: 'modal',
  path: 'settings',
  loadComponent: () => SettingsComponent,
  modalOptions: { width: '400px', closeOnEscape: true }
}];
```

## Advanced Usage

### Extending with Custom Fragment Types

The library uses a **base interface pattern** that allows you to create your own fragment types:

```typescript
import { RoutedFragmentBase } from '@cocoar/ui-routing';
import { Type } from '@angular/core';

// 1. Define your custom fragment type
export interface DrawerRoutedFragment extends RoutedFragmentBase<DrawerConfig> {
  type: 'drawer';
  side: 'left' | 'right';
  loadComponent: () => Type<unknown> | Promise<Type<unknown>>;
}

export interface DrawerConfig {
  width: string;
  backdrop?: boolean;
}

// 2. Create fragments
const drawerFragments: DrawerRoutedFragment[] = [{
  type: 'drawer',
  path: 'filters',
  side: 'left',
  loadComponent: () => import('./filters-drawer.component'),
  options: { width: '300px', backdrop: true }
}];

// 3. React to your custom type
this.fragmentService.getParsedFragments('drawer').subscribe(drawers => {
  drawers.forEach(async item => {
    const component = await item.route.loadComponent();
    // item.route is typed as DrawerRoutedFragment
    this.drawerService.open(component, item.route.side, item.route.options);
  });
});
```

### Multiple Fragments

```typescript
// URL: /page#details/123#confirm
// Opens both "details" component AND "confirm" component
```

### Query Parameters

```typescript
// Fragment: details/123?edit=true&tab=settings
// Parsed params: { id: '123', edit: true, tab: 'settings' }
```

### Dynamic Parameters

```typescript
{
  type: 'component',
  path: 'user/:userId/order/:orderId',
  loadComponent: () => OrderDetailsComponent
}

// Fragment: user/42/order/1337
// Params: { userId: '42', orderId: '1337' }
```

## Accessibility Considerations

⚠️ **Important:** Fragment changes do not automatically announce to screen readers. When opening components via fragments:

1. Ensure proper ARIA attributes (`role`, `aria-labelledby`, `aria-describedby`)
2. Trap focus within overlays
3. Return focus to trigger element on close
4. Consider announcing state changes with `aria-live` regions

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires Angular 21+ and Angular Router

## License

Apache-2.0

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

