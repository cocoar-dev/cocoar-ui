# Cocoar Design System - Production Readiness Roadmap

> Generated: 2026-02-10
> Scope: Full repository audit - code, architecture, documentation, tooling, testing, showcase, CI/CD
> Baseline: RELEASE_READINESS_ANALYSIS.md (2026-01-26)

---

## Executive Summary

This document is the result of a deep, exhaustive audit of every corner of the cocoar-ui monorepo.
It builds on the earlier Release Readiness Analysis and expands scope to cover **everything** needed
for a production-grade, externally consumable design system: component quality, showcase app polish,
documentation completeness, developer experience, CI/CD maturity, and operational readiness.

### Current State at a Glance

| Dimension                     | Score   | Verdict                                      |
|-------------------------------|---------|----------------------------------------------|
| Architecture & Patterns       | 9.5/10  | Excellent - near-flawless                     |
| Design Token System           | 9.5/10  | Excellent - consistent, themeable             |
| Component APIs & Code         | 8.5/10  | Strong - minor polish needed                  |
| CSS & Styling Purity          | 9/10    | Excellent - 2-3 minor token violations        |
| Infrastructure Libraries      | 9/10    | Production-ready                              |
| Showcase App                  | 7/10    | Good foundation, needs UX & content polish    |
| Unit Testing                  | 7/10    | Solid base, gaps in menu & overlay            |
| E2E / Scenario Testing        | 6/10    | Growing well, still incomplete                |
| Accessibility                 | 5/10    | Partial - biggest gap for GA                  |
| Documentation (internal)      | 8.5/10  | Excellent architecture docs, some lib gaps    |
| Documentation (consumer)      | 5/10    | Minimal - not ready for external devs         |
| CI/CD & Release               | 7/10    | Functional pipeline, missing quality gates    |
| Developer Experience          | 7.5/10  | Good tooling, missing git hooks & changelog   |
| **Overall**                   | **7.5/10** | **Beta-ready. Needs focused work for GA.**  |

---

## Table of Contents

1. [Architecture & Structure](#1-architecture--structure)
2. [Design Tokens & CSS](#2-design-tokens--css)
3. [Component Libraries](#3-component-libraries)
4. [Infrastructure Libraries](#4-infrastructure-libraries)
5. [Showcase App](#5-showcase-app)
6. [Testing](#6-testing)
7. [Accessibility](#7-accessibility)
8. [Documentation](#8-documentation)
9. [CI/CD & Release Engineering](#9-cicd--release-engineering)
10. [Developer Experience & Tooling](#10-developer-experience--tooling)
11. [What to Remove / Clean Up](#11-what-to-remove--clean-up)
12. [Prioritized Action Plan](#12-prioritized-action-plan)

---

## 1. Architecture & Structure

### What's Excellent

- **Library taxonomy is clean**: `ui-tokens`, `ui-components`, `ui-menu`, `ui-overlay`, `ui-routing`,
  `data-grid`, `markdown-core`, `markdown-viewer`, `localization`, `logging`, `logging-abstractions`.
  Clear single-responsibility per package.
- **Dependency constraints enforced via ESLint** (`@nx/enforce-module-boundaries`): `type:ui` can
  depend on `type:ui` + `type:util`; `type:util` only on `type:util`. This prevents circular deps.
- **Path aliases** in `tsconfig.base.json` are complete (16 aliases, all correctly mapped).
- **Build executors** are correct: `@nx/angular:package` for Angular libs (APF), `@nx/js:tsc` for
  pure TS libs, `@angular/build:application` for apps.
- **`shared/ts-utils`** exists for cross-cutting utilities without polluting library deps.
- **`tools/`** properly separates dev-time tooling (testing-angular, scenar abstractions) from
  publishable libraries.

### What Needs Attention

| Issue | Detail | Action |
|-------|--------|--------|
| **`libs/ui/` is ambiguous** | A base UI library exists at `libs/ui/` alongside `libs/ui-components/`. Its purpose and relationship to ui-components is unclear from structure alone. | Clarify purpose in its README or consider merging into ui-components if it's just shared types/utilities. |
| **No `libs/` README** | No overview document explaining the library taxonomy, dependency graph, or "which lib do I use for X?" | Create `libs/README.md` with a dependency diagram and decision guide. |
| **Nx project tags incomplete** | `libs/ui/` has `type:library` instead of `type:ui` or `type:util`, which bypasses boundary enforcement. | Align tag to correct type. |
| **`shared/` vs `tools/` distinction** | `shared/ts-utils` lives under `shared/` while `testing-angular` lives under `tools/`. The split criteria is undocumented. | Document the convention or consolidate under one directory. |

---

## 2. Design Tokens & CSS

### What's Excellent

- **20 well-organized CSS token files** covering colors (primitives + semantic), typography (with
  responsive variants), spacing (4px grid), radius, shadows, elevation, motion, focus, z-index layers,
  stroke widths, and component-shared sizing.
- **Dark mode via CSS variable cascading** (`.dark-mode` class on `:root`) - no duplicate stylesheets.
- **Naming is 100% consistent**: `--coar-{usage}-{category}-{variant}` for semantic tokens,
  `--coar-color-{hue}-{shade}` for primitives.
- **Figma integration** indicated by auto-generation comments in primitive files.
- **Framework purity maintained**: zero Tailwind in libraries, Tailwind only in showcase with `tw:` prefix.
- **BEM-like CSS naming** (`.coar-button`, `.coar-button--primary`, `.coar-button__icon`) is
  perfectly consistent across all 40+ component CSS files.

### What Needs Attention

| Issue | File(s) | Action |
|-------|---------|--------|
| ~~**Hardcoded color in button dark mode**~~ | `libs/ui-components/.../button/coar-button.component.css` | ~~Replace `var(--coar-color-black)` with appropriate semantic token.~~ **DONE** - replaced with `--coar-text-on-bold`. |
| ~~**Badge uses `border-radius: 9999px`**~~ | `libs/ui-components/.../badge/coar-badge.component.css` | ~~Replace with `var(--coar-radius-full)`.~~ **DONE** |
| ~~**Avatar uses `color: white` for initials**~~ | `libs/ui-components/.../avatar/coar-avatar.component.css` | ~~Replace with equivalent token.~~ **DONE** - replaced with `--coar-text-on-bold`. |
| ~~**No token validation in CI**~~ | N/A | ~~Add `scripts/css/find-unused-css.mjs` and `find-undeclared-css-vars.ps1` to CI pipeline to catch regressions.~~ **DONE** - Added as report-only steps to PR validation. |
| **No token documentation page in showcase** | N/A | The Colors page exists but there's no dedicated "All Tokens" reference page showing spacing, radius, shadows, motion, etc. with live previews. |
| **Responsive typography tokens exist but aren't demonstrated** | `ui-tokens/src/css/typography-responsive.css` | Add a responsive typography demo to the showcase. |
| **`hsl(from var(...))` in zoned-date-time-picker** | `libs/ui-components/.../zoned-date-time-picker/` | Modern CSS - works in evergreen browsers but document the browser support baseline. |
| **No style-dictionary or token build pipeline** | N/A | Currently raw CSS. Consider if token transformation (CSS -> JSON -> TS types) would benefit consumers wanting programmatic access. Low priority. |

---

## 3. Component Libraries

### 3.1 ui-components (32+ components)

**Strengths:**
- All standalone, all `OnPush`, all signal-based (`input()`, `output()`, `model()`, `computed()`).
- Proper `ControlValueAccessor` base class (`CoarControlValueAccessor<T>`) for all form controls.
- CSS-only styling with design tokens. Layout-agnostic (no margins on `:host`).
- Good `.docs.md` files alongside components.
- Scenario files for visual testing.
- Comprehensive date/time system using Temporal API.

**Component Inventory:**

| Category | Components | Maturity |
|----------|-----------|----------|
| Display | Button, Badge, Tag, Card, Note, Divider, Table, Label, Icon, Avatar, CodeBlock, Scrollbar | Production |
| Forms | TextInput, NumberInput, PasswordInput, Checkbox, Radio/RadioGroup, SingleSelect, MultiSelect, TagSelect | Production |
| Date/Time | PlainDatePicker, PlainDateTimePicker, ZonedDateTimePicker, TimePicker, MiniCalendar, ScrollableCalendar, MonthList | Production |
| Navigation | TabGroup/Tab, Sidebar | Production |
| Overlay | Popover, Tooltip/TooltipDirective, PopConfirm | Production |

**Issues to Address:**

| Issue | Severity | Detail |
|-------|----------|--------|
| **Tab component missing lifecycle events** | Medium | No `activated`/`deactivated` outputs. Events only flow through parent TabGroup. |
| **Icon uses `bypassSecurityTrustHtml()`** | Low | Intentional for SVG - but needs security review documentation and input sanitization guarantee. |
| **Popover lifecycle complexity** | Low | Multiple signals/effects create complex lifecycle. Consider simplification pass. |
| **Output naming inconsistency** | Low | Checkbox uses `checkedChange` while other form controls use `valueChange`. |
| **Missing `.docs.md` for some components** | Medium | Not every component has a documentation markdown file. |

### 3.2 ui-menu (7 components)

**Strengths:**
- Sophisticated cascade system with sibling tracking (`CoarMenuCascade`).
- AIM-assist system for intelligent hover delays on flyout submenus.
- Integration with ui-overlay for submenu positioning.

**Issues to Address:**

| Issue | Severity | Detail |
|-------|----------|--------|
| ~~**`setTimeout(..., 10)` for menu close**~~ | Medium | ~~Race condition workaround in `coar-menu-item.component.ts`.~~ **DONE** - replaced with `queueMicrotask()` and extracted `closeMenuTree()`. |
| ~~**No unit test for CoarMenuItemComponent**~~ | Medium | ~~Core component of the menu system has no spec file.~~ **DONE** - 21 tests added covering rendering, interaction, keepMenuOpen, overlay close, disabled state, and a11y. |
| **AIM config not well-documented** | Low | `CoarMenuAimConfig` interface lacks JSDoc explaining the algorithm. |
| **README is boilerplate** | Medium | Needs real usage examples, API docs, and pattern guidance. |

### 3.3 ui-overlay (positioning engine)

**Strengths:**
- Clean spec/builder pattern with fluent API.
- Comprehensive positioning with viewport clamping, auto-fallback, anchor tracking.
- Backdrop, scroll, focus, a11y, and attachment configuration.
- Well-tested positioning logic.

**Issues to Address:**

| Issue | Severity | Detail |
|-------|----------|--------|
| **OverlaySpec not directly importable** | Low | Users must use `CoarOverlay.define()` return type. Consider exporting the interface. |
| **Position calculation lacks inline docs** | Low | Complex geometry logic would benefit from comments/diagrams. |
| **No consumer-facing README** | Medium | Library has no documentation for external developers. |

### 3.4 ui-routing (fragment-based routing)

**Strengths:**
- Excellent fragment parser with 163 test cases.
- Comprehensive README (350+ lines) with migration guide.
- Clean types with generic options support.

**Issues:** Minimal - this library is well-polished. Recently added, clearly received focused attention.

### 3.5 data-grid (AG Grid wrapper)

**Strengths:**
- Fluent builder API is elegant and type-safe.
- Custom Cocoar theme properly maps AG Grid tokens to design tokens.
- Observable row data support.

**Issues to Address:**

| Issue | Severity | Detail |
|-------|----------|--------|
| **README is 8 lines** | **High** | Most underdocumented library. Needs builder API docs, theme docs, examples. |
| **No showcase page?** | Medium | Verify the data-grid has a proper showcase page with multiple examples. |
| **AG Grid version pinning** | Low | Ensure peer dep range is appropriate and tested. |

---

## 4. Infrastructure Libraries

### 4.1 logging + logging-abstractions

**Status: Production-ready.** No action needed.

- Logging abstractions: 2KB zero-op with `Symbol.for()` singleton pattern.
- Full logging: Serilog-style pipeline with message template parsing, async sinks, fork isolation.
- 13+ test files with excellent coverage.
- 720+ line README.

### 4.2 localization

**Status: Production-ready.** Minor improvements possible.

- Complete i18n (translation) + l10n (formatting) system.
- Observable-first with Signal support.
- Browser Intl API integration.
- Timezone management.
- 10+ test files.

### 4.3 markdown-core + markdown-viewer

**Status: Production-ready.** Documentation could expand.

- Clean AST-based parser using unified/remark ecosystem.
- GFM support, heading slugs, footnotes, tables.
- `markdown-core/README.md` is minimal (25 lines) - could use more examples.

### 4.4 ts-utils (shared/)

**Status: Needs verification.** Role and contents should be documented. Currently no README.

---

## 5. Showcase App

### What's Good

- **40+ dedicated component pages** with lazy-loaded routing.
- **Consistent page structure**: title, description, sections, code examples, API tables.
- **Interactive demos** with signal-based state management (loading simulators, form validation).
- **Dark mode toggle** and **language switcher** (en/de).
- **Grouped sidebar navigation**: Foundations, Form Controls, Display, Navigation, Overlay.
- **Home page** with hero section, quick links, and feature highlights.
- **Code examples** embedded in collapsible blocks.
- **Design tokens used throughout** - no hardcoded styling in showcase pages.

### What Needs Work

| Issue | Priority | Detail |
|-------|----------|--------|
| **No "Getting Started" flow** | High | External developers landing on the showcase need a clear onboarding path: install, import tokens, use first component. Currently it's a component gallery without setup guidance. |
| **Missing search/filter** | Medium | With 40+ pages, finding a specific component requires scrolling the sidebar. Add a search input at the top. |
| **No "Copy Code" button on examples** | Medium | Code blocks show examples but lack a copy-to-clipboard button, which is standard in design system showcases (Storybook, Material, etc.). |
| **No component status indicators** | Medium | No visual indication of which components are stable, beta, or experimental. Design systems like Polaris/Carbon show component maturity status. |
| **Inconsistent page depth** | Medium | Button/Forms/Menu pages are excellent and thorough. Other pages (Divider, Avatar, Note) are thinner. Standardize minimum sections: Overview, Variants, States, Accessibility, API. |
| **No "Playground" / live editor** | Low | Some design systems offer interactive playgrounds where users can tweak inputs in real-time. The scenario system could power this. |
| **Showcase standards document exists but isn't enforced** | Low | `SHOWCASE-STANDARDS.md` describes page structure but some pages don't fully follow it. |
| **No versioned documentation** | Low | When you publish v0.2, v0.3, etc., consumers need docs matching their version. Not urgent for alpha. |
| **Responsive layout not verified** | Medium | Showcase sidebar layout may not work well on narrow screens. Consider adding a responsive breakpoint. |
| **Missing pages for some components** | Medium | Verify all 32+ components have dedicated showcase pages. Some newer components (data-grid, markdown-viewer) may be missing. |

---

## 6. Testing

### 6.1 Unit Tests (Vitest)

**Current State:** ~58 spec files across all libraries.

| Library | Spec Files | Assessment |
|---------|-----------|------------|
| ui-components | 30+ | Good coverage of inputs/outputs/rendering |
| ui-menu | 4 | Good - CoarMenuItemComponent now covered (21 tests) |
| ui-overlay | 3 | Good (positioning logic tested) |
| logging | 11+ | Excellent |
| localization | 10+ | Good |
| ui-routing | 1 | Good (163 test cases in fragment parser) |
| data-grid | 3 | Good (builder pattern tested) |
| markdown-core | 1 | Adequate |

**What's Missing:**

| Gap | Priority | Action |
|-----|----------|--------|
| ~~**No test for CoarMenuItemComponent**~~ | High | ~~Core interactive component - needs click, hover, disabled, keepMenuOpen tests.~~ **DONE** |
| **No interaction tests for overlay** | Medium | Overlay opening, closing, backdrop click, escape key. |
| **Date/time component test depth** | Medium | Calendar navigation, date selection, timezone switching need more coverage. |
| **No snapshot/visual regression tests** | Medium | Consider adding Vitest snapshot tests for component HTML output. |
| **No test coverage thresholds** | Medium | CI should enforce minimum coverage per library (e.g. 70% statements). |

### 6.2 E2E Tests (Playwright - Showcase)

**Current State:** 6 test files, ~40 tests covering 16 components in smoke + focused tests.

| File | Tests | Coverage |
|------|-------|----------|
| smoke.spec.ts | 16 | Page-load verification for 16 components |
| components/menu.spec.ts | 3 | Context menu, outside click, nested close |
| components/forms.spec.ts | 14 | Checkbox toggle, disable, label click |
| components/popover.spec.ts | 1 | Basic popover open |
| accessibility/aria-compliance.spec.ts | 5 | Landmarks, headings |
| accessibility/keyboard-nav.spec.ts | 2 | Focus visibility (1 placeholder) |

**What's Missing:**

| Gap | Priority | Action |
|-----|----------|--------|
| **No E2E for buttons** | High | Test all variants, loading states, disabled, click events. |
| **No E2E for text/number/password inputs** | High | Type, clear, validate, error states. |
| **No E2E for select components** | High | Open, search, select, multi-select, keyboard navigation. |
| **No E2E for tabs** | Medium | Tab switching, keyboard navigation, disabled tabs. |
| **No E2E for date pickers** | Medium | Calendar navigation, date selection, time picker. |
| **No E2E for data grid** | Medium | Sort, filter, select rows, scroll. |
| **No E2E for overlay positioning** | Medium | Viewport clamping, scroll behavior, backdrop. |
| **Some files missing tags** | Low | `forms.spec.ts` and `popover.spec.ts` lack proper `@tags`. |
| **Focus trap test is placeholder** | Medium | `keyboard-nav.spec.ts` has empty assertion for modal focus trap. |
| **No visual regression** | Medium | Consider Playwright screenshot comparison or Percy integration. |

### 6.3 Scenario Tests (Playwright - Scenar Backstage)

**Current State:** 19 test files, ~95+ tests. This is the stronger test suite.

**Well-covered components:**
- Button (13 tests), Checkbox (13), TextInput (12), NumberInput (10), PasswordInput (7),
  Tabs (10), Table (5), Icon (3), Badge (3), Tag (3), Card (2), CodeBlock (6),
  NestedMenuClose (6), Localization (9), Popover (1).

**Assessment:** The scenar-backstage E2E tests are significantly more comprehensive than the
showcase E2E tests. Consider whether to consolidate effort or maintain both.

**Recommendation:** The scenario system is powerful. Prioritize writing scenarios for untested
components (selects, date pickers, overlays, data-grid) and their corresponding Playwright tests
in scenar-backstage-e2e over adding more showcase-e2e tests.

---

## 7. Accessibility

### Current Implementation

- Basic ARIA attributes on components (roles, aria-labels).
- Keyboard focus styles via `--coar-focus-*` tokens.
- `@a11y` tagged tests in both E2E suites.
- DESIGN_PRINCIPLES.md mentions WCAG 2.1 AA target.

### Critical Gaps

| Gap | Priority | Impact |
|-----|----------|--------|
| **No WCAG compliance audit** | **Critical** | No systematic verification that components meet AA. Run axe-core or similar. |
| **No axe/a11y automation in CI** | **Critical** | Add `@axe-core/playwright` to E2E tests for automated WCAG checks. |
| **No color contrast validation** | High | Token color combinations haven't been verified for 4.5:1 contrast ratio. |
| **No screen reader testing** | High | No VoiceOver/NVDA testing documented or automated. |
| **No per-component a11y documentation** | High | Each component needs: keyboard interactions, ARIA pattern, screen reader behavior. |
| **Focus management incomplete** | Medium | Modal focus trap test is a placeholder. Overlay focus trap needs verification. |
| **No reduced-motion testing** | Medium | Motion tokens support `prefers-reduced-motion` but no E2E validation. |
| **No high-contrast mode support** | Low | `forced-colors` media query not addressed. Consider for v2. |

### Recommended Approach

1. Add `@axe-core/playwright` to both E2E test suites.
2. Create an accessibility checklist per component type (form control, disclosure, menu, dialog).
3. Add keyboard interaction tables to component `.docs.md` files.
4. Run a one-time audit with axe DevTools or Lighthouse.
5. Add CI gate: fail on new a11y violations.

---

## 8. Documentation

### 8.1 Internal Documentation (for contributors)

**What's Excellent:**
- ARCHITECTURE.md (487 lines) - comprehensive technical patterns
- NAMING.md (325 lines) - complete naming conventions
- CONTRIBUTING.md (233 lines) - clear workflow
- AGENTS.md (301 lines) - AI assistant guidance
- DESIGN_PRINCIPLES.md (485 lines) - design philosophy
- docs/testing.md, docs/testing-writing.md - thorough testing guides
- docs/writing-scenarios.md - detailed scenario guide

**What's Missing:**

| Gap | Priority | Action |
|-----|----------|--------|
| **No dependency graph visualization** | Medium | Create a Mermaid diagram in ARCHITECTURE.md showing library dependency flow. |
| **`shared/ts-utils` undocumented** | Low | Add README explaining what's in it and when to use it. |
| **`tools/` directory undocumented** | Low | Add README explaining testing-angular vs scenar abstractions. |

### 8.2 Consumer Documentation (for external developers)

**What Exists:**
- `docs/consuming/angular.md` - basic integration guide
- `docs/consuming/overlay.md` - overlay usage
- `docs/consuming/intl-translations.md` - i18n setup

**Critical Gaps:**

| Gap | Priority | Action |
|-----|----------|--------|
| **No comprehensive "Getting Started" guide** | **Critical** | Step-by-step: install packages, import tokens CSS, import components, first component, theming. |
| **No per-component API reference** | **Critical** | Compodoc infrastructure exists (`scripts/docs/`) but isn't generated or published. Run it. |
| **No theming/customization guide** | High | How to override tokens, create custom themes, dark mode setup in consuming apps. |
| **No migration guide** | Medium | When breaking changes happen, consumers need upgrade paths. |
| **Library READMEs too thin** | High | `data-grid/README.md` (8 lines), `ui-menu/README.md` (boilerplate), `markdown-core/README.md` (25 lines). Each publishable lib needs: purpose, install, basic usage, API overview. |
| **No form patterns guide** | Medium | Common form layouts, validation patterns, error handling with Cocoar components. |
| **No changelog per library** | Medium | Consumers need per-package changelogs. Consider `nx release` changelog generation. |

### 8.3 Showcase as Documentation

The showcase app should be the primary documentation vehicle for consumers. Current state:
- Good component demos but no "how to implement this" framing.
- Code examples exist but aren't copy-paste ready (no import statements).
- No "Props" table that auto-generates from source (manual HTML tables).

**Recommendation:** Treat the showcase as the public documentation site. Add:
1. Copy-to-clipboard on code examples.
2. Import statements in code examples.
3. Link to source code for each component.
4. Component status badges (stable/beta/experimental).

---

## 9. CI/CD & Release Engineering

### Current Pipeline

| Workflow | Trigger | What It Does |
|----------|---------|--------------|
| `01-pr-validation.yml` | PR to develop | Lint, test, build |
| `02-develop-build-alpha.yml` | Push to develop | Lint, test, build, pack artifacts (7-day retention) |
| `03-publish-prerelease.yml` | Manual | Publish alpha/beta (steps commented out) |
| `04-publish-stable.yml` | Manual | Publish stable (steps commented out) |
| `05-deploy-showcase-pages.yml` | Manual/push | Deploy showcase to GitHub Pages |

### What's Missing

| Gap | Priority | Action |
|-----|----------|--------|
| ~~**No E2E tests in CI**~~ | **Critical** | ~~PR validation only runs lint + unit tests. Add Playwright E2E run.~~ **DONE** - Playwright Chromium E2E added to `01-pr-validation.yml`. |
| **No a11y checks in CI** | **Critical** | Add axe-core scan as CI gate. |
| ~~**No test coverage reporting**~~ | High | ~~Add coverage thresholds and report upload (Codecov/similar).~~ **DONE** - Coverage thresholds enforced in CI via `--coverage`. Codecov upload can be added later. |
| **No bundle size tracking** | Medium | Track dist sizes per library to prevent regressions. Could use `size-limit`. |
| **Publishing steps are commented out** | Medium | Uncomment and test the npm publish workflows before GA. |
| ~~**No PR template**~~ | Medium | ~~Create `.github/PULL_REQUEST_TEMPLATE.md` with checklist (tests, a11y, docs, tokens).~~ **DONE** |
| ~~**No issue templates**~~ | Medium | ~~Create `.github/ISSUE_TEMPLATE/` with bug report and feature request forms.~~ **DONE** |
| **No branch protection documented** | Low | Document required checks, review requirements for develop/main. |
| **No Dependabot/Renovate** | Low | Automated dependency updates for security patches. |
| ~~**CSS validation not in CI**~~ | Medium | ~~Add `find-unused-css.mjs` and `find-undeclared-css-vars.ps1` to PR validation.~~ **DONE** - Both scripts added as report-only steps to `01-pr-validation.yml`. |

---

## 10. Developer Experience & Tooling

### What's Good

- VS Code workspace settings with recommended extensions (7).
- Prettier + ESLint auto-fix on save.
- CSpell for spell checking.
- EditorConfig for cross-editor consistency.
- Verdaccio local registry for testing published packages.
- Cross-platform scripts (Windows-aware E2E runner).
- `scripts/README.md` documenting all scripts.

### What's Missing

| Gap | Priority | Action |
|-----|----------|--------|
| **No pre-commit hooks** | High | Add Husky + lint-staged to run linting/formatting on staged files. Prevents CI failures from local mistakes. |
| **No commit message linting** | Medium | Add commitlint with conventional commits. Enables automated changelog generation. |
| **No changeset/release tooling** | Medium | Consider `@changesets/cli` or `nx release` for structured versioning and per-package changelogs. |
| ~~**`pnpm e2e` doesn't run in CI**~~ | High | ~~The E2E command exists locally but isn't wired into CI workflows.~~ **DONE** - Wired into `01-pr-validation.yml` with Chromium-only for speed. |
| **No `pnpm check:all` script** | Low | Add a convenience script that runs lint + test + build + e2e for local verification before pushing. |
| **Scenario registry not auto-generated** | Low | `pnpm build:scenar-registry` is manual. Consider adding it as a pre-build step or watch task. |

---

## 11. What to Remove / Clean Up

| Item | Location | Action |
|------|----------|--------|
| **`RELEASE_READINESS_ANALYSIS.md`** | Root | Superseded by this document. Archive or remove after review. |
| **Empty `.postcssrc.json`** | Root | Contains `{ "plugins": {} }`. If PostCSS isn't configured, remove the file to reduce confusion. |
| **Empty `angular.json`** | Root | Contains `{ "projects": {} }`. Nx manages projects via `project.json` files. Remove if not needed by any tooling. |
| **Boilerplate library READMEs** | Various `libs/*/README.md` | Replace auto-generated Nx boilerplate with real content or remove and redirect to docs. |
| **Commented-out publish steps** | `.github/workflows/03-*.yml`, `04-*.yml` | Either implement or remove. Dead code in CI configs is confusing. |
| **`tmp/` directory** | Root | Verify it's in `.gitignore`. |
| **`playwright-report/` and `test-results/`** | Root | Verify these are in `.gitignore`. |

---

## 12. Prioritized Action Plan

### Phase 1: Critical (Must-Have for Beta)

These are blockers for anyone using the design system in a real project.

| # | Task | Area | Effort | Impact |
|---|------|------|--------|--------|
| 1 | **Add `@axe-core/playwright` to E2E tests** | A11y | Medium | **DEFERRED** - a11y score is 5/10; focus on fixing components first, then add automated checks. |
| 2 | ~~**Add E2E tests to CI pipeline**~~ | CI/CD | Low | ~~Prevents shipping broken interactions~~ **DONE** |
| 3 | **Write "Getting Started" guide for consumers** | Docs | Medium | Unblocks external adoption |
| 4 | ~~**Fix hardcoded CSS values** (button dark mode, badge radius, avatar color)~~ | Tokens | Low | **DONE** |
| 5 | **Add Husky + lint-staged pre-commit hooks** | DX | Low | **DEFERRED** - team decision to skip for now; CI catches lint issues. |
| 6 | **Expand data-grid README** | Docs | Medium | Most critical documentation gap |
| 7 | ~~**Add unit test for CoarMenuItemComponent**~~ | Testing | Low | **DONE** |
| 8 | ~~**Replace `setTimeout(10)` in menu item close**~~ | Code | Low | **DONE** |

### Phase 2: Important (Should-Have for GA)

These significantly improve quality and trust for production consumers.

| # | Task | Area | Effort | Impact |
|---|------|------|--------|--------|
| 9 | **Add per-component a11y documentation** (keyboard interactions, ARIA patterns) | A11y/Docs | High | Required for enterprise adoption |
| 10 | **Run Compodoc and publish API reference** | Docs | Medium | Consumers need API docs |
| 11 | **Add E2E tests for untested components** (buttons, inputs, selects, tabs, date pickers) | Testing | High | Major coverage gap |
| 12 | **Add copy-to-clipboard on showcase code examples** | Showcase | Low | Standard DX feature |
| 13 | **Add component status badges to showcase** (stable/beta/experimental) | Showcase | Low | Manages consumer expectations |
| 14 | **Expand thin library READMEs** (ui-menu, markdown-core, ui-overlay) | Docs | Medium | Consumer onboarding |
| 15 | ~~**Add test coverage thresholds to CI**~~ | Testing/CI | Low | ~~Prevents coverage regression~~ **DONE** - 50/40/50/50 thresholds on all libs, `--coverage` in CI. |
| 16 | **Add commitlint with conventional commits** | DX | Low | **DEFERRED** - depends on Husky (#5). |
| 17 | ~~**Create PR and issue templates**~~ | CI/CD | Low | ~~Standardizes contributions~~ **DONE** - PR template + bug report & feature request issue forms. |
| 18 | ~~**Add CSS token validation to CI**~~ (unused/undeclared vars) | CI/CD | Low | ~~Catches token drift~~ **DONE** |
| 19 | **Add search/filter to showcase sidebar** | Showcase | Medium | Navigation for 40+ components |
| 20 | **Write theming/customization guide** | Docs | Medium | How to brand Cocoar for your app |

### Phase 3: Polish (Nice-to-Have for Mature DS)

These are what separate a good design system from a great one.

| # | Task | Area | Effort | Impact |
|---|------|------|--------|--------|
| 21 | **Add visual regression testing** (Playwright screenshots or Percy) | Testing | Medium | Catches unintended visual changes |
| 22 | **Add bundle size tracking** (`size-limit` or similar) | CI/CD | Low | Prevents bloat |
| 23 | **Add Tab component activated/deactivated events** | Code | Low | Developer convenience |
| 24 | **Add showcase responsive layout** (mobile-friendly) | Showcase | Medium | Showcase works on all screens |
| 25 | **Add interactive playground** (tweak props live) | Showcase | High | Best-in-class DX |
| 26 | **Add dependency update automation** (Dependabot/Renovate) | CI/CD | Low | Security hygiene |
| 27 | **Add token documentation page to showcase** (all tokens with previews) | Showcase | Medium | Token discovery for consumers |
| 28 | **Generate per-library changelogs** | DX | Medium | Consumer upgrade confidence |
| 29 | **Add `forced-colors` / high-contrast support** | A11y | Medium | Windows high-contrast mode |
| 30 | **Evaluate token build pipeline** (style-dictionary for multi-format export) | Tokens | High | If consumers need JSON/TS/SCSS tokens |

---

## Appendix A: Library Dependency Graph

```
                     ┌─────────────┐
                     │  ui-tokens  │ (CSS variables, no TS deps)
                     └──────┬──────┘
                            │ (consumed via CSS @import)
                    ┌───────┴────────┐
                    │                │
             ┌──────▼──────┐  ┌─────▼──────┐
             │ui-components│  │  data-grid  │
             │ (32+ comps) │  │(AG Grid wrap│
             └──┬───┬──────┘  └────────────┘
                │   │
         ┌──────┘   └──────┐
         │                 │
   ┌─────▼─────┐    ┌─────▼─────┐
   │  ui-menu   │    │ui-overlay │
   │(7 comps)   │────│(engine)   │
   └────────────┘    └───────────┘

   ┌───────────────┐    ┌───────────────────┐
   │  localization  │    │ logging-abstractions│
   └───────────────┘    └────────┬──────────┘
                                 │
                        ┌────────▼──────────┐
                        │     logging       │
                        └───────────────────┘

   ┌───────────────┐    ┌───────────────────┐
   │ markdown-core  │    │    ui-routing     │
   └───────┬───────┘    └───────────────────┘
           │
   ┌───────▼────────┐
   │markdown-viewer  │
   └────────────────┘

   ┌───────────────┐
   │   ts-utils    │ (shared/ - used by localization, others)
   └───────────────┘
```

## Appendix B: File Counts by Library

| Library | TS Files | CSS Files | Test Files | Docs Files | Scenarios |
|---------|----------|-----------|------------|------------|-----------|
| ui-tokens | 1 | 20 | 0 | 1 | 0 |
| ui-components | ~80 | ~40 | ~30 | ~15 | ~10 |
| ui-menu | ~12 | ~6 | 3 | 0 | 1 |
| ui-overlay | ~12 | 0 | 3 | 0 | 0 |
| ui-routing | ~7 | 0 | 1 | 2 | 1 |
| data-grid | ~8 | 1 | 3 | 1 | 0 |
| localization | ~25 | 0 | 10+ | 1 | 1 |
| logging | ~15 | 0 | 11+ | 1 | 0 |
| logging-abstractions | ~5 | 0 | 2 | 1 | 0 |
| markdown-core | ~5 | 0 | 1 | 1 | 0 |
| markdown-viewer | ~3 | 1 | 1 | 1 | 0 |

---

> This document should be treated as a living roadmap. Update scores and check off items as they're
> completed. The Phase 1 items are the minimum bar for a credible beta release. Phase 2 is the bar
> for GA. Phase 3 is what makes the design system best-in-class.
