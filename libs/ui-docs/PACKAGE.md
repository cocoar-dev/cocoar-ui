# @cocoar/ui-docs Package

## ✅ Created

New publishable package at `libs/ui-docs/` that bundles all documentation.

## 📦 What Gets Published

When built, the package contains:

```
dist/libs/ui-docs/
├── package.json            # Package metadata with AI assistant hints
├── README.md               # How to use this package
├── AGENTS.md               # AI assistant guide (entry point)
├── docs/                   # Complete human-readable documentation
│   ├── components/
│   ├── consuming/
│   ├── foundations/
│   └── ... (all from root docs/)
├── api/                    # Machine-readable API (JSON)
│   └── .gitkeep (placeholder)
└── src/                    # Minimal TypeScript exports
```

## 🔧 How It Works

1. **Source:** Root `docs/` folder (unchanged, visible on GitHub)
2. **Build:** `pnpm nx build ui-docs` copies docs into distribution
3. **Publish:** Package includes both AI metadata and human docs
4. **Consumers:** `pnpm add -D @cocoar/ui-docs` for local documentation

## 🤖 AI Discovery

AI assistants find documentation via `package.json`:

```json
{
  "cocoar": {
    "type": "documentation",
    "aiAssistant": {
      "entryPoint": "./AGENTS.md",
      "humanDocs": "./docs/",
      "apiReference": "./api/"
    }
  }
}
```

## 📋 Next Steps

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
