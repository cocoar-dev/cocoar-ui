# Consuming Cocoar UI in an Angular app

This repo ships Angular libraries under the `@cocoar/*` scope.

## Install

```bash
npm i @cocoar/ui-components @cocoar/ui-tokens @cocoar/logging @cocoar/logging-abstractions
```

## Enable design tokens (required)

Import tokens once in your global stylesheet (e.g. `styles.css`):

```css
@import '@cocoar/ui-tokens/css/all.css';
```

## Dark mode

Add the `dark-mode` class to a parent element (commonly `html`):

```html
<html class="dark-mode"></html>
```

## Use components (standalone)

```ts
import { Component } from '@angular/core';
import { CoarButtonComponent, CoarCardComponent } from '@cocoar/ui-components';

@Component({
  standalone: true,
  imports: [CoarButtonComponent, CoarCardComponent],
  template: `
    <coar-card>
      <coar-button>Login</coar-button>
    </coar-card>
  `,
})
export class ExampleComponent {}
```

## Current limitation: form controls

Coar now supports Angular forms via `ControlValueAccessor` for:

- `coar-text-input`
- `coar-password-input`
- `coar-number-input`
- `coar-checkbox`

Signal Forms (Angular 21+) are now available but not yet integrated into Cocoar components.

Track the current status and recommended approach in:
- `docs/recipes/forms-status.md`

If you need a form control that is not CVA-enabled yet, use native inputs temporarily.
