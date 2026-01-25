# Build Scripts

Utility scripts for the Coar Design System, primarily JavaScript/TypeScript with some PowerShell for CSS analysis.

## Structure

```
scripts/
  shared/           <- Reusable utility modules
    git-utils.mjs   <- Git repository utilities
    svg-utils.mjs   <- SVG processing and validation
  css/              <- CSS analysis tools
    find-unused-css.mjs
    find-css-fallbacks.ps1
    find-undeclared-css-vars.ps1
  docs/             <- Documentation generation
    extract-component-api.mjs
    generate-api-markdown.mjs
    generate-compodoc.mjs
    copy-docs-to-dist.mjs
    copy-overview-docs.mjs
    clean-docs.mjs
    migrate-overview-to-source.mjs
  e2e/              <- E2E test utilities
    run-e2e.mjs
  icons/            <- Icon build scripts
    build-frontend-icons.mjs
  scenar/           <- Scenario testing
    generate-registry.mjs
  testing/          <- Test utilities
    check-e2e-tags.mjs
```

## Common Tasks

### Build Frontend Icons

Generates TypeScript icon definitions from SVG files:

```bash
node scripts/icons/build-frontend-icons.mjs
```

### Generate Scenario Registry

Creates the scenario registry for isolated component testing:

```bash
node scripts/scenar/generate-registry.mjs
```

### Documentation Generation

Generate API documentation for components:

```bash
node scripts/docs/generate-api-markdown.mjs
```

### CSS Analysis

Find unused CSS variables:

```bash
node scripts/css/find-unused-css.mjs
```

Find CSS fallback values (PowerShell):

```powershell
./scripts/css/find-css-fallbacks.ps1
```

### E2E Tag Linting

Verify E2E tests have proper tags:

```bash
node scripts/testing/check-e2e-tags.mjs
```

## Shared Utilities

### git-utils.mjs

- `findGitRoot(startPath)` - Find the git repository root directory

### svg-utils.mjs

- `normalizeSvg(svg, options)` - Parse, clean, and minify SVG content
- `validateSvg(svg, filename)` - Security validation (no scripts, event handlers)
- `escapeSvgForJs(svg)` - Escape SVG for JavaScript template literals

## Adding New Scripts

1. Create your script as an `.mjs` file in the appropriate subdirectory
2. Use ES modules for imports:
   ```javascript
   import { findGitRoot } from '../shared/git-utils.mjs';
   import { normalizeSvg, validateSvg } from '../shared/svg-utils.mjs';
   ```
3. Add to `package.json` scripts if needed for common use
