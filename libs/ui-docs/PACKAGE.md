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

This package includes a CLI to help consumers configure their development environment.

### CLI Tools

**Location:** `libs/ui-docs/bin/`

```
bin/
├── cli.mjs              # Main CLI entry point
├── create-skill.mjs     # Creates Agent Skill for GitHub Copilot
├── setup-agents.mjs     # Adds/updates AGENTS.md section
└── templates/
    ├── SKILL.md         # Agent Skill template
    └── AGENTS.md        # AGENTS.md section template
```

**Published as:** `npx @cocoar/ui-docs <command>`

### Commands

```bash
npx @cocoar/ui-docs init           # Complete setup (skill + AGENTS.md)
npx @cocoar/ui-docs create-skill   # Create Agent Skill only
npx @cocoar/ui-docs setup-agents   # Update AGENTS.md only
npx @cocoar/ui-docs help           # Show help
```

### How It Works

1. **create-skill:** Copies `bin/templates/SKILL.md` → `.github/skills/cocoar-component-usage/SKILL.md`
2. **setup-agents:** Injects or updates marked section in `AGENTS.md` using `<!-- @cocoar/ui-docs:start/end -->` markers
3. **init:** Runs both commands in sequence

### Agent Skill for Contributors

This repository includes a committed Agent Skill at [.github/skills/cocoar-component-usage/SKILL.md](../../.github/skills/cocoar-component-usage/SKILL.md) so contributors automatically get Copilot integration.

### Templates

**SKILL.md template:** Version-agnostic instructions that point to documentation discovery paths.

**AGENTS.md template:** Markdown section with markers for safe updates:
```markdown
<!-- @cocoar/ui-docs:start -->
## Cocoar Design System Documentation
...
<!-- @cocoar/ui-docs:end -->
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
