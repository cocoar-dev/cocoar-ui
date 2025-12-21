# Component Test Host — Extraction & Reuse Guide

This doc is a practical guide to extract the Component Test Host (CT host) into a dedicated repository and reuse it in other projects.

The goal: in a consuming project, you should mostly just write stories (wrapper components + `CtStory` declarations). The host app + registry generation + guardrails should already be there.

---

## What To Extract

From this repo, the “portable core” is:

- Scripts:
  - `scripts/component-test-host/generate-ct-registry.mjs`
  - `scripts/component-test-host/check-ct-story-imports.mjs`
  - `scripts/component-test-host/ct-host-config.mjs`
  - `scripts/component-test-host/ct-host.config.schema.json`
- Config:
  - `ct-host.config.json`
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

### 1) Add `ct-host.config.json`

In the new repo root, create a `ct-host.config.json` matching that repo layout.

For a *plain Angular CLI* repo (no `apps/` folder), a typical config might be:

```json
{
  "tsconfigPath": "tsconfig.json",
  "outputFile": "src/app/ct/ct-registry.generated.ts",
  "ctStoriesRoot": "src/app/ct/stories",
  "searchRoots": ["src/app/ct/stories"],
  "ignoredDirNames": ["node_modules", "dist", ".git"]
}
```

For an *Nx repo* with a dedicated app, keep the existing defaults and adjust only if needed.

### 2) Add the scripts and hook them into your build

Minimum commands you need:

- `node scripts/component-test-host/check-ct-story-imports.mjs`
- `node scripts/component-test-host/generate-ct-registry.mjs`

In Nx, these are wired via `nx:run-commands` targets.

In plain Angular CLI, wire them in `package.json` scripts and run them before `ng serve` / `ng build`.

---

## Story Authoring Contract (What Consumers Write)

A “story” is an Angular wrapper component (template + providers + layout) plus a metadata object.

- Wrapper component lives next to its template and styles.
- Metadata is a `CtStory<YourStoryComponent>` object with `{ id: '...' }`.

Inputs are inferred automatically from `input<T>()` properties on the story wrapper component.

Overrides (`providers`, custom `inputs`) are supported only when the story metadata is:

- exported, and
- in a `*.ct-story.ts` file

This keeps runtime bundles clean and prevents eager-loading story modules.

---

## Guardrail: No Runtime Imports of `*.ct-story.ts`

The rule is:

- Only the generated registry may import `*.ct-story.ts`.

The script `scripts/component-test-host/check-ct-story-imports.mjs` enforces this.

---

## Migration Strategy From This Repo

Suggested order:

1. Copy scripts + config first.
2. Copy the CT host app.
3. Run generation and ensure the app builds.
4. Copy one story and verify it mounts at `/__ct/:id`.
5. Bring over Playwright helpers/tests.

If you want, we can also add a tiny wrapper CLI (e.g. `ct-host gen` / `ct-host check`) once the extracted repo is stable.
