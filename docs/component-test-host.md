# Component Test Host (Prototype)

This repository intentionally does **not** use third-party component preview tooling.
To still enable *isolated, component-level* testing with Playwright (preview-iframe style), we have a dedicated Angular app:

- App: `apps/component-test-host`
- Default port: `4300`
- Primary route contract: `/__scenario/:id`

The goal is a minimal, deterministic host that can mount a single component at a time, with URL-driven inputs, and without any “showcase chrome”.

This document is written as a handoff for someone who has **no prior context**.

---

## Why We Want This

We want **fast, stable, isolated UI tests** for individual components using Playwright.

The showcase app is great for human exploration, but it is not a great *testing surface* for isolated component tests because it introduces:

- **Noise / flakiness risk**: layout, navigation, and unrelated demo logic can influence tests.
- **A moving target**: showcase pages are designed for docs/demos and can change often.
- **Harder selectors**: “chrome” and demo wrappers add DOM complexity.

Many preview tools solve this with a dedicated iframe that renders exactly one unit.
Since this repo avoids that class of tooling, we build the minimal equivalent ourselves.

---

## What We Want To Build

An Angular app that behaves like a “preview iframe”:

- One route that mounts **exactly one** component (or a tiny wrapper) at a time.
- URL-driven inputs (“args”) with an **allowlist** and **type parsing**.
- Optional per-component providers (overlay, i18n stubs, etc.).
- Minimal CSS to match the design system tokens.
- Deterministic defaults (noop animations).

This enables Playwright tests to be small and direct:

- Navigate to `/__scenario/<scenario-id>?arg=value`
- Assert behavior and accessibility
- Avoid reliance on showcase layouts

---

## Options We Considered (And Why We Rejected Them)

### 1) Use the showcase app routes for “component tests”

Idea: create dedicated showcase routes that only render the component.

Why this is not ideal:

- The showcase app is optimized for demos/docs, not as a stable minimal harness.
- Removing all layout/chrome per route becomes a permanent maintenance burden.
- It’s too easy for unrelated showcase concerns (navigation, markdown, page scaffolding) to leak into tests.

### 2) Add query-param driven “mount mode” to showcase

Idea: a single showcase route that reads query params and mounts a component dynamically.

Why we didn’t choose it:

- It couples the test harness to showcase implementation details.
- It risks mixing “demo UX” and “test harness” responsibilities in one app.

### 3) Use External Preview Tooling

Why we didn’t choose external preview tooling:

- This repository explicitly avoids that dependency surface (version drift, maintenance cost, extra tooling).
- We want an Angular-first solution fully controlled inside this monorepo.

### Conclusion

The least risky and most maintainable path is a **dedicated, minimal host app**.

---

## Goal

Provide a stable, scriptable surface for Playwright tests that want:

- **Isolation**: render one component (or a tiny wrapper) on a blank page.
- **Determinism**: noop animations by default; no unrelated demo layout.
- **URL-driven configuration**: mount component `:id` and pass a small allowlisted set of inputs via query params.
- A simple, registry-driven experience: a registry maps IDs → component import + providers + input parsing.

This is intended to become the foundation for “component testing with Playwright” in this monorepo.

---

## How It Works (High Level)

1. Playwright navigates to `/__scenario/:id` in the host app.
2. The page looks up `:id` in a TypeScript registry.
3. The registry entry:
  - lazy-imports the component
  - defines an allowlist of inputs and parsers
  - optionally provides Angular providers needed for that component
4. The host page dynamically creates the component with `ViewContainerRef.createComponent()`.

This keeps the system boring and explicit: every testable component must be registered.


## What We Have Now

### 1) A dedicated host app


Run it:

```bash
pnpm nx serve component-test-host
```

Then open:


Tip: Add query params based on the registry entry allowlist.

---

## Adding Scenarios Without Editing The Registry

Scenario authoring details (query params, parsing, overrides, custom parsers):

- See [docs/component-test-host-scenario-authoring.md](docs/component-test-host-scenario-authoring.md)

Scenarios are discovered automatically at build/serve time.

Scenarios can be discovered from either:

- `*.scenario.ts` files (recommended for sharing scenarios outside the host app)
- `*.component.ts` files inside `apps/component-test-host/src/app/scenario/scenarios/**` (handy for dedicated scenario wrapper components)

You can define one or multiple `ScenarioDefinition<...>` constants per file, and the constant name does not matter.

Example folder:

```
some-scenario/
  my-scenario.component.ts
  my-scenario.component.html
  my-scenario.component.css
  my-scenario.scenario.ts
```

Each scenario declaration must provide:

- `scenario.id` (registry key)

The registry generator infers the rest:

- `loadComponent()` is generated automatically (lazy `import()`)
- `inputs` allowlist is inferred from `input<T>()` properties on the scenario component
- optional overrides:
  - `scenario.inputs` (to override or disable inferred inputs)
  - `scenario.providers` (per-scenario providers)

The host app generates `apps/component-test-host/src/app/scenario/scenario-registry.generated.ts` by scanning for `**/*.scenario.ts` and scenario `*.component.ts` files under the host scenario folder.

The scanner paths are configurable via `scenar-backstage.config.json` at the repository root (useful when extracting this into another repo or a plain Angular CLI project).

Note: if a scenario declaration is not exported, the generator can still discover it, but runtime overrides like `providers` or custom `inputs` parser functions are ignored (unless the scenario is exported from a `*.scenario.ts` file).

---

## Rules (Enforced)

- Do: define scenarios in `*.scenario.ts` next to the scenario component (or inside scenario wrapper components).
- Do: keep scenario metadata isolated to the generator workflow.
- Don't: import `*.scenario.ts` modules from app/library runtime code.

This is enforced by a repo check (`component-test-host:check-scenar-scenario-imports`). The only allowed runtime importer is the generated registry file.


Component Test Host scenarios are exercised via the existing Playwright project in `apps/showcase-e2e`.

- Run only CT-host specs: `pnpm exec nx run showcase-e2e:ct-e2e`
- UI mode (only CT-host specs): `pnpm exec nx run showcase-e2e:ct-e2e-ui`

These commands start both servers (showcase + component-test-host) and then run Playwright with `--grep @ct-host`.
### 2) A registry-driven component loader

Registry location:

- `apps/component-test-host/src/app/scenario/scenario-registry.ts`

Each entry describes a **registered page unit**.

In practice, this should usually be a **scenario component** (a tiny wrapper) rather than a direct design-system component.
A scenario component can use content projection, `ng-template`, layout scaffolding, and multi-component setups.

Each registry entry describes:

- `id`: URL id (e.g. `coar-button`)
- `loadComponent()`: lazy import returning the Angular component type (usually a scenario wrapper)
- `providers?`: optional providers/environment providers for that entry
- `inputs?`: allowlisted query-param parsers

Current registry entries:

- `coar-button`

Allowlisted query params for `coar-button` (scenario component):

- `label` → string parser (projected content)
- `disabled` → boolean parser
- `loading` → boolean parser
- `variant` → enum parser
- `size` → enum parser

Example:

- `http://localhost:4300/__scenario/coar-button?disabled=true&label=Hello`

### 3) Dynamic mounting at `/__scenario/:id`

Host page:

- `apps/component-test-host/src/app/scenario/scenario-host.page.ts`

Behavior:

- Reads `:id` from the route
- Looks up the entry in `SCENARIO_REGISTRY`
- Parses allowlisted inputs from query params
- Mounts the component via `ViewContainerRef.createComponent()`
- Creates a per-entry `EnvironmentInjector` via `createEnvironmentInjector()` when entry providers are present

### 4) Minimal design-system styling

The host app imports design-system CSS so components render with the expected tokens/styles.

---

## File Map (Where To Look)

- App target config: `apps/component-test-host/project.json`
- Routes: `apps/component-test-host/src/app/app.routes.ts`
- Global providers (router, noop animations): `apps/component-test-host/src/app/app.config.ts`
- Component registry: `apps/component-test-host/src/app/scenario/scenario-registry.ts`
- Mounting page: `apps/component-test-host/src/app/scenario/scenario-host.page.ts`
- Host page UI/testids: `apps/component-test-host/src/app/scenario/scenario-host.page.html`
- Host page styling: `apps/component-test-host/src/app/scenario/scenario-host.page.css`
- App styles import: `apps/component-test-host/src/styles.css`

---

## Route Contract

- Path: `/__scenario/:id`
- Query params: only those allowlisted by the registry entry are applied as inputs.

Status/diagnostics are rendered by the host page (with `data-testid` hooks) to make Playwright assertions straightforward.

---

## Current Limitations (Known Gaps)

This is a **prototype v1**. The following capabilities are not implemented yet:

- **Content projection / templates**
  - Many components (e.g. buttons) receive label/content via projection rather than an `@Input()`.
  - We support this by registering **scenario components** (wrappers) that define the template and map URL args to component inputs and projected content.
  - Remaining gap: a shared convention for more complex scenario templates (multiple templates / `ng-template` switching) as the registry grows.

- **Output/event capture for Playwright**
  - There is no standardized way yet to subscribe to outputs and expose “last event payload” to the DOM for assertions.

- **Broader registry coverage**
  - Only `coar-button` is registered so far.

---

## Next Steps (Planned)

To make this practical for real Playwright component tests:

1. Add **per-entry wrapper/template support** (to handle content projection and complex setup).
2. Add **output capture** (expose events in a `data-testid` element for assertions).
3. Add at least one **overlay-heavy component** entry (e.g. menu) to validate isolation + overlay providers.

---

## How To Extend The Registry (Guidelines)

When adding a new entry to `SCENARIO_REGISTRY`:

- Keep the `id` stable (it becomes part of test URLs).
- Prefer **explicit allowlists** for inputs.
- Parse query params into the correct runtime type (boolean/number/string/enums).
- If the component needs specific providers, add them under `providers` for that entry.

Avoid “generic mount anything” behavior for now.
The registry is intentionally explicit so test URLs remain predictable and safe.

---

## Non-goals (For This Prototype)

- No integration with third-party preview tooling.
- No attempt to reproduce the entire showcase routing or navigation.
- No “gallery” UI; this is meant to be controlled by URL / Playwright.
