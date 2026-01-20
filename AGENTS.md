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

When working on tests (adding, updating, or debugging), also load:

5. **[docs/testing.md](docs/testing.md)** — How to run tests in this repo (Vitest + Playwright)
6. **[docs/testing-writing.md](docs/testing-writing.md)** — How to write tests (helpers, tags, `test.fixme` conventions)

When creating scenarios for component testing:

7. **[.github/skills/cocoar-scenarios/SKILL.md](.github/skills/cocoar-scenarios/SKILL.md)** — Agent Skill with templates for scenarios and Playwright tests

When creating documentation for components:

8. **[docs/writing-component-docs.md](docs/writing-component-docs.md)** — How to write JSDoc and `.docs.md` files

**⚠️ IMPORTANT:** AI assistants MUST load NAMING.md, ARCHITECTURE.md, and CONTRIBUTING.md into context before generating or modifying any files.

**These documents work together as a complete behavioral contract.**

---

## 🎯 Purpose

This document defines how AI assistants (GitHub Copilot, Claude, ChatGPT, etc.) work with the **Cocoar Design System** repository.

The goal: build Angular-based UI component libraries with design tokens (CSS variables) and structured logging.

---

## 🛠️ Technology Baseline (for all agents)

You MUST assume the following technology stack for this repository:

- Angular **21.x** (currently 21.0.6)
- Nx **22.x** (currently 22.3.3) as the workspace/orchestration tool
- Node.js **20.x or newer** (22.x recommended, compatible with Angular 21 and Nx 22)

Do NOT introduce:

- Angular 22+ features or experimental APIs without an explicit migration plan in ARCHITECTURE.md.
- Unplanned major upgrades that conflict with our current Angular 21 + Nx 22 setup.
- Breaking changes in executors/builders that conflict with our current Nx + Angular 21 setup.

When in doubt, **stay compatible with Angular 21**.

---

## 📦 Nx Usage Rules for Agents

- Nx is used as **monorepo orchestration**, NOT as a replacement for Angular itself.
- For Angular **apps** (showcase app, future styleguide app):
  - Prefer official Angular executors (`@angular-devkit/build-angular:*`) wrapped in Nx targets, unless ARCHITECTURE.md explicitly says otherwise.
- For Angular **publishable libraries** (e.g. `@cocoar/ui-forms`, `@cocoar/ui-grid`):
  - ALWAYS use `@nx/angular:package` as the packaging executor (APF via ng-packagr).
  - Do NOT introduce alternative packaging executors (`ng-packagr-lite`, custom builders, etc.) unless ARCHITECTURE.md is updated.
- For **non-Angular / pure TypeScript** libraries (e.g. `@cocoar/logging`):
  - Use simple TS builds (e.g. `@nx/js:tsc` or equivalent) – never ng-packagr.

If any blog, doc, or example uses a different builder/executor:

- Translate it into our model (see ARCHITECTURE.md).
- Do NOT blindly copy arbitrary builders into this repo.

---

## 🧭 Core Principles

- **Explain Why, Not What** — Comments describe _intent and reasoning_, not code behavior
- **Consistency Over Novelty** — Prefer predictable patterns that align with repository style
- **Simplicity and Intent** — Code should be self-explanatory and purposeful
- **Design Token Discipline** — All styling via CSS variables from Figma (see ARCHITECTURE.md)
- **Framework Purity** — No Tailwind, no global CSS, no styling assumptions in libraries
- **Incremental Improvement** — Every change leaves the codebase cleaner and more consistent

---

## 💬 Comment Policy: Why, Not What

Code comments should explain _why_ decisions were made, not _what_ the code does. Self-documenting code (clear naming, structure) is always preferable to comments.

### ✅ Keep These Comments

- **Rationale for non-obvious choices** — Why a specific algorithm, library, or approach was chosen
- **Performance trade-offs** — Justification for optimizations or deliberate inefficiencies
- **Browser compatibility workarounds** — Why unusual patterns exist for specific browsers
- **Accessibility decisions** — ARIA patterns, keyboard navigation, screen reader considerations
- **Design token usage** — Why specific tokens were chosen or why fallbacks exist
- **Future considerations** — TODOs with clear context (what, why, when)

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

- **Restating the code** — If the code is clear, don't repeat it in prose
- **Obvious descriptions** — Explaining what a well-named method does
- **Commented-out code** — Use version control, don't leave dead code
- **Debug/temporary comments** — "test", "TODO: fix this", etc. without context
- **Obsolete explanations** — Comments that no longer match the code
- **Auto-generated noise** — Boilerplate like "Constructor for X"

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
4. Only add a comment if the _why_ still isn't obvious

---

## 📋 Quick Reference Checklist

When working in this repository, AI assistants must:

### Architecture (see ARCHITECTURE.md)

- [ ] Use CSS variables only (no Tailwind, no hardcoded colors)
- [ ] Follow framework-pure patterns (no global CSS)
- [ ] Use `@cocoar/logging` (no `console.log`)
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
- [ ] **Create scenarios for new components/features** (Playwright > Vitest with heavy mocking)
- [ ] Document public APIs
- [ ] Update showcase app usage/examples for UI changes
- [ ] Remove unused imports/variables

### Testing & Scenarios

- [ ] **Create scenarios by default** for components, directives, and services
- [ ] Use integrated scenarios for related functionality (e.g., service + pipe + directive together)
- [ ] Prefer Playwright browser tests over Vitest with heavy mocking (more reliable)
- [ ] Follow [.github/skills/cocoar-scenarios/SKILL.md](.github/skills/cocoar-scenarios/SKILL.md) templates
- [ ] Regenerate registry after creating scenarios: `node scripts/scenar/generate-registry.mjs`

### Documentation (see [docs/writing-component-docs.md](docs/writing-component-docs.md))

- [ ] **Create `{kebab-name}.docs.md`** file for each component/directive
- [ ] Place docs file **next to source** (e.g., `coar-button/coar-button.docs.md`)
- [ ] Include: overview, usage examples, variants, accessibility, best practices
- [ ] Use JSDoc comments in TypeScript for API documentation (auto-generated)
- [ ] Run `pnpm docs:all` to regenerate documentation

**Documentation file naming:**
```
libs/ui-components/src/lib/coar-button/
├── coar-button.component.ts    # Source
└── coar-button.docs.md         # Usage docs (hand-written)

→ Generates:
docs/libs/ui-components/
├── coar-button.api.md          # API (auto-generated from JSDoc)
└── coar-button.docs.md         # Usage (copied from source)
```

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

- **Comment why, not what** — Focus on intent and reasoning
- **Follow NAMING.md** — All naming conventions (selectors, classes, CSS variables)
- **Follow ARCHITECTURE.md** — Framework purity, design tokens, component patterns
- **Follow CONTRIBUTING.md** — Quality standards, testing, definition of done
- **Create scenarios by default** — For components, directives, services; prefer Playwright over heavily-mocked Vitest
- **Create `{kebab-name}.docs.md`** — Usage docs next to component source
- **Use CSS variables only** — All styling from Figma tokens
- **Use `@cocoar/logging`** — No `console.log` in libraries
- **Test accessibility** — Keyboard navigation, ARIA, screen readers
- **Keep docs in sync** — Update README, showcase, and migration guides
- **Follow Definition of Done** — See CONTRIBUTING.md for the complete checklist

---

**Version:** 1.0.0

> This file defines the authoritative AI guidance for the Cocoar Design System repository.
> GitHub Copilot, Claude, ChatGPT, and other assistants should treat this as the primary behavioral contract.
>
> **Remember:** This document works with ARCHITECTURE.md, NAMING.md, and CONTRIBUTING.md as a complete system.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

<!-- @cocoar/ui-docs:start -->
## Cocoar Design System Documentation

When working with Cocoar components, consult the installed documentation:

- **Component catalog**: `node_modules/@cocoar/ui-docs/api/index.json`
  - Lists all available components with their package locations
- **API reference**: `node_modules/@cocoar/ui-docs/docs/libs/{package}/{kebab-name}.api.md`
  - Complete API documentation (inputs, outputs, methods, properties)
- **Usage examples**: `node_modules/@cocoar/ui-docs/docs/libs/{package}/{kebab-name}.docs.md`
  - Code examples, usage patterns, best practices

### Example packages

- `@cocoar/ui-components` - Core UI components (buttons, inputs, cards, etc.)
- `@cocoar/ui-menu` - Menu and navigation components
- `@cocoar/ui-overlay` - Overlay, popover, tooltip components
- `@cocoar/markdown-viewer` - Markdown rendering component

**Always prefer the installed documentation over assumptions or general knowledge.**
<!-- @cocoar/ui-docs:end -->

<!-- @cocoar/scenarios:start -->
## Scenario System for Component Testing

When creating scenarios for isolated component testing:

- **Agent Skill**: [.github/skills/cocoar-scenarios/SKILL.md](.github/skills/cocoar-scenarios/SKILL.md)
  - Concise templates for components, directives, and services
  - Playwright test examples
  - Registry generation workflow

**Use scenarios for:**
- Playwright E2E tests on isolated components
- Testing directives (with host component wrapper)
- Visual regression and accessibility testing

**Quick workflow:**
1. Create `*.scenario.ts` using template from Agent Skill
2. Run `node scripts/scenar/generate-registry.mjs`
3. Verify at `http://localhost:4300/__scenario/{id}`
4. Write Playwright test with `openScenario()` helper

**Full documentation:** [docs/writing-scenarios.md](docs/writing-scenarios.md)
<!-- @cocoar/scenarios:end -->
