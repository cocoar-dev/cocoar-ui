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

## 🤖 AI Assistant Integration

This package provides structured documentation for AI assistants and includes tools to configure your development environment.

### Quick Setup (Recommended)

After installing `@cocoar/ui-docs`, run:

```bash
npx @cocoar/ui-docs init
```

This will:
- Create Agent Skill for GitHub Copilot (`.github/skills/cocoar-component-usage/`)
- Add/update AGENTS.md with Cocoar documentation paths

**Available commands:**
- `npx @cocoar/ui-docs init` - Complete setup (skill + AGENTS.md)
- `npx @cocoar/ui-docs create-skill` - Create Agent Skill only
- `npx @cocoar/ui-docs setup-agents` - Update AGENTS.md only
- `npx @cocoar/ui-docs help` - Show all commands

### Agent Skills (GitHub Copilot)

Agent Skills enable GitHub Copilot to automatically load Cocoar documentation when relevant. Run `npx @cocoar/ui-docs create-skill` to create:

```
.github/skills/cocoar-component-usage/SKILL.md
```

Copilot will automatically detect and use this skill when you ask about Cocoar components. Learn more at [agentskills.io](https://agentskills.io).

### AGENTS.md (All AI Assistants)

For broader AI assistant support (Copilot, Claude, Cursor, etc.), run `npx @cocoar/ui-docs setup-agents` to add this section to your AGENTS.md:

```markdown
## Cocoar Design System Documentation

When working with Cocoar components, consult the installed documentation:

- **Component catalog**: `node_modules/@cocoar/ui-docs/api/index.json`
- **API reference**: `node_modules/@cocoar/ui-docs/docs/libs/{package}/{ClassName}/api.md`
- **Usage examples**: `node_modules/@cocoar/ui-docs/docs/libs/{package}/{ClassName}/overview.md`

Always prefer the installed documentation over assumptions.
```

### Manual Configuration

If you prefer not to use the CLI, add the discovery paths to your AGENTS.md or custom instructions manually:

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

---

## 🔍 API Discovery for Tools

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
