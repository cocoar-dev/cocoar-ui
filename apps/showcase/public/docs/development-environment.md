# Development Environment Setup

> **Status:** ✅ Complete  
> **Last Updated:** November 23, 2025

This document describes the development environment configuration for the Cocoar Design System repository.

---

## 🛠️ Tooling Overview

### Prettier (Code Formatting)
- **Config:** `.prettierrc`
- **Ignore:** `.prettierignore` (excludes `*.md`, lock files, generated files)
- **Key settings:**
  - Single quotes
  - 2-space indentation
  - 100-character line width
  - LF line endings
  - Angular HTML parser for templates (150-char width)
  
**Usage:**
```bash
# Check formatting
pnpm exec prettier --check .

# Auto-fix formatting
pnpm exec prettier --write .
```

### ESLint (Code Quality)
- **Config:** `eslint.config.mjs` (root) + per-library configs
- **Key features:**
  - Nx module boundary enforcement
  - TypeScript best practices
  - Angular-specific rules (components, templates)
  - No `console.log` (use `@cocoar/logging`)
  - Prefer `const` over `let`
  - Relaxed rules for test files (`*.spec.ts`, `*.test.ts`)
  
**Usage:**
```bash
# Lint all projects
pnpm nx run-many --target=lint --all

# Lint specific project
pnpm nx lint ui-components

# Auto-fix issues
pnpm nx lint ui-components --fix
```

### EditorConfig
- **Config:** `.editorconfig`
- **Key settings:**
  - UTF-8 encoding
  - 2-space indentation
  - LF line endings
  - Trim trailing whitespace
  - 100-character line width

### VS Code
- **Config:** `.vscode/settings.json`
- **Extensions:** `.vscode/extensions.json`

**Recommended Extensions:**
- Nx Console (`nrwl.angular-console`)
- Angular Language Service (`angular.ng-template`)
- Prettier (`esbenp.prettier-vscode`)
- ESLint (`dbaeumer.vscode-eslint`)
- EditorConfig (`editorconfig.editorconfig`)
- Playwright (`ms-playwright.playwright`)
- Code Spell Checker (`streetsidesoftware.code-spell-checker`)

**Key Settings:**
- Format on save (enabled)
- Auto-fix ESLint on save
- ESLint flat config support (eslint.config.mjs)
- TypeScript import organization
- Angular verbose logging
- Exclude `node_modules`, `dist`, `.angular` from search

### Spell Checking
- **Config:** `.vscode/cspell.json`
- **Purpose:** Avoid warnings for project-specific terms
- **Custom words:** cocoar, coar, nx, vitest, figma, etc.

---

## 📋 Nx Module Boundaries

ESLint enforces strict dependency rules:

| Source Tag | Can Depend On |
|------------|---------------|
| `type:ui` | `type:ui`, `type:util`, `type:data` |
| `type:util` | `type:util` only |
| `scope:shared` | `scope:shared` only |

**Example:**
```typescript
// ✅ ALLOWED: UI component importing design tokens
import { tokens } from '@cocoar/ui-tokens';

// ❌ BLOCKED: Utility library importing UI component
import { Button } from '@cocoar/ui-components'; // ERROR!
```

---

## 🎨 Angular-Specific Rules

### Component Rules
- ✅ Prefix: `coar` (e.g., `<coar-button>`)
- ✅ Class suffix: `Component` (e.g., `ButtonComponent`)
- ✅ Selector style: `kebab-case`
- ⚠️ Prefer `OnPush` change detection
- ❌ No input/output renaming
- ❌ No host metadata property

### Directive Rules
- ✅ Prefix: `coar` (e.g., `coarTooltip`)
- ✅ Class suffix: `Directive`
- ✅ Selector style: `camelCase`

### Template Rules
- ✅ Use `trackBy` for `*ngFor`
- ❌ No negated async pipe (use `!`)

---

## 🚀 Quick Commands

```bash
# Format all files
pnpm exec prettier --write .

# Lint all projects
pnpm nx run-many --target=lint --all

# Lint with auto-fix
pnpm nx lint ui-components --fix

# Run all tests
pnpm nx run-many --target=test --all

# Build all libraries
pnpm nx run-many --target=build --all

# Build design tokens
pnpm nx build ui-tokens
```

---

## ✅ Pre-Commit Checklist

Before committing code:

1. **Format:** `pnpm exec prettier --write .`
2. **Lint:** `pnpm nx run-many --target=lint --all`
3. **Test:** `pnpm nx run-many --target=test --all`
4. **Build:** `pnpm nx build <library-name>`
5. **Review:** Check git diff for unintended changes

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.prettierrc` | Code formatting rules |
| `.prettierignore` | Files to skip formatting (READMEs, lock files, etc.) |
| `.editorconfig` | Cross-editor consistency |
| `eslint.config.mjs` | Root ESLint configuration (flat config) |
| `.vscode/settings.json` | VS Code workspace settings |
| `.vscode/extensions.json` | Recommended extensions |
| `.vscode/cspell.json` | Spell checker dictionary |
| `.pnpm-allow-scripts.json` | Approved pnpm build scripts |

---

## 📚 Related Documentation

- [AGENTS.md](../AGENTS.md) - AI assistant guidelines
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Technical architecture
- [NAMING.md](../NAMING.md) - Naming conventions
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines

---

**Version:** 1.0.0  
**Environment:** Angular 20.3, Nx 22.1, Node 20+
