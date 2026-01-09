# @cocoar/ui-docs

Documentation package for the Cocoar Design System, optimized for both humans and AI assistants.

## 📦 Installation

```bash
npm add -D @cocoar/ui-docs
# or
pnpm add -D @cocoar/ui-docs
```

**Tip:** Install as a dev dependency to access documentation locally during development.

---

## 📖 For Developers

All documentation is available in `node_modules/@cocoar/ui-docs/`:

```
node_modules/@cocoar/ui-docs/
├── docs/libs/           # Component documentation
│   └── {package}/{Component}/
│       ├── api.md       # Auto-generated API reference
│       └── overview.md  # Usage guide and examples
├── api/                 # Machine-readable JSON (for tools/AI)
│   ├── index.json       # Package index
│   └── {package}.json   # Component metadata
└── README.md            # This file
```

### Example: Button Component

```
node_modules/@cocoar/ui-docs/docs/libs/ui-components/CoarButtonComponent/
├── api.md       # Inputs, outputs, methods
└── overview.md  # Examples, variants, best practices
```

---

## 🤖 For AI Assistants

This package provides structured documentation for AI assistants (GitHub Copilot, Claude, Cursor, etc.).

### Quick Start for AI

**Add to your project's `AGENTS.md` or similar:**

```markdown
## Cocoar Design System Documentation

When working with Cocoar components:

1. **Discovery:** Check `node_modules/@cocoar/ui-docs/api/index.json` for available packages and components
2. **Component Docs:** Load from `node_modules/@cocoar/ui-docs/docs/libs/{package}/{Component}/`
   - `api.md` - API reference (inputs, outputs, methods)
   - `overview.md` - Usage guide, examples, patterns
3. **Detailed Metadata:** Load `node_modules/@cocoar/ui-docs/api/{package}.json` for full Compodoc data

Documentation is version-matched with installed `@cocoar/*` packages.
```

### API Discovery

```typescript
// Load package index
import index from '@cocoar/ui-docs/api/index.json';
// { packages: [{ name: "ui-components", components: 26, ... }] }

// Load component metadata
import uiComponents from '@cocoar/ui-docs/api/ui-components.json';
// Compodoc JSON with full component details
```

### Documentation Paths

- **API Index:** `api/index.json`
- **Component Metadata:** `api/{package}.json`
- **Markdown Docs:** `docs/libs/{package}/{Component}/api.md` and `overview.md`

---

## 🔄 Version Matching

This package version always matches the corresponding `@cocoar/*` library versions:

- `@cocoar/ui-docs@1.2.0` → documents `@cocoar/ui-components@1.2.0`

---

## 📚 Package Contents

| Path | Description | Audience |
|------|-------------|----------|
| `docs/libs/` | Markdown documentation | Humans & AI |
| `api/*.json` | Compodoc JSON metadata | AI & Tools |
| `README.md` | This file | All |

---

## 📝 License

Apache-2.0
- `@cocoar/ui-docs@2.0.0` documents `@cocoar/ui-components@2.0.0`

Install the same version as your other Cocoar packages to ensure accurate documentation.

## 🔗 Links

- **Repository:** [github.com/cocoar-dev/cocoar-ui](https://github.com/cocoar-dev/cocoar-ui)
- **Browse docs online:** [github.com/cocoar-dev/cocoar-ui/tree/main/docs](https://github.com/cocoar-dev/cocoar-ui/tree/main/docs)
- **Issues:** [github.com/cocoar-dev/cocoar-ui/issues](https://github.com/cocoar-dev/cocoar-ui/issues)

## 📄 License

Apache-2.0 © Cocoar
