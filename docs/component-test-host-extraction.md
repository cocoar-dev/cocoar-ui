# Component Test Host — Extraction & Reuse Guide

This doc is a practical guide to extract the Component Test Host (CT host) into a dedicated repository and reuse it in other projects.

The goal: in a consuming project, you should mostly just write scenarios (wrapper components + `ScenarioDefinition` declarations). The host app + registry generation + guardrails should already be there.

---

## What To Extract

From this repo, the “portable core” is:

- Scripts:
  - `scripts/scenar-backstage/generate-scenar-registry.mjs`
  - `scripts/scenar-backstage/check-scenar-scenario-imports.mjs`
  - `scripts/component-test-host/ct-host-config.mjs` (shared loader; prefers `scenar-backstage.config.json`)
  - `scripts/scenar-backstage/scenar-backstage.config.schema.json`
- Config:
  - `scenar-backstage.config.json`
- The host Angular app:
  - `apps/component-test-host/**`

Optionally (recommended) also extract:

- Playwright helper(s) used by tests:
  - `apps/showcase-e2e/src/support/ct-host.ts`
- E2E runner orchestration (if you want “start servers + run Playwright” as one command):
  - `scripts/e2e/run-e2e.mjs`

---

## Recommended Target Structure (New Repo)

Create a new repo (example: `cocoar-component-test-host`) containing:

- an Angular app (plain Angular CLI or Nx app) for the CT host
- a Node CLI package (or just scripts) for generation/check
- documentation + examples

You can start with “scripts + app in the same repo”, and split into packages later.

---

## Making It Work In Another Repo

### 1) Add `scenar-backstage.config.json`

In the new repo root, create a `scenar-backstage.config.json` matching that repo layout.

For a *plain Angular CLI* repo (no `apps/` folder), a typical config might be:

```json
{
  "tsconfigPath": "tsconfig.json",
  "outputFile": "src/app/scenario/scenario-registry.generated.ts",
  "scenarioRoot": "src/app/scenario/scenarios",
  "searchRoots": ["src/app/scenario/scenarios"],
  "ignoredDirNames": ["node_modules", "dist", ".git"]
}
```

For an *Nx repo* with a dedicated app, keep the existing defaults and adjust only if needed.

### 2) Add the scripts and hook them into your build

Minimum commands you need:

- `node scripts/scenar-backstage/check-scenar-scenario-imports.mjs`
- `node scripts/scenar-backstage/generate-scenar-registry.mjs`

In Nx, these are wired via `nx:run-commands` targets.

In plain Angular CLI, wire them in `package.json` scripts and run them before `ng serve` / `ng build`.

---

## Scenario Authoring Contract (What Consumers Write)

A scenario is an Angular wrapper component (template + providers + layout) plus a metadata object.

- Wrapper component lives next to its template and styles.
- Metadata is a `ScenarioDefinition<YourScenarioComponent>` object with `{ id: '...' }`.

Inputs are inferred automatically from `input<T>()` properties on the scenario wrapper component.

Overrides (`providers`, custom `inputs`) are supported only when the scenario metadata is:

- exported, and
- in a `*.scenario.ts` file

This keeps runtime bundles clean and prevents eager-loading scenario modules.

---

## Guardrail: No Runtime Imports of `*.scenario.ts`

The rule is:

- Only the generated registry may import `*.scenario.ts`.

The script `scripts/scenar-backstage/check-scenar-scenario-imports.mjs` enforces this.

---

## Migration Strategy From This Repo

Suggested order:

1. Copy scripts + config first.
2. Copy the CT host app.
3. Run generation and ensure the app builds.
4. Copy one scenario and verify it mounts at `/__scenario/:id`.
5. Bring over Playwright helpers/tests.

If you want, we can also add a tiny wrapper CLI (e.g. `ct-host gen` / `ct-host check`) once the extracted repo is stable.
