# Showcase App Page Standards

> **Purpose:** Ensure visual consistency across all component showcase pages
> **Last Updated:** December 2025

---

## 📐 Page Structure

All component pages follow this consistent structure:

```html
<div class="component-page">
  <header class="page-header">
    <h1 class="coar-title">Component Name</h1>
    <p class="description coar-body">Brief description of the component.</p>
  </header>

  <coar-tab-group [(activeTab)]="activeTab">
    <coar-tab id="examples" [content]="examplesTemplate">Examples</coar-tab>
    <coar-tab id="api" [content]="ShowcaseMarkdownTabContentComponent" [contentInputs]="{ path: apiPath }">API</coar-tab>
    <coar-tab id="docs" [content]="ShowcaseMarkdownTabContentComponent" [contentInputs]="{ path: docsPath }">Docs</coar-tab>
  </coar-tab-group>
</div>

<ng-template #examplesTemplate>
  <div class="examples-content">
    <!-- Sections go here -->
  </div>
</ng-template>
```

### Key Features

* **Fixed Header Height (100px min-height)** — Keeps tab group at consistent vertical position
* **Standard Typography Classes** — Use `coar-title`, `coar-body`, `coar-heading`, etc.
* **Section Dividers** — `<coar-divider [spacingTop]="16" [spacingBottom]="48" />`

---

## 📦 Section Pattern

Each example section follows this structure:

```html
<section class="example-section">
  <h2 class="coar-heading">Section Title</h2>
  <p class="section-intro coar-body-small">Description of what's being demonstrated.</p>

  <div class="example-demo">
    <!-- Component demo here -->
  </div>

  <coar-code-block [code]="codeExamples.variant" language="html" [collapsed]="true" />
</section>

<coar-divider [spacingTop]="16" [spacingBottom]="48" />
```

### Guidelines

* **Section Title** — `<h2 class="coar-heading">` for main sections
* **Section Intro** — `<p class="section-intro coar-body-small">` for descriptions
* **Demo Container** — Use `example-demo` class for demo content
* **Dividers** — Separate sections with `<coar-divider>`

---

## 💻 Code Block Standards

### Default Pattern (Collapsed)

Most code blocks should be **collapsed by default** to reduce visual clutter:

```html
<coar-code-block
  [code]="codeExamples.example"
  language="html"
  [collapsed]="true" />
```

### Expanded for Simple Examples

Only use `[collapsed]="false"` for:
- Simple examples (< 10 lines)
- Essential code that users need to see immediately
- Quick reference snippets

```html
<coar-code-block
  [code]="codeExamples.simple"
  language="html"
  [collapsed]="false" />
```

### Copy Button

The copy button is **enabled by default** (`[showCopyButton]="true"`). Only disable for non-copyable content.

---

## 🎨 CSS Standards

### File Structure

Each page has a CSS file: `pages/[component]/[component].page.css`

**RULES:**
- ✅ **DO** add page-specific demo layouts
- ✅ **DO** add unique component-specific styles
- ❌ **DON'T** override `.component-page`, `.page-header`, `.examples-content`, `.example-section`
- ❌ **DON'T** duplicate patterns from `showcase-pages.css`

### Standard Header Comment

```css
/* ========================================
   COMPONENT PAGE - Component-specific styles
   ========================================
   Shared styles are inherited from showcase-pages.css
   Only add styles specific to this page here
   ======================================== */
```

### When to Add Page-Specific CSS

Only when:
1. **Unique demo layout** — Grids, positioning demos, special containers
2. **Component-specific visuals** — Value displays, interactive controls
3. **Specialized patterns** — Not reusable across other pages

Examples:
- `single-select.page.css` — `.demo-value-object` (JSON display)
- `tooltip.page.css` — `.interactive-demo`, `.demo-controls`
- `overlay.page.css` — `.context-area`, `.container-box`

---

## 📐 Common Layout Patterns

These patterns are **defined in `showcase-pages.css`** and available globally:

### Demo Containers

```css
.example-demo              /* Standard demo container, max-width: varies */
.example-demo--two-col     /* Grid: 2 columns */
.example-demo--three-col   /* Grid: 3 columns */
.example-demo--four-col    /* Grid: 4 columns */
.example-demo--form        /* Form inputs, max-width: 400px */
```

### Row Layouts

```css
.demo-row                  /* Horizontal flex row */
.demo-row--align-end       /* Items aligned to bottom */
.demo-row--large-gap       /* gap: 1.5rem */
```

### Value Displays

```css
.value-display             /* For showing selected values */
.demo-value                /* Caption-sized value text */
```

### Grids

```css
.responsive-grid--sm       /* min: 180px */
.responsive-grid--md       /* min: 240px */
.responsive-grid--lg       /* min: 300px */
```

---

## 🎯 Typography Standards

Use design system typography classes from `@cocoar/ui`:

| Element | Class | Usage |
|---------|-------|-------|
| Page Title | `coar-title` | Main page header (h1) |
| Section Title | `coar-heading` | Section headers (h2) |
| Subsection | `coar-subheading` | Subsection headers (h3) |
| Body Text | `coar-body` | Standard paragraphs |
| Small Text | `coar-body-small` | Section intros, descriptions |
| Code Inline | `<code>` | Auto-styled via `.description code` |
| Labels | `coar-caption` | Size labels, metadata |

**NEVER** set `font-size`, `font-weight`, `font-family` in page CSS. Use typography classes.

---

## 🔧 Interactive Demos

For interactive demos with controls:

```html
<div class="example-demo">
  <div class="example-preview">
    <coar-component [prop]="value()" (eventChange)="value.set($event)" />
  </div>
  <div class="value-display coar-body-small">
    Selected: <code>{{ value() }}</code>
  </div>
</div>
```

### Pattern Guidelines

* Use **signals** for reactive state: `value = signal('default')`
* Display current state in `.value-display`
* Wrap code values in `<code>` tags

---

## ✅ Page Checklist

Before considering a page "done":

- [ ] Fixed header height (no custom `.page-header` overrides)
- [ ] Uses typography classes (`coar-title`, `coar-body`, etc.)
- [ ] Sections separated by `<coar-divider [spacingTop]="16" [spacingBottom]="48" />`
- [ ] Code blocks collapsed by default (`[collapsed]="true"`)
- [ ] Page CSS minimal (no shared pattern duplicates)
- [ ] Standard header comment in CSS file
- [ ] Responsive on mobile (test grid layouts)

---

## 📚 Reference Files

* **Shared Styles:** `apps/showcase/src/app/shared/showcase-pages.css`
* **Example Pages:**
  - `pages/buttons/buttons.page.html` — Well-structured component page
  - `pages/checkboxes/checkboxes.page.html` — Interactive demos with state
  - `pages/icons/icons.page.html` — Gallery layout pattern

---

## 🚀 Migration Guide

If updating an old page:

1. **Check CSS file** — Remove `.component-page`, `.page-header`, `.examples-content` duplicates
2. **Update header** — Ensure page header uses standard structure
3. **Section dividers** — Replace manual spacing with `<coar-divider>`
4. **Code blocks** — Set `[collapsed]="true"` by default
5. **Typography** — Replace manual styles with `coar-*` classes
6. **Test consistency** — Compare with buttons/checkboxes pages

---

**Version:** 1.0
**Maintained by:** Cocoar Design System Team
