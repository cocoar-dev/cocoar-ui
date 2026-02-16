# NAMING.md — Naming Conventions for the `cocoar-ui` Design System

This document defines the **official naming conventions** for all components, directives, CSS variables, libraries, tokens, utilities, and infrastructure packages inside the **cocoar-ui** repository.

These rules apply to:

* human developers
* LLM/KI agents
* processes generating code (schematics, Nx generators, scripts)

AGENTS.md refers to this file for all naming-related decisions.

---

# 1. Goals

* **Brand-consistent** naming that reflects **COcoAR → coar**.
* **Readable and pronounceable** for German and English developers.
* **Consistent** across all UI libraries, infrastructure libraries, and tokens.
* **Predictable** selectors and class names.
* Easy to search, refactor, and reason about.

---

# 2. Repository and Package Naming

## 2.1 Repository name

* **`cocoar-ui`**

Reason:

* Clear, brand-aligned
* Represents UI + design system + tokens + libraries

## 2.2 npm scope

All published packages use the **`@cocoar/*`** namespace.

## 2.3 UI package names

All UI libraries use secondary entry points under the **`@cocoar/ui`** package:

```
@cocoar/ui              (design tokens)
@cocoar/ui/components
@cocoar/ui/forms
@cocoar/ui/grid
@cocoar/ui/icons
@cocoar/ui/menu
@cocoar/ui/overlay
```

## 2.4 Infrastructure package names

Infrastructure packages like `@cocoar/logging` and `@cocoar/logging-angular` live in the separate [`cocoar-logging`](https://github.com/cocoar-dev/cocoar-logging) repository.

---

# 3. Angular Naming Conventions

The design system uses the prefix **`coar`**, derived from the brand **COcoAR** (beginning + end).

This applies to all Angular-facing names:

* selectors
* component class names
* directive selectors
* internal CSS classes

## 3.1 Component selectors

Selectors MUST:

* start with **`coar-`**
* be lowercase
* be kebab-case after the prefix

Examples:

```html
<coar-button></coar-button>
<coar-input></coar-input>
<coar-grid></coar-grid>
<coar-icon></coar-icon>
<coar-form-field></coar-form-field>
```

## 3.2 Directive selectors

Use attribute or structural selectors with the prefix **`coar`**:

```html
<button coarButton>Save</button>
<div coarTooltip="Hint">...</div>
<div *coarLet="value as v"></div>
```

## 3.3 Angular class names

Class names MUST:

* start with `Coar`
* end in `Component`, `Directive`, `Service`, `Pipe`, etc.
* use PascalCase

Examples:

```ts
export class CoarButtonComponent {}
export class CoarTooltipDirective {}
export class CoarGridComponent {}
export class CoarFormFieldComponent {}
export class CoarIconsRegistry {}
```

## 3.4 Module names (if needed)

While stand-alone components are preferred, any module MUST start with `Coar`:

```ts
export class CoarIconsModule {}
```

---

# 4. File and Folder Naming

## 4.1 File names

Kebab-case for all file names:

```
button.component.ts
button.component.html
button.component.css
grid.component.ts
form-field.directive.ts
```

## 4.2 Library folder names

Libraries inside `libs/` MUST use kebab-case:

```
libs/ui/styles/tokens/
libs/ui/components/
```

**Note:** The Nx workspace is located at the repository root.

---

# 5. CSS Naming

## 5.1 CSS variable prefix

All design-system tokens MUST use the prefix **`--coar-`**.

Examples:

```
--coar-color-primary
--coar-color-surface
--coar-color-text
--coar-radius-m
--coar-spacing-2
--coar-font-size-body
```

## 5.2 Component-level CSS variables

Components may define component-specific variables:

```
--coar-button-padding-x
--coar-grid-row-hover
--coar-input-border-color
```

## 5.3 Internal CSS class names

Internal class names MUST:

* start with `.coar-`
* use BEM-like structure where it helps readability

Examples:

```
.coar-button {}
.coar-button__icon {}
.coar-grid {}
.coar-grid__row {}
.coar-grid__cell {}
```

---

# 6. Design Token Naming

Tokens sourced from Figma and represented as CSS variables follow the **`coar-*`** naming.

## 6.1 Base token groups

```
coar-color-*
coar-radius-*
coar-spacing-*
coar-font-family-*
coar-font-size-*
coar-shadow-*
```

## 6.2 Conversion to CSS variables

Figma → token definitions → CSS variables

`coar-color-primary` becomes:

```
--coar-color-primary
```

---

# 7. Testing Naming

## 7.1 Test file names

```
*.spec.ts
```

## 7.2 Test IDs

Test attributes may use:

```
data-coar-test="button-primary"
data-coar-test="grid-row-1"
```

---

# 8. Example Summary

### Component

```ts
@Component({
  selector: 'coar-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class CoarButtonComponent {}
```

### CSS

```css
.coar-button {
  background: var(--coar-color-primary);
  padding: var(--coar-spacing-2);
}
```

### HTML usage

```html
<coar-button variant="primary">Save</coar-button>
```

# 9. Summary Checklist

* Prefix for Angular components/directives: **`coar`**
* Component classes: **`CoarNameComponent`**
* CSS variables: **`--coar-*`**
* CSS classes: **`.coar-*`**
* npm packages: **`@cocoar/ui/*`**
* Repo name: **`cocoar-ui`**

This file defines the authoritative naming standard for the entire `cocoar-ui` codebase.
