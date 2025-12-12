# Local install (using packed .tgz artifacts)

This is the fastest way to validate the **published package output** without publishing to npm.

## 1) Download artifacts from CI

From the GitHub Actions run, download the artifact that contains the `.tgz` packages.

You should have files like:
- `cocoar-ui-components-<version>.tgz`
- `cocoar-ui-tokens-<version>.tgz`
- `cocoar-logging-<version>.tgz`
- `cocoar-logging-abstractions-<version>.tgz`

## 2) Create a throwaway Angular app

Recommended: create it **outside** this monorepo.

## 3) Install tarballs

From the app folder:

```bash
npm i /path/to/cocoar-ui-components-<version>.tgz \
      /path/to/cocoar-ui-tokens-<version>.tgz \
      /path/to/cocoar-logging-<version>.tgz \
      /path/to/cocoar-logging-abstractions-<version>.tgz
```

## 4) Import tokens

In the app global stylesheet:

```css
@import '@cocoar/ui-tokens/css/all.css';
```

## 5) Smoke test

- Render a few Coar components
- `ng build` should succeed
- If SSR is used: run the SSR build and make sure no browser-only imports break

## Current limitation: forms

Coar input-like controls do not support `ControlValueAccessor` yet, so don’t use `formControlName` with them (see `docs/recipes/forms-status.md`).
