# @cocoar/ui-docs Package

> **Audience:** Contributors and maintainers of the Cocoar Design System.
> **For consumers:** See [`README.md`](README.md)

## Purpose

Publishable npm package that bundles all documentation for the Cocoar Design System:
- Human-readable markdown guides
- Machine-readable API metadata (Compodoc JSON)
- Optimized for both developers and AI assistants

---

## 📦 What Gets Published

```
dist/libs/ui-docs/
├── package.json            # Package metadata
├── README.md               # Consumer documentation
├── docs/libs/              # Auto-generated component docs
│   └── {package}/{Component}/
│       ├── api.md          # API reference
│       └── overview.md     # Usage guide
└── api/                    # Auto-generated Compodoc JSON
    ├── index.json          # Package index
    └── {package}.json      # Component metadata
```

**Not published (internal only):**
- `AGENTS.md` - Internal AI instructions
- `COMPODOC-SETUP.md` - Developer setup guide
- `PACKAGE.md` - This file

---

## 🔄 Documentation Generation Workflow

### On Every Build

When running `nx build ui-docs`, Nx automatically:

1. **Runs dependency:** `@cocoar-ui/source:docs:all`
2. **Generates docs:**
   ```
   docs:clean    → Remove docs/libs/
   docs:api      → Generate libs/ui-docs/api/*.json (Compodoc)
   docs:api:markdown → Generate docs/libs/{package}/{Component}/api.md
   docs:overview → Copy *.component.md from source → docs/libs/{package}/{Component}/overview.md
   ```
3. **Builds package:** Compiles TypeScript and copies assets
4. **Output:** `dist/libs/ui-docs/` ready for publishing

### Source Files (Co-located with Components)

```
libs/ui-components/src/lib/coar-button/
├── coar-button.component.ts       # TypeScript source
└── coar-button.component.md       # Documentation (tracked in git)
```

### Generated Files (Gitignored, Auto-generated)

```
docs/libs/ui-components/CoarButtonComponent/
├── api.md       # Generated from TypeScript
└── overview.md  # Copied from coar-button.component.md

libs/ui-docs/api/ui-components.json  # Compodoc JSON
```

---

## 🧹 Maintenance

### Adding Documentation for a New Component

1. Create `{component-name}.component.md` next to the component TypeScript file
2. Write usage guide, examples, best practices
3. Build runs automatically generate `api.md` and copy `overview.md`

### Updating Documentation

1. Edit `{component-name}.component.md` in source folder
2. Run `pnpm docs:all` (or let build do it automatically)
3. Commit only the `.component.md` file (generated docs are gitignored)

### Scripts

```bash
pnpm docs:clean        # Remove docs/libs/ folder
pnpm docs:api          # Generate Compodoc JSON
pnpm docs:api:markdown # Generate api.md files
pnpm docs:overview     # Copy *.component.md to docs/libs/
pnpm docs:all          # Run all of the above
```

---

## 🔧 Build Configuration

**Nx caching enabled:**
- **Inputs:** TypeScript source files, `.component.md` files
- **Outputs:** `docs/libs/`, `libs/ui-docs/api/`
- **Result:** Docs only regenerate when source files change

**Asset copying (`project.json`):**
```json
"assets": [
  "libs/ui-docs/README.md",
  "libs/ui-docs/package.json",
  { "input": "docs/libs", "output": "docs/libs" },
  { "input": "libs/ui-docs/api", "output": "api" }
]
```

---

## 🤖 AI Assistant Integration

Consumers can add this to their `AGENTS.md`:

```markdown
## Cocoar Design System Documentation

1. **Discovery:** `node_modules/@cocoar/ui-docs/api/index.json`
2. **Component Docs:** `node_modules/@cocoar/ui-docs/docs/libs/{package}/{Component}/`
3. **Metadata:** `node_modules/@cocoar/ui-docs/api/{package}.json`
```

---

## 📋 Version Matching

Package version always matches library versions:
- `@cocoar/ui-docs@1.2.0` documents `@cocoar/ui-components@1.2.0`

Managed by Nx release (GitVersion).

1. **Version alignment:** GitVersion will automatically keep versions in sync
2. **Publishing:** Include in release workflow alongside other packages
3. **API generation:** Add JSON API docs to `libs/ui-docs/api/` (future task)
4. **Content organization:** Improve docs structure (future task)

## ✨ Benefits

- ✅ Root `docs/` stays visible on GitHub
- ✅ Showcase app unchanged (uses root `docs/`)
- ✅ Consumers get docs in `node_modules/@cocoar/ui-docs/`
- ✅ AI agents can discover and load documentation
- ✅ Version-matched documentation guaranteed
- ✅ No duplication, single source of truth
