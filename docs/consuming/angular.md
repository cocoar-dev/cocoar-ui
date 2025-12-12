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

As of today, Coar input-like components are **not** integrated with:

- Angular `ControlValueAccessor` (Reactive Forms / Template-driven forms)
- Signal Forms (Angular 21+) 

Track the current status and recommended temporary approach in:
- `docs/recipes/forms-status.md`

If you need a login form right now, use native `<input>` elements alongside Coar layout components.
