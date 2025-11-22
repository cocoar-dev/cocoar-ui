# ARCHITECTURE.md — Technical Architecture for the Coar Design System

This document defines the technical architecture, patterns, and constraints for the **cocoar-ui** repository.

**Related Documents:**
- [AGENTS.md](AGENTS.md) — AI assistant behavior and guidelines
- [NAMING.md](NAMING.md) — Naming conventions
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution workflow for humans

---

## 🎯 Purpose

The **Coar Design System** is an Nx monorepo providing:

* **Angular-based UI component libraries** (`@cocoar/ui-*`)
* **Design tokens** generated from Figma
* **Shared logging infrastructure** (`@cocoar/logging-core`)
* **Storybook documentation** for all components
* High-quality, brand-consistent UI components

---

## 📁 Repository Structure

```
cocoar-ui/
├── libs/
│   ├── ui-tokens/          # Design tokens from Figma
│   ├── ui-core/            # Core UI components
│   ├── ui-forms/           # Form components
│   ├── ui-grid/            # Data grid component
│   ├── ui-icons/           # Icon system
│   └── logging-core/       # Structured logging library
├── apps/
│   ├── storybook/          # Component documentation
│   └── storybook-e2e/      # Playwright E2E tests
├── docs/                   # Additional documentation
└── .local/                 # Git-ignored local working files
```

---

## 🏗️ Architecture Rules

### Framework Purity

All UI libraries **must** be framework-pure:

* ❌ No Tailwind CSS
* ❌ No global CSS
* ❌ No styling assumptions
* ✅ Only CSS variables
* ✅ Isolated, reusable components
* ✅ Scoped component styles

### Nx Monorepo Structure

* Use Nx workspace structure
* Leverage build caching
* Share code via libraries, not copy-paste
* Keep libraries focused and single-purpose

---

## 🎨 Design Token System

### Token Source: Figma

* **All visual/styling decisions** come from design tokens exported from Figma
* UI components **must not** hardcode colors, spacing, radius, or fonts
* Styling **always** routes through CSS variables

### Token Usage Rules

**Never bypass the token system:**

```css
/* ❌ BAD - Hardcoded value */
background: #2563eb;
padding: 16px;

/* ✅ GOOD - CSS variables with fallback */
background: var(--coar-color-primary, #2563eb);
padding: var(--coar-spacing-4, 1rem);
```

**When tokens don't exist yet:**

```css
/* Fallback to primary color because hover tokens don't exist in all themes yet */
/* TODO: Remove fallback when all themes define --coar-button-hover (Q2 2025) */
background: var(--coar-button-hover, var(--coar-color-primary));
```

### Token Structure

```
--coar-color-*         # Colors
--coar-spacing-*       # Spacing scale
--coar-radius-*        # Border radius
--coar-font-family-*   # Fonts
--coar-font-size-*     # Font sizes
--coar-shadow-*        # Shadows
```

See [NAMING.md](NAMING.md) for complete token naming conventions.

---

## 🧩 Component Development

### Component Structure

```typescript
@Component({
  selector: 'coar-button',              // See NAMING.md for prefix
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush  // Performance
})
export class CoarButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();
}
```

### Styling Rules

**Only CSS variables:**

```css
.coar-button {
  background: var(--coar-color-primary);
  padding: var(--coar-spacing-2) var(--coar-spacing-4);
  border-radius: var(--coar-radius-md);
}

.coar-button:hover {
  background: var(--coar-button-hover, var(--coar-color-primary-dark));
}
```

**No SCSS in libraries:**
- SCSS can be used in **apps** (Storybook)
- Libraries must use plain CSS with variables

**Scoped styles only:**
- No global styles
- No style leakage outside component

### Public API Discipline

**Keep APIs small and predictable:**

```typescript
// ✅ GOOD - Focused, typed, predictable
@Input() variant: 'primary' | 'secondary' = 'primary';
@Input() disabled = false;
@Output() clicked = new EventEmitter<void>();

// ❌ BAD - Too flexible, untyped
@Input() config: any;
@Input() options: Record<string, unknown>;
```

**No business logic in UI libraries:**
- Components are presentation only
- Business logic belongs in consuming applications

---

## 📝 Logging Architecture

### Logging Core Library

**All logging must use `@cocoar/logging-core`:**

```typescript
import { Logger } from '@cocoar/logging-core';

// ✅ GOOD - Structured logging
logger.debug('Row selected {RowId}', { RowId: row.id });

// ❌ BAD - Direct console
console.log('Row selected:', row.id);
```

### Logging Rules

**Libraries:**
- Use `@cocoar/logging-core`
- Do not configure sinks
- Do not set log levels
- Use structured logging format

**Applications (Storybook, etc.):**
- Configure sinks
- Set minimum log levels
- Add Playwright sinks for testing

**Security:**
- Never log secrets, tokens, passwords, or PII
- Sanitize user input before logging
- Use log redaction for sensitive fields

---

## 📚 Storybook Guidelines

### Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { CoarButtonComponent } from './button.component';

const meta: Meta<CoarButtonComponent> = {
  title: 'UI/Forms/Button',
  component: CoarButtonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CoarButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    disabled: false,
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
```

### Story Guidelines

- Keep stories small and focused
- Import `@cocoar/ui-tokens` globally in Storybook config
- Never add Tailwind to Storybook
- Include stories for all states, themes, and interactions
- Document component inputs/outputs in stories
- Use consistent grouping (UI/Forms/, UI/Grid/, etc.)

---

## ⚡ Performance Patterns

### Change Detection

**Use OnPush where appropriate:**

```typescript
@Component({
  selector: 'coar-grid',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoarGridComponent {
  // Component will only check when inputs change or events fire
}
```

### Template Optimization

**Always use trackBy for dynamic lists:**

```typescript
<div *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</div>

trackById(index: number, item: any): any {
  return item.id;
}
```

### Performance Comments

Document trade-offs:

```typescript
// Using IntersectionObserver instead of scroll events to reduce main thread work
// Improves performance for large grids with 1000+ rows
const observer = new IntersectionObserver(callback);

// Using deep clone here because grid data is mutated by external code
// Alternative approaches (immutable updates) require breaking changes
const dataCopy = structuredClone(this.data);
```

---

## 🔒 Security Patterns

### XSS Prevention

**Use Angular's built-in sanitization:**

```typescript
import { DomSanitizer, SecurityContext } from '@angular/platform-browser';

// ✅ GOOD - Sanitized
this.safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, userInput);

// ❌ BAD - XSS vulnerability
this.innerHTML = userInput;
```

**Use Angular binding:**

```html
<!-- ✅ GOOD - Angular binding -->
<div [innerHTML]="safeContent"></div>

<!-- ❌ BAD - Direct manipulation -->
<div id="content"></div>
<script>
  document.getElementById('content').innerHTML = data;
</script>
```

### Input Validation

**Validate early and fail with clear messages:**

```typescript
if (!variant || !['primary', 'secondary'].includes(variant)) {
  throw new TypeError(
    `Invalid variant "${variant}". Expected "primary" or "secondary".`
  );
}
```

### Secrets Management

- Never hardcode secrets, API keys, or credentials
- Never commit secrets to version control
- Never log sensitive data
- Use environment variables or secure vaults

---

## 📦 Dependencies

### Dependency Policy

**Minimize dependencies:**
- Every dependency adds risk and bundle size
- Prefer stable, widely used libraries
- Avoid experimental or unmaintained libraries

**Before adding a dependency, ask:**
1. Can this be implemented simply without a library?
2. Is this library actively maintained?
3. What's the bundle size impact?
4. Does it work with our Angular version?
5. Does it conflict with existing dependencies?

**Document major dependencies:**
- Why it was chosen
- What alternatives were considered
- Bundle size impact

---

## 📂 Local Working Files (`.local/`)

A repository-scoped **`.local/`** folder may exist and is **git-ignored**.

### ✅ Appropriate Uses

* Release preparation checklists and scratch notes
* Generated diff analyses or API inventories
* Draft design explorations not yet ready for review
* Meeting notes or discussion artifacts
* Personal TODO lists or investigation notes
* Temporary test data or sample files
* Storybook screenshot comparisons

### ❌ Inappropriate Uses

* **Secrets or credentials** — Use OS keychain/secret manager instead
* **Build artifacts** — Use `dist/`, `node_modules/`, or dedicated build output directories
* **Shared documentation** — Belongs in `/docs/` under version control
* **Configuration templates** — Belongs in repo with `.example` suffix
* **Production data** — Never store real user data, even temporarily

### 🔒 Rules

* **Not authoritative**: Never reference `.local/` from README, docs, code, or CI. Do not assume it exists.
* **No release artifacts**: Nothing from `.local/` should ship in packages, images, or releases.
* **Security**: Avoid storing secrets in plaintext even here; prefer local secret stores/encrypted files. Never promote `.local/` content into the repo without review.

---

## 🔗 Cross-Library Dependencies

### Library Dependency Rules

**Avoid cross-library dependencies unless intentional:**

```
ui-tokens ← ui-core ← ui-forms    ✅ GOOD
ui-tokens ← ui-core ← ui-grid     ✅ GOOD

ui-forms ← ui-grid                ❌ BAD - Creates coupling
```

**Shared utilities:**
- Extract to separate library if needed by multiple libraries
- Document the dependency relationship
- Keep the shared library minimal and stable

---

## 📊 Quality Metrics

### Bundle Size

- Monitor bundle size impact of changes
- Use tree-shaking friendly patterns
- Avoid barrel exports that prevent tree-shaking
- Document size budget for libraries

### Test Coverage

- Maintain test coverage above baseline
- Don't let coverage regress significantly
- Focus on behavior, not raw percentages
- Test accessibility features

---

**Version:** 1.0.0

> This document defines the technical architecture for the Coar Design System.
> It should be read alongside AGENTS.md, NAMING.md, and CONTRIBUTING.md.
