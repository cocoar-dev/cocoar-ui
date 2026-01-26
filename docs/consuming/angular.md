# Consuming Cocoar UI in an Angular app

This repo ships Angular libraries under the `@cocoar/*` scope.

## Available Packages

- **@cocoar/ui** - Complete UI package (recommended for most projects) - includes tokens
- **@cocoar/ui-components** - Core components (buttons, inputs, cards, etc.)
- **@cocoar/ui-menu** - Menu and navigation components
- **@cocoar/ui-overlay** - Overlay service (tooltips, popovers, dialogs)
- **@cocoar/ui-tokens** - Design tokens (CSS variables) - required
- **@cocoar/markdown-viewer** - Markdown rendering component
- **@cocoar/logging** - Logging utilities

## Install

### Option 1: Complete Package (Recommended)

```bash
npm install @cocoar/ui
```

This installs all UI components, menus, overlay service, and design tokens.

### Option 2: Individual Packages

For more control or smaller bundles:

```bash
npm install @cocoar/ui-components @cocoar/ui-menu @cocoar/ui-tokens
```

Note: `@cocoar/ui-tokens` is always required for styling to work.

## Setup CSS

### 1. Import Design Tokens (Required)

Add this to your global stylesheet (e.g. `src/styles.css`):

```css
@import '@cocoar/ui-tokens/css/all.css';
```

This imports all CSS variables for colors, typography, spacing, shadows, etc.

### 2. Install Fonts (Required)

Cocoar uses **Poppins** (body text) and **Inter** (titles) from Google Fonts.

Add to your `index.html` in the `<head>` section:

```html
<!-- Google Fonts: Inter (Titles) + Poppins (Body) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

**Alternative (self-hosted):** Download the fonts and add `@font-face` rules to your CSS if you prefer not to use Google Fonts CDN.

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
- `coar-plain-date-picker`
- `coar-plain-date-time-picker`
- `coar-single-select`
- `coar-multi-select`
- `coar-tag-select`

Signal Forms (Angular 21+) are now available but not yet integrated into Cocoar components.

Track the current status and recommended approach in:
- `docs/recipes/forms-status.md`

If you need a form control that is not CVA-enabled yet, use native inputs temporarily.
