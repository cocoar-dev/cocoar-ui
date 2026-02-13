# Local install (using packed .tgz artifacts)

This is the fastest way to validate the **published package output** without publishing to npm.

## 1) Download artifacts from CI

From the GitHub Actions run, download the artifact that contains the `.tgz` packages.

You should have a file like:
- `cocoar-ui-<version>.tgz`

## 2) Create a throwaway Angular app

Recommended: create it **outside** this monorepo.

## 3) Install tarballs

From the app folder:

```bash
npm i /path/to/cocoar-ui-<version>.tgz
```

## 4) Import tokens

In the app global stylesheet:

```css
@import '@cocoar/ui/styles/tokens/all.css';
```

## 5) Smoke test

- Render a few Coar components
- `ng build` should succeed
- If SSR is used: run the SSR build and make sure no browser-only imports break

## Current limitation: forms

Some Coar form controls support Angular forms via `ControlValueAccessor`, but coverage is not universal yet.

See `docs/recipes/forms-status.md` for the current supported list and the recommended temporary approach when a required control is not CVA-enabled.
