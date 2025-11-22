# AGENTS.md — AI Assistant Guidelines for the Cocoar Design System

> **System prompt for GitHub Copilot and other AI assistants:**
> Act as a context-aware assistant for this repository.
> Your responsibilities: ensure high-quality Angular/TypeScript code, maintain design system consistency, and prepare the repository for release.
> Always prioritize clarity, intent, and maintainability over verbosity.
> Follow the principles below and extend them as this repository evolves.

---

## 📚 Required Reading

1. **[AGENTS.md](AGENTS.md)** (this file) — AI behavior and core principles
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** — Technical architecture, patterns, and constraints
3. **[NAMING.md](NAMING.md)** — All naming conventions
4. **[CONTRIBUTING.md](CONTRIBUTING.md)** — Quality standards and workflows

**⚠️ IMPORTANT:** AI assistants MUST load NAMING.md, ARCHITECTURE.md, and CONTRIBUTING.md into context before generating or modifying any files.

**These documents work together as a complete behavioral contract.**

---

## 🎯 Purpose

This document defines how AI assistants (GitHub Copilot, Claude, ChatGPT, etc.) work with the **Cocoar Design System** repository.

The goal: build Angular-based UI component libraries with design tokens from Figma, structured logging, and Storybook documentation.

---

## 🧭 Core Principles

* **Explain Why, Not What** — Comments describe *intent and reasoning*, not code behavior
* **Consistency Over Novelty** — Prefer predictable patterns that align with repository style
* **Simplicity and Intent** — Code should be self-explanatory and purposeful
* **Design Token Discipline** — All styling via CSS variables from Figma (see ARCHITECTURE.md)
* **Framework Purity** — No Tailwind, no global CSS, no styling assumptions in libraries
* **Incremental Improvement** — Every change leaves the codebase cleaner and more consistent

---

## 💬 Comment Policy: Why, Not What

Code comments should explain *why* decisions were made, not *what* the code does. Self-documenting code (clear naming, structure) is always preferable to comments.

### ✅ Keep These Comments

* **Rationale for non-obvious choices** — Why a specific algorithm, library, or approach was chosen
* **Performance trade-offs** — Justification for optimizations or deliberate inefficiencies
* **Browser compatibility workarounds** — Why unusual patterns exist for specific browsers
* **Accessibility decisions** — ARIA patterns, keyboard navigation, screen reader considerations
* **Design token usage** — Why specific tokens were chosen or why fallbacks exist
* **Future considerations** — TODOs with clear context (what, why, when)

**Examples:**

```typescript
// Using IntersectionObserver instead of scroll events to reduce main thread work
// Improves performance for large grids with 1000+ rows
const observer = new IntersectionObserver(callback);

// Fallback to primary color because hover tokens don't exist in all themes yet
// TODO: Remove fallback when all themes define --coar-button-hover (Q2 2025)
background: var(--coar-button-hover, var(--coar-color-primary));

// role="button" required for Safari VoiceOver to announce clickable div
// Angular Material uses same pattern for custom button implementations
<div role="button" tabindex="0">
```

### ❌ Remove These Comments

* **Restating the code** — If the code is clear, don't repeat it in prose
* **Obvious descriptions** — Explaining what a well-named method does
* **Commented-out code** — Use version control, don't leave dead code
* **Debug/temporary comments** — "test", "TODO: fix this", etc. without context
* **Obsolete explanations** — Comments that no longer match the code
* **Auto-generated noise** — Boilerplate like "Constructor for X"

**Examples to remove:**

```typescript
// Create a button component
export class CoarButtonComponent { }

// Loop through items
for (const item of items) { ... }

// This method gets the configuration
getConfig(): Config { ... }

// TODO: fix
// const x = 5;
```

### 🔄 Prefer Refactoring Over Comments

When you're tempted to add a comment explaining complex code:

1. **Extract method** — Pull complexity into a well-named function
2. **Rename variables** — Make intent clear through naming
3. **Simplify logic** — Reduce cognitive load
4. Only add a comment if the *why* still isn't obvious

---

## 📋 Quick Reference Checklist

When working in this repository, AI assistants must:

### Architecture (see ARCHITECTURE.md)
- [ ] Use CSS variables only (no Tailwind, no hardcoded colors)
- [ ] Follow framework-pure patterns (no global CSS)
- [ ] Use `@cocoar/logging-core` (no `console.log`)
- [ ] Respect Nx monorepo structure
- [ ] Keep libraries isolated (minimal cross-dependencies)

### Naming (see NAMING.md)
- [ ] Follow `coar-` prefix for all selectors
- [ ] Use `CoarXxxComponent` class naming
- [ ] Use `--coar-*` for CSS variables
- [ ] Use `@cocoar/ui-*` for package names

### Code Quality (see CONTRIBUTING.md)
- [ ] Write clean, typed TypeScript (strict mode)
- [ ] Follow Angular style guides
- [ ] Add tests for new functionality
- [ ] Document public APIs
- [ ] Update Storybook stories for UI changes
- [ ] Remove unused imports/variables

### Performance (see ARCHITECTURE.md)
- [ ] Use `OnPush` change detection where appropriate
- [ ] Use `trackBy` for `*ngFor` on dynamic lists
- [ ] Document performance trade-offs

### Security (see ARCHITECTURE.md)
- [ ] Use Angular's sanitization for dynamic content
- [ ] Validate inputs early with clear errors
- [ ] Never log secrets or PII

---

## 🤔 When Unsure

If uncertain about a decision, AI assistants should:

1. **Favor existing patterns** — Check how similar problems are solved elsewhere in the codebase before introducing new approaches
2. **Prefer simplicity** — Use straightforward solutions over clever abstractions
3. **Ask, don't assume** — Flag ambiguity and present options rather than guessing user intent
4. **Suggest, don't dictate** — Present alternatives with clear trade-offs (performance, maintainability, complexity)
5. **Cite documentation** — Reference specific sections from AGENTS.md, ARCHITECTURE.md, NAMING.md, or CONTRIBUTING.md when explaining recommendations
6. **Follow NAMING.md** — All naming decisions must follow NAMING.md conventions

---

## 📝 Summary

* **Comment why, not what** — Focus on intent and reasoning
* **Follow NAMING.md** — All naming conventions (selectors, classes, CSS variables)
* **Follow ARCHITECTURE.md** — Framework purity, design tokens, component patterns
* **Follow CONTRIBUTING.md** — Quality standards, testing, definition of done
* **Use CSS variables only** — All styling from Figma tokens
* **Use `@cocoar/logging-core`** — No `console.log` in libraries
* **Test accessibility** — Keyboard navigation, ARIA, screen readers
* **Keep docs in sync** — Update README, Storybook, and migration guides

---

## ✅ Definition of Done

A change or release is complete when:

* Code aligns with ARCHITECTURE.md patterns
* NAMING.md conventions followed consistently
* CONTRIBUTING.md quality standards met
* No unused or redundant elements remain
* Intent is clear through naming, structure, or concise *why* comments
* Tests cover the changes and pass
* Storybook stories demonstrate the feature
* Breaking changes documented with migration guides

---

**Version:** 1.0.0

> This file defines the authoritative AI guidance for the Cocoar Design System repository.
> GitHub Copilot, Claude, ChatGPT, and other assistants should treat this as the primary behavioral contract.
> 
> **Remember:** This document works with ARCHITECTURE.md, NAMING.md, and CONTRIBUTING.md as a complete system.
