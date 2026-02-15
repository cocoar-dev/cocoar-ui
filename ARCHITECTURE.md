# ARCHITECTURE.md — Technical Architecture for the Coar Design System

This document defines the technical architecture, patterns, and constraints for the **cocoar-ui** repository.

**Related Documents:**
- [AGENTS.md](AGENTS.md) — AI assistant behavior and guidelines
- [NAMING.md](NAMING.md) — Naming conventions
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution workflow for humans

---

## 🎯 Purpose

The **Coar Design System** is an Nx monorepo providing:

* **Angular-based UI component libraries** (`@cocoar/ui/*`)
* **Design tokens** delivered as CSS variables (`@cocoar/ui`)
* **A showcase app** for interactive component previews
* High-quality, brand-consistent UI components

---

## 🛠️ Technology Baseline

This repository currently targets the following stack:

- **Angular:** 21.x
- **Nx:** 22.x
- **Node.js:** 22.x

**Rationale:**

- Angular 21 is fully supported by Nx.
- Angular 21 features (Signal Forms, enhanced signal APIs) are now available and stable.
- We maintain a *boring, stable* foundation for the Coar Design System with clear migration paths for future versions.

---

## 📦 Nx Usage Strategy

Nx is used as an orchestration and monorepo tool:

- to manage multiple libraries and apps,
- to provide `affected` / project graph / caching,
- to standardise generators and targets.

Nx is **not** a replacement for Angular's own build system; where possible, we keep close to official Angular executors.

### Executors / Builders Policy

We standardise on the following:

1. **Angular applications** (showcase app, future styleguide app)
   - Use Angular's official executors where practical, wired through Nx targets:
     - e.g. `@angular-devkit/build-angular:application` (the recommended app builder for Angular 21).
   - Nx may wrap these, but we do not introduce multiple competing "ways" to build apps without updating this document.

2. **Angular publishable libraries**
   (e.g. `@cocoar/ui`, `@cocoar/ui/forms`, `@cocoar/ui/grid`, `@cocoar/ui/icons`)
   - MUST use: `@nx/angular:package`
   - This executor wraps **ng-packagr** and produces Angular Package Format (APF) libraries.
   - We treat `@nx/angular:package` as the **single source of truth** for packaging Angular libraries.
   - We do NOT introduce other package/build executors (e.g. `ng-packagr-lite`, custom builders) unless explicitly documented here.

3. **Non-Angular / pure TypeScript libraries**
   (e.g. `@cocoar/ts-utils`)
   - Built using simple TypeScript builds, e.g. `@nx/js:tsc` (or equivalent).
   - These libraries do **not** use ng-packagr.

### Integration with External Examples

When external docs/blogs refer to "builders" such as:

- `@angular-devkit/build-angular:browser-esbuild`
- `@angular-devkit/build-angular:ng-packagr`
- or custom third-party builders

We apply the following rules:

- For apps: map the builder to a Nx target `executor` using Angular's official executor name.
- For Angular libs: if they suggest `ng-packagr` directly, we model this via our standard `@nx/angular:package` executor.
- For non-Angular tooling: wrap CLI commands using `@nx/workspace:run-commands` or a dedicated Nx plugin, but always keep the number of patterns minimal.

Any deviation from this policy MUST be justified and documented in this file.

---

## 📁 Repository Structure

**Important:** The Nx workspace is located at the repository root.

```
cocoar-ui/                  # Nx workspace root
├── docs/                   # Repository-level documentation
├── .github/                # GitHub workflows and configuration
├── .local/                 # Git-ignored local working files
├── AGENTS.md               # AI assistant guidelines
├── ARCHITECTURE.md         # This file
├── NAMING.md               # Naming conventions
├── CONTRIBUTING.md         # Contribution guidelines
├── README.md               # Repository overview
├── libs/
│   ├── ui/
│   │   ├── styles/tokens/      # Design tokens as CSS variables
│   │   ├── components/         # Angular UI components
│   │   ├── menu/               # Menu components
│   │   └── overlay/            # Overlay/popover system
├── apps/
│   ├── showcase/             # Component showcase app
│   └── showcase-e2e/          # Playwright E2E tests
├── nx.json               # Nx configuration
├── package.json          # Workspace dependencies
└── tsconfig.base.json    # TypeScript base config
```

All Nx commands must be run from the repository root.

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
  border-radius: var(--coar-radius-m);
}

.coar-button:hover {
  background: var(--coar-button-hover, var(--coar-color-primary-dark));
}
```

**No SCSS in libraries:**
- SCSS can be used in **apps** (showcase)
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

## 📝 Logging

Logging packages (`@cocoar/logging`, `@cocoar/logging-abstractions`) have been extracted to the separate [`cocoar-logging`](https://github.com/cocoar-dev/cocoar-logging) repository. No `console.log` in libraries — use the logging packages from `cocoar-logging` instead.

---

## 📚 Showcase App Guidelines

The repository includes an Angular showcase app under `apps/showcase/`.

- The showcase app may use Tailwind (scoped to the app) for layout/spacing.
- Libraries must remain framework-pure (no Tailwind in publishable libs).
- Design tokens should be consumed via CSS imports from `@cocoar/ui/styles/tokens/*`.

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
* Screenshot comparisons from the showcase app

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
ui/styles/tokens ← ui/components   ✅ GOOD
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
