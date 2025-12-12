# AI Assistant Guidelines

The authoritative AI assistant guidelines live at the repository root:

- [../AGENTS.md](../AGENTS.md)

This file exists only to keep docs discoverable when the `src/` folder is opened as the workspace.


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
- [ ] Document public APIs
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
* **Use `@cocoar/logging`** — No `console.log` in libraries
* **Test accessibility** — Keyboard navigation, ARIA, screen readers
* **Keep docs in sync** — Update README and migration guides
* **Follow Definition of Done** — See CONTRIBUTING.md for the complete checklist

---

**Version:** 1.0.0

> This file defines the authoritative AI guidance for the Cocoar Design System repository.
> GitHub Copilot, Claude, ChatGPT, and other assistants should treat this as the primary behavioral contract.
>
> **Remember:** This document works with ARCHITECTURE.md, NAMING.md, and CONTRIBUTING.md as a complete system.
