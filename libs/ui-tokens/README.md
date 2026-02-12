# @cocoar/ui-tokens

CSS variables (design tokens) for the Cocoar Design System.

## 📦 What's Inside

This library contains a set of CSS files that define Cocoar design tokens as CSS variables.

- CSS variables for colors, spacing, typography, radius, shadows, etc.
- A convenience import file: `@cocoar/ui-tokens/css/all.css`

## 🚀 Usage

### In Global Styles

```css
/* styles.css */
@import '@cocoar/ui-tokens/css/all.css';

:root {
  /* All design tokens are now available as CSS variables */
}
```

## 🌗 Dark Mode

Light mode is the default (`:root`).

To enable dark mode, add the `dark-mode` class to a parent element (commonly the `html` element):

```html
<html class="dark-mode">
  <!-- ... -->
</html>
```

## 📋 Token Categories

- **Colors**: `--coar-color-*`
- **Typography**: `--coar-font-*`, `--coar-text-*`
- **Spacing**: `--coar-spacing-*`
- **Borders**: `--coar-border-*`
- **Shadows**: `--coar-shadow-*`
- **Breakpoints**: `--coar-breakpoint-*`

## 🏗️ Build Output

```
dist/libs/ui-tokens/
├── css/
│   └── all.css
├── src/
│   ├── index.js
│   └── index.d.ts
└── package.json
```

## 📦 Publishing

```bash
# Build
nx build ui-tokens

# Publish
nx release publish
```

## 🔗 Related Packages

- `@cocoar/ui-components` - Angular UI components that use these tokens
---

**Version:** 0.0.1
**License:** Apache-2.0
