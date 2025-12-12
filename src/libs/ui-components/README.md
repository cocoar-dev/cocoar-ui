# @cocoar/ui-components

Angular component library for the Cocoar Design System.

## Installation

```bash
npm install @cocoar/ui-components @cocoar/ui-tokens
```

## Usage

### Import Components

```typescript
import { CoarCardComponent, CoarButtonComponent } from '@cocoar/ui-components';

@Component({
  imports: [CoarCardComponent, CoarButtonComponent],
  // ...
})
export class MyComponent {}
```

### Import Global Styles

Import design tokens (CSS variables) once in your global stylesheet:

```css
@import '@cocoar/ui-tokens/css/all.css';
```

### Layout & Spacing

This library provides **pure, layout-agnostic components**. Components do not include margin or spacing - that's the responsibility of the consuming application.

For layout and spacing, use whatever your application prefers (plain CSS, utility classes, etc.).

The Cocoar showcase app uses Tailwind with a `tw:` prefix (e.g. `tw:flex`, `tw:gap-6`):

```html
<div class="tw:flex tw:flex-col tw:gap-6">
  <coar-card>First card</coar-card>
  <coar-card>Second card</coar-card>
  <coar-code-block [code]="code">Code block</coar-code-block>
</div>
```

This approach:
- Keeps library components pure and reusable
- Gives consuming apps full control over layout
- Avoids conflicts with different layout requirements

## Running unit tests

Run `nx test ui-components` to execute the unit tests.
