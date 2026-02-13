# Design Review Plan

Consolidated findings from a full design system audit (Feb 2026) covering UI/UX, color system, documentation, and component readiness for IDP Server use case.

**Context:** The Coar Design System will power an IDP (Identity Provider) Server application requiring login pages, consent pages, user profile management, and admin UI with data grids.

---

## Phase 1: Critical Fixes

### 1.1 WCAG Contrast Failures

- [ ] **Warning badge contrast**: White text on amber-600 (#cc821f) = ~2.7:1 ratio. Change to dark text (amber-900 or `--coar-text-neutral-primary`) instead of `--coar-text-on-bold`.
  - File: `libs/ui/components/src/lib/display/badge/coar-badge.component.css`
  - File: `libs/ui/styles/tokens/colors-usage.css` (warning-bold semantic tokens)

- [ ] **Info badge/card bold contrast**: White text on slate-200 (#c6cad4) = ~1.7:1 ratio. Either darken info-bold background to slate-700+ OR switch to dark text.
  - File: `libs/ui/components/src/lib/display/badge/coar-badge.component.css`
  - File: `libs/ui/styles/tokens/colors-usage.css` (info-bold semantic tokens)

- [ ] **Tertiary text contrast**: gray-700 (#7b7b7b) on white = ~4.0:1 (fails AA 4.5:1). Used for placeholders and secondary descriptions. Darken to ~#6b6b6b or limit to large text.
  - File: `libs/ui/styles/tokens/colors-primitives-light.css` (gray-700 value)

- [ ] **Primary text borderline**: gray-900 (#545454) on white = ~4.9:1. Consider darkening to ~#444444.
  - File: `libs/ui/styles/tokens/colors-primitives-light.css` (gray-900 value)

- [ ] **Misassigned semantic subtle tokens**: `--coar-text-semantic-*-subtle` and `--coar-icon-semantic-*-subtle` all point to -100 shade (very light pastels, ~1.2:1 contrast on white). Should use 600-800 range for text, or be repurposed as background tokens.
  - File: `libs/ui/styles/tokens/colors-usage.css` (lines ~98-134)

### 1.2 Undefined CSS Token References (Silent Bugs)

These tokens are referenced but never defined — causing invisible borders/backgrounds:

- [ ] **`--coar-border-neutral`** (no variant suffix) — used in tooltips, popovers, selects, showcase-pages (~12 occurrences). Define in `colors-usage.css` or change all references to `--coar-border-neutral-tertiary`.
  - Search: `grep -r "border-neutral[^-]" libs/ui/ apps/showcase/`

- [ ] **`--coar-border-error-primary`** and **`--coar-background-error-primary`** — used in radio component. Change to `--coar-border-semantic-error-bold` and `--coar-background-semantic-error-bold`.
  - File: `libs/ui/components/src/lib/forms/radio/`

- [ ] **`--coar-surface-accent-secondary`** — used in single-select. Change to `--coar-background-accent-secondary`.
  - File: `libs/ui/components/src/lib/forms/` (select components)

### 1.3 Compressed Gray Mid-Range

- [ ] **Gray 500-700 perceptual steps too close**: #999999, #888888, #7b7b7b. Widen gaps for better differentiation between neutral-secondary and neutral-tertiary. Review the full gray scale from 400-800 and redistribute for even perceptual steps.
  - File: `libs/ui/styles/tokens/colors-primitives-light.css`
  - Note: This may affect the contrast fixes above — do together.

---

## Phase 2: Showcase Consistency

### 2.1 Unify Page Layout Paradigm

- [ ] **Migrate foundation pages to card-based layout**: Typography, Colors, Spacing, Motion pages currently use `section` + `coar-divider` separators. Migrate to the `examples-grid` + `coar-card` + `component-section-title` pattern used by all component pages.
  - Files: `apps/showcase/src/app/pages/typography/`
  - Files: `apps/showcase/src/app/pages/colors/`
  - Files: `apps/showcase/src/app/pages/spacing/`
  - Files: `apps/showcase/src/app/pages/motion/`

- [ ] **Remove `max-height: 100px` on page header**: Keep `min-height: 100px` but allow natural expansion for longer descriptions.
  - File: `apps/showcase/src/app/shared/showcase-pages.css:36-43`

- [ ] **Add main content padding**: Uncomment or add padding to `.app-main` for breathing room between sidebar and content.
  - File: `apps/showcase/src/app/app.css:65-67`

- [ ] **Standardize description text class**: Some pages use `page-description`, others use `coar-body` or `coar-body coar-text-secondary`. Standardize on `page-description`.
  - Affected: getting-started, typography, colors, spacing, motion

### 2.2 Clean Up Content Duplication

- [ ] **Delete orphaned standalone pages** (routes already redirect to merged pages):
  - `apps/showcase/src/app/pages/single-select/`
  - `apps/showcase/src/app/pages/multi-select/`
  - `apps/showcase/src/app/pages/tag-select/`
  - `apps/showcase/src/app/pages/popover/`
  - Also remove from route config and any remaining imports

### 2.3 Rewrite Localization Page

- [ ] **Fix non-standard structure**: Uses `div.page` instead of `div.component-page`, non-standard heading/description classes.
- [ ] **Fix broken token references**: Page uses invented CSS variable names (`--coar-color-text-secondary`, `--coar-color-primary`, `--coar-color-surface`, etc.) that don't exist. All colors fall through to hardcoded hex fallbacks. Replace with correct token names:
  - `--coar-color-text-secondary` -> `--coar-text-neutral-secondary`
  - `--coar-color-primary` -> `--coar-text-accent-primary`
  - `--coar-color-surface` -> `--coar-background-neutral-secondary`
  - `--coar-color-border` -> `--coar-border-neutral-tertiary`
  - etc.
  - File: `apps/showcase/src/app/pages/localization/localization.page.css`
  - File: `apps/showcase/src/app/pages/localization/localization.page.html`

### 2.4 Sidebar Navigation

- [x] **Add collapsible groups**: Replaced `coar-menu-heading` with `coar-sub-expand` for all 5 sections (Foundations, Form Controls, Display, Navigation, Overlay). Added sidebar-context CSS to `coar-sub-expand.component.css` so the header renders as a section heading (uppercase, smaller font, muted color, no icon slot, no indentation, no guide line). All sections default to open.
  - Files: `apps/showcase/src/app/app.html`, `apps/showcase/src/app/app.ts`, `libs/ui/menu/src/lib/coar-sub-expand.component.css`

### 2.5 Move Inline Styles to CSS

- [x] **Overlay page**: All inline styles moved to CSS classes in `overlay.page.css` (overlay panel text, actions, nested demo variants, hover demo variants). Zero inline styles remaining.
- [x] **Tooltip page**: Card-level inline styles moved to `tooltip.page.css`. 8 inline styles remain inside `[coarPopoverContent]` (portal-rendered content where scoped CSS cannot reach).
- [x] **Tabs page**: Inline style moved to `.loading-strategy-hint` class in `tabs.page.css`.

### 2.6 Mixed CSS Units

- [ ] **Migrate hardcoded spacing to tokens** in `showcase-pages.css`. Replace raw `px` and `rem` values with `var(--coar-spacing-*)` tokens where appropriate (especially padding, margin, gap values).
  - File: `apps/showcase/src/app/shared/showcase-pages.css` (lines 107, 137-148, 183-184, 232-234)

---

## Phase 3: Color System Polish

### 3.1 Dark Mode Fixes

- [ ] **Replace hardcoded dark mode menu colors**: `menu.css` lines 27-33 use `#1e1e1e`, `#2d2d2d` instead of gray primitives. Replace with `var(--coar-color-gray-*)` references.
  - File: `libs/ui/styles/tokens/menu.css`

- [ ] **Replace hardcoded code-block layout colors** (dark mode): Layout colors (bg, header-bg, border) should reference gray primitives for consistency.
  - File: `libs/ui/styles/tokens/code-block.css`

- [ ] **Explicitly override semantic text tokens for dark mode**: Currently relies on primitive inversion producing acceptable results coincidentally. Add explicit dark-mode overrides for `--coar-text-semantic-*-bold` and `--coar-text-semantic-*-subtle`.
  - File: `libs/ui/styles/tokens/colors-usage.css` (dark mode section)

- [ ] **Review dark mode input surface**: `--coar-surface-input` = gray-50 (#18181b) is same as page background in dark mode. Inputs should be slightly lighter for visual distinction.
  - File: `libs/ui/styles/tokens/colors-usage.css` (line ~241)

### 3.2 Hardcoded Menu Fallbacks

- [ ] **Align `#f0f1f2` fallback** (18+ occurrences in menu components) with actual token values. Use `var(--coar-background-neutral-secondary, #f5f5f5)`.
  - Files: `coar-menu-item.component.css`, `coar-sub-expand.component.css`, `coar-submenu-item.component.css`

- [ ] **Align sidebar fallbacks**: `#ffffff`, `#d0d0d0` fallback values in sidebar component.
  - File: `libs/ui/menu/src/lib/coar-sidebar.component.css`

### 3.3 Showcase Hardcoded Colors

- [ ] **Forms page gradient**: `linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f5f0ff 100%)` at `forms.page.css:319`. Replace with token-based gradient or document as intentional demo styling.
- [ ] **Menu page**: Uses `rgba(21, 109, 183, 0.02)` and undefined `--coar-color-accent`, `--coar-color-warning`. Fix to correct token names.
  - File: `apps/showcase/src/app/pages/menu/menu.page.css`

---

## Phase 4: Documentation Improvements

### 4.1 Content Fixes

- [x] **Code-block page examples**: The code-block component's showcase uses generic button/component examples rather than code-block-specific ones. Replace `basicExample` with actual code-block usage.
  - File: `apps/showcase/src/app/pages/code-block/code-block.page.ts`

- [x] **Data-grid API table format**: Uses Method/Description instead of Name/Type/Default/Description. Align with all other component pages.
  - File: `apps/showcase/src/app/pages/data-grid/`

- [x] **Notes page API discrepancy**: Documentation already correct - uses `color` which matches component implementation.

### 4.2 Cross-References

- [x] Add cross-links between related component families:
  - Input variants (text-input, number-input, password) - Added to text-input page
  - Select variants (single-select, multi-select, tag-select) - Added "Choosing the Right Select" section to selects page
  - Date picker variants (plain-date, plain-date-time, zoned-date-time) - Added to all three picker pages
  - Forms page now links to individual component pages - Added "Form Components" section

### 4.3 Accessibility Documentation

- [x] Add keyboard navigation docs to interactive components:
  - Buttons - Added full a11y section with keyboard navigation and screen reader support
  - Selects - Added comprehensive keyboard navigation (Enter/Space, Escape, Arrow keys, Home/End, Tab, Type to filter)
  - Text inputs - Added keyboard navigation and screen reader support sections
  - Overlays - Added keyboard navigation (Escape, Tab, focus trapping) and focus management docs
  - Menu - Added keyboard navigation (Tab, Enter/Space, Escape) and screen reader support

### 4.4 Form Integration Docs

- [x] Document how components work with Angular Reactive Forms and Template-driven Forms
- [x] Document the `ControlValueAccessor` integration pattern
- [x] Add form validation error display recipe (mapping `FormControl.errors` to error strings)

---

## Phase 5: New Components for IDP Server

### 5.1 Must-Have (blocks login/consent/profile)

- [ ] **`CoarDialogService` / `CoarDialogComponent`** — leverage existing `coarModalPreset`. Needs: title, body content projection, footer actions, close button, size variants (sm/md/lg), `role="dialog"`, focus trapping, escape to close.

- [ ] **`CoarToastService` / toast notification system** — needs: success/error/warning/info variants, auto-dismiss with configurable duration, stack positioning (top-right), manual dismiss, `aria-live` region.

- [ ] **`CoarSwitchComponent`** — toggle for "remember me", settings. Form control with CVA. Visually distinct from checkbox. Needs: disabled, readonly, sizes.

- [ ] **Styled link component or CSS class** — "Forgot password?" links need consistent styling with hover/focus states. Could be a CSS-only solution (`coar-link` class) or a lightweight component.

### 5.2 Must-Have (admin panel)

- [ ] **`CoarBreadcrumbComponent`** — hierarchical navigation. Separator customization, last item non-clickable.

- [ ] **`CoarPaginationComponent`** — page size selector, page navigation, total items display.

- [ ] **`CoarNavbarComponent`** / top app bar — header with logo slot, action items slot, user menu slot.

- [ ] **`CoarProgressBarComponent`** / standalone `CoarSpinnerComponent` — loading indicators for page-level and inline use.

### 5.3 Nice-to-Have (polish)

- [ ] **Skeleton loader** — loading state placeholders for content areas
- [ ] **Empty state component** — "No results found" with icon, message, and action button
- [ ] **Description list component** — key-value display for profile pages
- [ ] **Stepper/Wizard** — multi-step flows (MFA setup, registration)
- [ ] **Alert/Banner** — system-wide announcements, dismissible
- [ ] **Enhanced data table** — sorting, filtering, row selection (or lean on `@cocoar/data-grid`)
- [ ] **`CoarFormFieldComponent`** — wrapper that maps `FormControl.errors` to error message display

---

## Phase 6: Minor API Consistency

- [ ] **Button `clicked` vs menu-item `itemClick`** — consider standardizing event output naming.
- [x] **`color` vs `variant` input naming** — Cards/Tags/Notes use `color`, Buttons/Badges use `variant`. Document the distinction (semantic intent vs visual style) or standardize.
  - **DOCUMENTED**: The naming convention is intentional and follows this pattern:
    - `variant` = Visual style variant (primary, secondary, ghost for buttons; default, bordered, plain for tables) — used for components where the choice is about visual hierarchy and emphasis level
    - `color` = Semantic color (neutral, success, warning, error, info, accent for cards, tags, notes) — used for components where the choice conveys meaning or message type
  - This distinction helps developers choose the right property based on context: buttons need visual hierarchy (variant), while notes/cards communicate semantic intent (color)
- [x] **`example-demo--grid` class** in selects page — Fixed by changing to `example-demo--two-col`.
  - File: `apps/showcase/src/app/pages/selects/selects.page.html:78`

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
