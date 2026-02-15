# Design Review Plan

Consolidated findings from a full design system audit (Feb 2026) covering UI/UX, color system, documentation, and component readiness for IDP Server use case.

**Context:** The Coar Design System will power an IDP (Identity Provider) Server application requiring login pages, consent pages, user profile management, and admin UI with data grids.

---

## Phase 1: Critical Fixes — COMPLETE

### 1.1 WCAG Contrast Failures

- [x] **Warning badge contrast**: Changed `--coar-text-semantic-warning-bold` to `var(--coar-color-amber-900)` (dark text on amber background).
  - File: `libs/ui/styles/tokens/colors-usage.css`

- [x] **Info badge/card bold contrast**: Info-bold now uses white text on darkened slate-700 background. Dark mode uses slate-50 on slate-400.
  - File: `libs/ui/styles/tokens/colors-usage.css`

- [x] **Tertiary text contrast**: Darkened gray-700 from `#7b7b7b` to `#6b6b6b`.
  - File: `libs/ui/styles/tokens/colors-primitives-light.css`

- [x] **Primary text borderline**: Darkened gray-900 from `#545454` to `#444444`.
  - File: `libs/ui/styles/tokens/colors-primitives-light.css`

- [x] **Misassigned semantic subtle tokens**: Changed from -100 shades to 600-800 range (e.g., success-subtle now uses green-700, error-subtle uses red-700, warning-subtle uses amber-800, info-subtle uses slate-700).
  - File: `libs/ui/styles/tokens/colors-usage.css`

### 1.2 Undefined CSS Token References (Silent Bugs)

- [x] **`--coar-border-neutral`**: Defined as alias `var(--coar-color-gray-200)` in `colors-usage.css`.
  - File: `libs/ui/styles/tokens/colors-usage.css`

- [x] **`--coar-border-error-primary`** and **`--coar-background-error-primary`**: Radio component now uses `--coar-border-semantic-error-bold` and `--coar-background-semantic-error-bold`.
  - File: `libs/ui/components/src/lib/forms/radio/`

- [x] **`--coar-surface-accent-secondary`**: Single-select now uses `--coar-background-accent-secondary`.
  - File: `libs/ui/components/src/lib/forms/select/coar-single-select.component.css`

### 1.3 Compressed Gray Mid-Range

- [x] **Gray 500-700 redistributed**: gray-500 `#9a9a9a`, gray-600 `#7a7a7a`, gray-700 `#6b6b6b`, gray-800 `#5a5a5a` — wider perceptual gaps.
  - File: `libs/ui/styles/tokens/colors-primitives-light.css`

---

## Phase 2: Showcase Consistency

### 2.1 Unify Page Layout Paradigm

- [x] **Migrate foundation pages to card-based layout**: Typography, Colors, Spacing migrated to `examples-grid` + `coar-card` pattern.
- [x] **Motion page**: Migrated to `examples-grid` + `coar-card` pattern. Added `CoarCardComponent` import.
  - File: `apps/showcase/src/app/pages/motion/`

- [x] **Remove `max-height: 100px` on page header**: Removed, `min-height: 100px` retained.
  - File: `apps/showcase/src/app/shared/showcase-pages.css`

- [x] **Add main content padding**: `padding: 0 var(--coar-spacing-xl)` added to `.app-main`.
  - File: `apps/showcase/src/app/app.css`

- [x] **Standardize description text class**: Getting-started and Motion pages now use `page-description`.
  - Files: `apps/showcase/src/app/pages/getting-started/`, `apps/showcase/src/app/pages/motion/`

### 2.2 Clean Up Content Duplication

- [x] **Delete orphaned standalone pages**: single-select, multi-select, tag-select, popover directories all removed.

### 2.3 Rewrite Localization Page

- [x] **Fix non-standard structure**: Now uses `div.component-page` with standard `page-header` and `page-description`.
- [x] **Fix broken token references**: All CSS variables now use correct `--coar-*` naming convention.
  - File: `apps/showcase/src/app/pages/localization/localization.page.css`

### 2.4 Sidebar Navigation

- [x] **Add collapsible groups**: Replaced `coar-menu-heading` with `coar-sub-expand` using two-way signal binding. Foundations open by default, rest collapsed. Added sidebar-context CSS to `coar-sub-expand.component.css`.
  - Files: `apps/showcase/src/app/app.html`, `apps/showcase/src/app/app.ts`, `libs/ui/menu/src/lib/coar-sub-expand.component.css`

### 2.5 Move Inline Styles to CSS

- [x] **Overlay page**: All inline styles moved to CSS classes in `overlay.page.css`. Zero inline styles remaining.
- [x] **Tooltip page**: Card-level inline styles moved to `tooltip.page.css`. 8 inline styles remain inside `[coarPopoverContent]` (portal-rendered content where scoped CSS cannot reach).
- [x] **Tabs page**: Inline style moved to `.loading-strategy-hint` class in `tabs.page.css`.

### 2.6 Mixed CSS Units

- [x] **Migrate hardcoded spacing to tokens** in `showcase-pages.css`. Replaced margin, padding, and gap values with `var(--coar-spacing-*)` tokens. Font-size values left as-is (typography concern, not spacing).
  - File: `apps/showcase/src/app/shared/showcase-pages.css`

---

## Phase 3: Color System Polish

### 3.1 Dark Mode Fixes — COMPLETE

- [x] **Replace hardcoded dark mode menu colors**: Now uses `var(--coar-color-gray-*)` references with proper fallbacks.
  - File: `libs/ui/styles/tokens/menu.css`

- [x] **Replace hardcoded code-block layout colors (dark mode)**: Now uses gray primitives (`var(--coar-color-gray-100)`, etc.).
  - File: `libs/ui/styles/tokens/code-block.css`

- [x] **Explicitly override semantic text tokens for dark mode**: Comprehensive overrides added for all `--coar-text-semantic-*-bold` and `--coar-text-semantic-*-subtle` tokens.
  - File: `libs/ui/styles/tokens/colors-usage.css`

- [x] **Review dark mode input surface**: Proper visual hierarchy implemented — page bg (gray-200) → card (gray-100) → input (gray-50).
  - File: `libs/ui/styles/tokens/colors-usage.css`

### 3.2 Hardcoded Menu Fallbacks — COMPLETE

- [x] **Align `#f0f1f2` fallback**: All menu components now use `#f5f5f5` fallback matching actual token values.
  - Files: `coar-menu-item.component.css`, `coar-sub-expand.component.css`, `coar-submenu-item.component.css`

- [x] **Align sidebar fallbacks**: Now uses proper semantic tokens with cascading fallbacks.
  - File: `libs/ui/navigation/sidebar/coar-sidebar.component.css`

### 3.3 Showcase Hardcoded Colors

- [x] **Forms page gradient**: Replaced hardcoded gradient with `var(--coar-background-neutral-secondary)`.
  - File: `apps/showcase/src/app/pages/forms/forms.page.css`

- [x] **Menu page undefined tokens**: Replaced `--coar-color-accent`/`--coar-color-warning`/`--coar-color-danger` with proper semantic tokens. Fixed `--coar-spacing-lg`/`--coar-spacing-md` to `--coar-spacing-l`/`--coar-spacing-m`. Replaced `rgba()` hardcoded hover with `var(--coar-background-accent-secondary)`.
  - File: `apps/showcase/src/app/pages/menu/menu.page.css`

---

## Phase 4: Documentation Improvements — COMPLETE

### 4.1 Content Fixes

- [x] **Code-block page examples**: Replaced generic examples with code-block-specific usage.
  - File: `apps/showcase/src/app/pages/code-block/code-block.page.ts`

- [x] **Data-grid API table format**: Aligned to Name/Type/Default/Description format.
  - File: `apps/showcase/src/app/pages/data-grid/`

- [x] **Notes page API discrepancy**: Documentation updated — uses `variant` matching component implementation.

### 4.2 Cross-References

- [x] Add cross-links between related component families:
  - Input variants (text-input, number-input, password) — Added to text-input page
  - Select variants (single-select, multi-select, tag-select) — Added "Choosing the Right Select" section to selects page
  - Date picker variants (plain-date, plain-date-time, zoned-date-time) — Added to all three picker pages
  - Forms page now links to individual component pages — Added "Form Components" section

### 4.3 Accessibility Documentation

- [x] Add keyboard navigation docs to interactive components:
  - Buttons — Full a11y section with keyboard navigation and screen reader support
  - Selects — Comprehensive keyboard navigation (Enter/Space, Escape, Arrow keys, Home/End, Tab, Type to filter)
  - Text inputs — Keyboard navigation and screen reader support sections
  - Overlays — Keyboard navigation (Escape, Tab, focus trapping) and focus management docs
  - Menu — Keyboard navigation (Tab, Enter/Space, Escape) and screen reader support

### 4.4 Form Integration Docs

- [x] Document how components work with Angular Reactive Forms and Template-driven Forms
- [x] Document the `ControlValueAccessor` integration pattern
- [x] Add form validation error display recipe (mapping `FormControl.errors` to error strings)

---

## Phase 5: New Components for IDP Server — COMPLETE

### 5.1 Must-Have (blocks login/consent/profile)

- [x] **`CoarDialogService` / `CoarDialogShellComponent`** — Wraps `CoarOverlayService` with `coarModalPreset`. Supports component, template, and confirm dialog modes. Size variants (s/m/l), title, close button, focus trapping, escape to close. Types: `CoarDialogConfig`, `CoarDialogRef`, `CoarConfirmOptions`.
  - Files: `libs/ui/components/src/lib/overlay/dialog/`

- [x] **`CoarToastService` / toast notification system** — success/error/warning/info variants with auto-dismiss (5000ms, error persistent at 0ms). Stacking (max 5), hover pauses timer, progress bar, action buttons, dismiss all. Uses `ApplicationRef` + `createComponent` (no overlay system). `aria-live="polite"`, error toasts use `role="alert"`.
  - Files: `libs/ui/components/src/lib/overlay/toast/`

- [x] **`CoarSwitchComponent`** — CVA-based form control with `model<boolean>()` two-way binding. Hidden `<input type="checkbox" role="switch">`, custom track+thumb visuals. Sizes (s/m/l), disabled, readonly, labelPosition (before/after).
  - Files: `libs/ui/components/src/lib/forms/switch/`

- [x] **Styled link CSS classes** — CSS-only `.coar-link` with accent color, underline-on-hover, focus ring. Variants: `--subtle` (muted), sizes `--s`/`--m`/`--l`.
  - Files: `libs/ui/components/src/lib/display/link/coar-link.css`

### 5.2 Must-Have (admin panel)

- [x] **`CoarBreadcrumbComponent`** + `CoarBreadcrumbItemComponent` — `<nav aria-label="Breadcrumb">` with `<ol>`, CSS separator via `::before`, active item with `aria-current="page"`, customizable separator.
  - Files: `libs/ui/components/src/lib/navigation/breadcrumb/`

- [x] **`CoarPaginationComponent`** — 1-based page navigation with window algorithm, first/last/prev/next buttons, ellipsis, `CoarIconComponent` arrows. `model<number>()` two-way binding, `aria-current="page"` on current.
  - Files: `libs/ui/components/src/lib/navigation/pagination/`

- [x] **`CoarNavbarComponent`** — Flexbox layout with three content projection slots (`[coar-navbar-start]`, `[coar-navbar-center]`, `[coar-navbar-end]`). Elevated (shadow) and bordered variants. `role="banner"`.
  - Files: `libs/ui/components/src/lib/navigation/navbar/`

- [x] **`CoarProgressBarComponent`** + `CoarSpinnerComponent` — Progress bar with `role="progressbar"`, variant colors (accent/success/warning/error), sizes (s/m/l), indeterminate mode. Spinner with SVG circle rotation, sizes (xs/s/m/l), `role="status"`. Both respect `prefers-reduced-motion`.
  - Files: `libs/ui/components/src/lib/display/progress-bar/`, `libs/ui/components/src/lib/display/spinner/`

### 5.3 Nice-to-Have (polish)

- [ ] **Skeleton loader** — loading state placeholders for content areas
- [ ] **Empty state component** — "No results found" with icon, message, and action button
- [ ] **Description list component** — key-value display for profile pages
- [ ] **Stepper/Wizard** — multi-step flows (MFA setup, registration)
- [ ] **Alert/Banner** — system-wide announcements, dismissible
- [ ] **Enhanced data table** — sorting, filtering, row selection (or lean on `@cocoar/data-grid`)
- [ ] **`CoarFormFieldComponent`** — wrapper that maps `FormControl.errors` to error message display

---

## Phase 6: Naming Consistency — COMPLETE

- [x] **Size naming standardized**: `sm` → `s`, `md` → `m`, `lg` → `l` across all components, tokens, CSS, templates, tests, showcase, and docs. Avatar `2xl` → `xxl`.
- [x] **Event output naming standardized**: Menu-item `itemClick` → `clicked`, `itemHover` → `hovered` (Angular past-tense convention).
- [x] **`color` → `variant` input naming** — Renamed `color` to `variant` on Card, Note, Tag, and CodeBlock. All components using semantic values now use `variant`. Icon keeps `color` since it accepts actual CSS color values.
- [x] **`example-demo--grid` class** in selects page — Fixed by changing to `example-demo--two-col`.
- [x] **Stale Figma references** — Removed from development-environment docs custom words list.

---

## Remaining Work Summary

| Item | Phase | Effort |
|------|-------|--------|
| **Nice-to-have components (skeleton, empty state, stepper, etc.)** | **5.3** | **Medium** |

---

## Verification Checklist

After completing each phase:

```bash
# Build
pnpm nx build ui

# Test
pnpm nx test ui --skip-nx-cache

# Lint
pnpm lint

# Showcase
pnpm start
# Visually verify all pages at http://localhost:4200

# E2E
pnpm e2e

# WCAG contrast check
# Manually verify with browser DevTools accessibility panel or axe-core
```
