# Scenar (Backstage) — Extraction Handoff (from cocoar-ui)

Purpose: move the **scenario host tooling** (CLI + registry generator + guardrail + host app) into a **dedicated Git repository** named **`scenar`**, so cocoar-ui stays focused on the UI libraries.

Constraint (important): the new `scenar` repo must be **Cocoar-agnostic** and must **not** depend on any `@cocoar/*` packages.

This document is written to be copy-paste actionable.

---

## Executive Summary (1 page)

### What we are doing

We are extracting the “scenario host” capability out of `cocoar-ui` into a dedicated product repo called **`scenar`**.

In `cocoar-ui`, we only want to:

- install Scenar (CLI)
- add a Scenar config file
- author scenarios (wrapper components + `ScenarioDefinition<T>` metadata)
- run a single command to generate the registry and serve the host

### Why we are doing it

- `cocoar-ui` is a design system repo; the host tooling is infrastructure and shouldn’t dominate this workspace.
- A dedicated Scenar repo enables reuse across repos/libraries and surfaces missing features via real-world usage.
- It avoids mixing UI library development with tooling development.

### Key constraints / decisions

- **Repo name:** `scenar`
- **Backstage is one part:** today we extract Backstage; later we add Frontstage.
- **No `@cocoar/*` dependencies** in the Scenar repo.
  - Scenar must be generic; consumer repos provide their own components in scenarios.

### What Scenar Backstage contains (scope)

- Angular host app that mounts one scenario per route: `/__scenario/:id`
- Registry generator (ts-morph) scanning configured roots for:
  - `*.scenario.ts` metadata exports (`ScenarioDefinition<T>`)
  - `*.component.ts` wrapper components (within `scenarioRoot`)
- Guardrail: forbid runtime imports of `*.scenario.ts` except from the generated registry

### What is NOT finished yet (gap to end goal)

Extraction alone does not yet achieve “install-only + `scenar serve` in any repo”.

To reach that end state, Scenar CLI must add:

- `scenar init` (or similar) to scaffold/install the Backstage host app into a consuming repo (or manage a template internally)
- `scenar backstage serve` to run check + generate + start the dev server in one step

### Nx vs Angular CLI in the Scenar repo

Recommendation: use **Nx** inside the `scenar` repo because it will contain multiple deliverables (CLI + Backstage app + later Frontstage app).

Consumers should not need Nx; they run `scenar`.

### Main risk to plan for

The extracted Backstage app must be made **neutral**:

- remove Cocoar-specific styling imports and any dependencies on Cocoar packages
- include minimal demo scenarios implemented with plain Angular/HTML

### Immediate next steps (handoff-ready)

1) Create new Git repo folder `scenar`
2) Copy the paths listed below into it
3) Make the Backstage app Cocoar-agnostic (remove Cocoar imports; add plain demo scenarios)
4) Validate: check → generate → serve → open `/__scenario/<id>`
5) Iterate on CLI UX (`init`, `backstage serve`) so consumer repos only install + configure + author scenarios

## What “Scenar Backstage” is (current state)

Today, Scenar Backstage consists of:

- An Angular host app that mounts exactly one scenario at a time at `/__scenario/:id`.
- A registry generator (ts-morph) that scans configured roots for:
  - `*.scenario.ts` metadata exports (`ScenarioDefinition<T>`)
  - `*.component.ts` wrapper components (within a configured scenario root)
- A guardrail that forbids runtime imports of `*.scenario.ts` except from the generated registry.

Inside this repo, the host app is currently named `component-test-host`.

In the dedicated `scenar` repo, you will likely rename this app to `scenar-backstage` (recommended), but you can keep the current name during the first extraction if you want a low-risk lift-and-shift.

---

## Scenar-related paths in cocoar-ui (source of truth)

Copy these paths into the new repo.

### Host app (Angular)

- apps/component-test-host/

### Generator + config loader + guardrail (Node scripts)

- scripts/component-test-host/
  - ct-host-config.mjs (loads config)
  - generate-scenario-registry.mjs (ts-morph scan + codegen)
  - check-scenario-metadata-imports.mjs (guardrail)
  - ct-host.config.schema.json (schema for config)

### Scenar Backstage wrappers (current branded entry points)

- scripts/scenar-backstage/
  - generate-scenar-registry.mjs (wrapper entry)
  - check-scenar-scenario-imports.mjs (wrapper entry)

Optional but useful (added recently):

- scripts/scenar-backstage/scenar.mjs (tiny command router)
- scripts/scenar-backstage/scenar-export.mjs (copies a coarse-grained export folder)

### Root config file

- scenar-backstage.config.json

### Documentation

- docs/component-test-host.md
- docs/component-test-host-scenario-authoring.md
- docs/component-test-host-extraction.md

### Tests (optional to copy into new repo)

If the dedicated repo will be used to dogfood the workflow end-to-end, copy at least one smoke spec:

- apps/showcase-e2e/src/component-test-host/popover.spec.ts

If you copy that spec, you also need the Playwright runner orchestration that starts both servers:

- scripts/e2e/run-e2e.mjs
- apps/showcase-e2e/project.json
- apps/showcase-e2e/playwright.config.ts

Note: this repo’s e2e setup is oriented around the showcase app. In the dedicated Scenar repo, you can simplify to:
- only the host server, and
- one Playwright project that hits it.

---

## Target end state you described (what still needs to be built)

Your desired end state is:

1) In cocoar-ui (and other repos):
   - install Scenar (CLI + host)
   - add a config file
   - author scenarios anywhere (showcase or libraries)
   - run a single CLI command to generate registry + serve

2) In the dedicated Scenar repo:
   - provide that CLI, a stable host, and the authoring contract

Important implementation note:
- For consumers to run `scenar backstage serve` without checking in an Angular app, the CLI must provide an **init/scaffold** command that installs a small host app into the consuming repo (or a managed cache folder).
- Today, cocoar-ui contains the host app in-repo. Extraction gets you to “dedicated repo owns the host app”, but the “install-only” consumer workflow requires an additional step (CLI scaffolding or a packaged host template).

Important constraint for the new repo:
- Because `scenar` must not depend on `@cocoar/*`, the Backstage host app in the new repo must not import Cocoar tokens/components.
- The host app should ship with either:
  - minimal neutral styling, or
  - optional CSS hooks, but no design-system assumptions.

---

## Recommended repo shape for the dedicated Scenar repo

You asked: Nx or pure Angular CLI?

### Recommendation (given Backstage + future Frontstage): Nx monorepo

Reason: the `scenar` repo is a product repo with multiple deliverables over time:

- `scenar-cli` (Node)
- `scenar-backstage` (Angular app)
- future `scenar-frontstage` (Angular app)

Nx is excellent for keeping these in one place with consistent builds and caching.
This does **not** force consumers to use Nx: consumers still just run `scenar`.

Suggested Nx layout:

- package.json
- nx.json
- tsconfig.base.json
- apps/
  - scenar-backstage/         # Angular app (host)
  - scenar-frontstage/        # future Angular app (UI)
- packages/ (or libs/)
  - scenar-cli/               # Node CLI (bin: scenar)
  - scenar-core/              # shared types/parsers/config schema
- docs/

### Alternative: pure Angular CLI repo

Pick pure Angular CLI if you want the Scenar repo to be as simple as possible and you expect fewer internal packages.
It’s viable, but tends to get awkward once you add Frontstage + CLI + shared libs.

---

## Step-by-step extraction checklist (copying from cocoar-ui)

### Step 1: create a new empty Git repo

Example name: `scenar-backstage` or `scenar`.

### Step 2: copy the source folders

Copy the paths listed above into the new repo under the same relative locations (initially).

Minimum viable copy:
- apps/component-test-host/
- scripts/component-test-host/
- scripts/scenar-backstage/
- scenar-backstage.config.json
- docs/component-test-host*.md

### Step 3: make the new repo buildable

You will need to add:
- package.json with dependencies for:
  - Angular 20.x
  - ts-morph
  - Node types
  - whatever the host app imports

Key decision point (for Cocoar-agnostic requirement):

- The Backstage host app must become **neutral**:
  - remove any imports of Cocoar CSS/tokens/components
  - keep only framework-level dependencies (Angular + RxJS)

For demo content inside the Scenar repo:

- add 1–2 tiny example scenario components that use only plain HTML/Angular
- keep them under the Backstage app itself (e.g. `apps/scenar-backstage/src/app/scenarios/**`) so the repo is self-contained

### Step 4: verify generation

From the new repo root, run:

- node scripts/scenar-backstage/check-scenar-scenario-imports.mjs
- node scripts/scenar-backstage/generate-scenar-registry.mjs

Confirm it creates the generated registry file under the host app path.

### Step 5: verify serving

Serve the host app:
- With Nx (if you kept it): `pnpm nx serve component-test-host`
- With Angular CLI (if migrated): `pnpm ng serve`

### Step 6: verify one scenario loads

Open:
- http://localhost:4300/__scenario/<id>

### Step 7 (optional): add Playwright smoke

Add a minimal Playwright config and a single test that:
- navigates to `/__scenario/<id>`
- asserts the overlay opens (or any simple behavior)

---

## What cocoar-ui would look like after extraction (desired cleanup)

After you have a dedicated `scenar` repo, cocoar-ui should not contain:
- scripts/scenar-backstage/
- scripts/component-test-host/
- apps/component-test-host/
- scenar-backstage.config.json (unless you intentionally keep a local config for dev)

Instead cocoar-ui should have:
- a dev dependency on `scenar` (CLI)
- a Scenar config file (format owned by Scenar)
- scenario folders (wherever you choose)

Scenario location options in cocoar-ui:
- apps/showcase/src/app/scenarios/** (easy for humans)
- libs/<some-lib>/src/scenarios/** (keeps scenarios near components)
- a dedicated library, e.g. libs/ui-scenarios/ (clean separation)

The generator already supports scanning multiple roots via `searchRoots`.

Important: if scenarios are authored inside `cocoar-ui`, they will naturally reference Cocoar components.
That’s fine: Scenar remains Cocoar-agnostic; the consumer repo provides the components.

---

## Practical next step (what I suggest you do now)

1) Create the new `scenar` repo.
2) Copy the minimal set (host app + scripts + config + docs).
3) In the new repo, remove all Cocoar-specific imports and add minimal plain-Angular example scenarios.

Once you’ve created the new repo folder locally, tell me the path and its initial structure, and I’ll help you:
- set up the Nx-based `scenar` repo (or Angular CLI if you prefer),
- move generator/guardrail into a proper `scenar-core` + `scenar-cli`,
- and implement the consumer workflow (`scenar init`, `scenar backstage serve`) so cocoar-ui only installs Scenar + authors scenarios.
