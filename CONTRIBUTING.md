# Contributing

Thanks for your interest in contributing to the Coar Design System!

## Before You Start

**Please read these documents first:**

1. **[AGENTS.md](AGENTS.md)** — AI assistant guidelines (useful for understanding our standards)
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** — Technical architecture and patterns ⭐ **REQUIRED**
3. **[NAMING.md](NAMING.md)** — Naming conventions ⭐ **REQUIRED**

These documents define the foundation of the Coar Design System.

---

## Getting Started

1. Fork the repository and create a feature branch
2. Navigate to the repository root (Nx workspace root)
3. Install dependencies: `pnpm install`
4. Start the showcase app: `pnpm start`
5. Make your changes following the guidelines below

**Important:** All Nx commands must be run from the repository root (the Nx workspace root).

---

## Technology & Tooling Expectations

- This repository currently targets **Angular 20.x** and **Nx 22.x**.
- Do NOT upgrade Angular or Nx major versions on your own. Version upgrades are handled as dedicated, planned tasks and documented in ARCHITECTURE.md.
- All builds, tests, and app commands should be run via **Nx** targets (via `pnpm` scripts) rather than calling `ng` directly.
- Angular publishable libraries (e.g. `@cocoar/ui-*`) are packaged using `@nx/angular:package`. Do not introduce alternative packaging executors without discussion and an update to ARCHITECTURE.md.

For deeper architectural rules, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Architecture Guidelines

All technical architecture details are in **[ARCHITECTURE.md](ARCHITECTURE.md)**. Key points:

### Component Development
- Use the **`coar-`** prefix for all component selectors (see NAMING.md)
- Class names must start with **`Coar`** (e.g., `CoarButtonComponent`)
- Use **CSS variables only** for styling - no Tailwind, no global CSS
- Keep components framework-pure and reusable
- Follow the Nx monorepo structure

### Styling Rules
- All styling via CSS variables: `var(--coar-color-primary)`
- Design tokens come from Figma - don't hardcode values
- No SCSS variables in libraries (SCSS allowed in apps only)
- Scoped component styles only

### Logging
- Use `@cocoar/logging` for all logging
- No `console.log` in UI libraries
- Use structured logging: `logger.debug('Row selected {RowId}', { RowId: row.id })`

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for complete details on design tokens, performance patterns, and security guidelines.

---

## Development Workflow

**All commands must be run from the repository root:**

```bash
# Lint / test / build
pnpm lint
pnpm test
pnpm build

# Start the showcase app
pnpm start

# Run Playwright e2e tests
pnpm e2e
```

---

## Code Quality

- Write clean, typed TypeScript
- Follow Angular style guides
- Keep components small and focused
- Prefer composition over inheritance
- Add unit tests for new functionality
- Update docs / README when public APIs change

---

## Testing & Behavior

- Write tests that represent real-world behavior and critical paths
- Add regression tests for fixed bugs
- Test accessibility features (keyboard navigation, ARIA)
- Validate component behavior in the showcase app
- Keep test coverage from regressing

**Test Structure:**

```typescript
describe('CoarButtonComponent', () => {
  it('should emit clicked event when clicked', () => {
    // Arrange
    const fixture = TestBed.createComponent(CoarButtonComponent);
    const spy = jest.fn();
    fixture.componentInstance.clicked.subscribe(spy);

    // Act
    fixture.nativeElement.querySelector('button').click();

    // Assert
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

**Test Types:**
- Unit tests: `*.spec.ts` files alongside components
- E2E tests: Playwright tests in `apps/showcase-e2e/`
- Visual checks: validate component states in the showcase app

---

## Error Handling

Use meaningful, actionable error messages:

```typescript
// ❌ BAD - Generic and unhelpful
throw new Error('Invalid input');

// ✅ GOOD - Specific and actionable
throw new TypeError(
  `Invalid variant "${variant}". Expected "primary" or "secondary".`
);
```

---

## Common Pitfalls to Avoid

❌ **Documentation lag** — Examples reference old API signatures
❌ **Inconsistent naming** — Not following NAMING.md conventions
❌ **Hardcoded values** — Colors, spacing not using design tokens
❌ **Missing accessibility** — Components without keyboard support or ARIA
❌ **Console.log debugging** — Use `@cocoar/logging` instead
❌ **Global styles** — CSS that leaks outside component scope
❌ **Breaking changes unmarked** — Changed APIs without migration guide
❌ **Orphaned tests** — Tests for removed features still present

---

## Pull Requests

- Reference related issues in the PR description
- Describe user-facing changes
- Update docs / showcase examples if needed
- Ensure all tests pass
- Follow the naming conventions in NAMING.md

---

## Definition of Done

A change is complete when:

- [ ] Code follows ARCHITECTURE.md patterns
- [ ] NAMING.md conventions followed consistently
- [ ] Tests cover the changes and pass
- [ ] Showcase app demonstrates the feature
- [ ] Documentation updated (README, component docs)
- [ ] No unused imports or variables
- [ ] Breaking changes documented with migration guides
- [ ] Accessibility tested (keyboard, screen readers)
- [ ] Performance considered (OnPush, trackBy for lists)

---

## What Not To Do

❌ Don't add Tailwind or global CSS
❌ Don't hardcode colors or spacing
❌ Don't use `console.log` - use `@cocoar/logging`
❌ Don't bypass the design token system
❌ Don't introduce cross-library dependencies without discussion

---

## License

By contributing, you agree that your contributions will be licensed under the Apache License, Version 2.0.
