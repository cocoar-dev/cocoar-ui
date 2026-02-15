/**
 * Renderers — generate llms.txt and llms-full.txt markdown from parsed
 * component documentation objects.
 */

// ─── llms.txt (compact index) ────────────────────────────────────────

/**
 * Render the compact llms.txt index.
 * @param {import('./parsers.mjs').parseEntry[]} docs
 */
export function renderCompact(docs) {
  const lines = [];

  lines.push('# Cocoar UI');
  lines.push('> Angular 21 component library with design tokens. Package: @cocoar/ui');
  lines.push('');
  lines.push('Docs: https://cocoar-dev.github.io/cocoar-ui/');
  lines.push('Source: https://github.com/cocoar-dev/cocoar-ui');
  lines.push('');

  // Group by category
  const grouped = groupByCategory(docs);

  for (const [category, entries] of grouped) {
    lines.push(`## ${category} Components`);
    lines.push('');

    for (const doc of entries) {
      if (doc.isUtilityGroup) {
        lines.push(renderCompactUtilityGroup(doc));
        continue;
      }

      if (doc.isCssOnly) {
        lines.push(renderCompactCssOnly(doc));
        continue;
      }

      // For multi-item entries (e.g. menu with menu-item, submenu-item, etc.)
      for (const item of doc.items) {
        if (!item.selector && item.kind !== 'service') continue;
        lines.push(renderCompactItem(doc, item));
      }
    }
    lines.push('');
  }

  return lines.join('\n').trim() + '\n';
}

function renderCompactItem(doc, item) {
  const parts = [];
  const anchor = item.selector || item.className;

  if (item.kind === 'service') {
    const methods = item.publicMethods.map((m) => m.name).join(', ');
    parts.push(`- [${item.className}](#${anchor}): Service — methods: ${methods || 'n/a'}`);
  } else {
    const summary = buildCompactSummary(doc, item);
    parts.push(`- [${item.selector}](#${anchor}): ${summary}`);
  }

  return parts.join('');
}

function buildCompactSummary(doc, item) {
  const bits = [];

  // Description from JSDoc
  if (item.jsdoc) {
    const firstLine = item.jsdoc.split('\n')[0];
    bits.push(firstLine);
  }

  // Key inputs summary
  const variantInput = item.inputs.find((i) => i.name === 'variant');
  if (variantInput) {
    bits.push(`variants ${variantInput.type.replace(/'/g, '')}`);
  }

  const sizeInput = item.inputs.find((i) => i.name === 'size');
  if (sizeInput) {
    bits.push(`sizes ${sizeInput.type.replace(/'/g, '')}`);
  }

  if (item.isCva) bits.push('CVA (forms compatible)');

  return bits.join(' — ') || humanize(doc.name);
}

function renderCompactCssOnly(doc) {
  const classes = doc.items[0]?.cssClasses?.slice(0, 5).join(', ') || '';
  return `- [link](#coar-link): CSS-only link styling — classes: ${classes || '.coar-link'}`;
}

function renderCompactUtilityGroup(doc) {
  const names = doc.utilities.slice(0, 5).map((u) => u.name).join(', ');
  const typeNames = doc.types.map((t) => t.name).join(', ');
  const parts = [];
  if (typeNames) parts.push(`types: ${typeNames}`);
  if (names) parts.push(`functions: ${names}`);
  return `- [${doc.name}](#${doc.name}): Utility exports — ${parts.join('; ') || 'helpers'}`;
}

// ─── llms-full.txt (full API reference) ──────────────────────────────

/**
 * Render the full llms-full.txt reference.
 * @param {import('./parsers.mjs').parseEntry[]} docs
 */
export function renderFull(docs) {
  const lines = [];

  lines.push('# Cocoar UI — Full API Reference');
  lines.push('> Angular 21 component library with design tokens. Package: @cocoar/ui');
  lines.push('');
  lines.push('Docs: https://cocoar-dev.github.io/cocoar-ui/');
  lines.push('Source: https://github.com/cocoar-dev/cocoar-ui');
  lines.push('');

  const grouped = groupByCategory(docs);

  for (const [category, entries] of grouped) {
    lines.push(`---`);
    lines.push('');
    lines.push(`# ${category}`);
    lines.push('');

    for (const doc of entries) {
      if (doc.isUtilityGroup) {
        lines.push(renderFullUtilityGroup(doc));
        continue;
      }

      if (doc.isCssOnly) {
        lines.push(renderFullCssOnly(doc));
        continue;
      }

      // Render each item (component/directive/service)
      for (const item of doc.items) {
        if (!item.selector && item.kind !== 'service') continue;
        lines.push(renderFullItem(doc, item));
      }

      // Render shared types for this entry
      if (doc.types.length > 0 || doc.interfaces.length > 0) {
        lines.push(renderFullTypes(doc));
      }
    }
  }

  return lines.join('\n').trim() + '\n';
}

function renderFullItem(doc, item) {
  const lines = [];
  const heading = item.selector || item.className;

  lines.push(`## ${heading}`);
  lines.push('');

  // Kind badge
  if (item.kind === 'service') {
    lines.push(`**Kind:** Service (Injectable, providedIn: root)`);
  } else if (item.kind === 'directive') {
    lines.push(`**Kind:** Directive`);
    if (item.selector) lines.push(`**Selector:** \`${item.selector}\``);
    if (item.exportAs) lines.push(`**Export As:** \`${item.exportAs}\``);
  } else {
    lines.push(`**Selector:** \`<${item.selector}>\``);
  }

  if (item.className) {
    lines.push(`**Class:** \`${item.className}\``);
    lines.push(`**Import:** \`import { ${item.className} } from '@cocoar/ui';\``);
  }

  if (item.isCva) {
    lines.push(`**Forms:** Compatible with Angular Reactive Forms and ngModel (ControlValueAccessor)`);
  }

  lines.push('');

  // JSDoc description
  if (item.jsdoc) {
    lines.push(item.jsdoc);
    lines.push('');
  }

  // ── Inputs ──
  const allInputs = [...item.inputs];
  if (allInputs.length > 0) {
    lines.push('### Inputs');
    lines.push('');
    lines.push('| Name | Type | Default | Required | Description |');
    lines.push('|------|------|---------|----------|-------------|');
    for (const inp of allInputs) {
      const type = `\`${inp.type}\``;
      const def = inp.default ? `\`${inp.default}\`` : '—';
      const req = inp.required ? 'Yes' : 'No';
      const desc = inp.jsdoc?.split('\n')[0] || '';
      lines.push(`| ${inp.name} | ${type} | ${def} | ${req} | ${desc} |`);
    }
    lines.push('');
  }

  // ── Host directive inputs (forwarded) ──
  if (item.hostDirectiveInputs.length > 0) {
    lines.push('### Host Directive Inputs (forwarded)');
    lines.push('');
    for (const name of item.hostDirectiveInputs) {
      lines.push(`- \`${name}\``);
    }
    lines.push('');
  }

  // ── Models ──
  if (item.models.length > 0) {
    lines.push('### Two-Way Bindings (model)');
    lines.push('');
    lines.push('| Name | Type | Default | Description |');
    lines.push('|------|------|---------|-------------|');
    for (const mod of item.models) {
      const type = `\`${mod.type}\``;
      const def = mod.default ? `\`${mod.default}\`` : '—';
      const desc = mod.jsdoc?.split('\n')[0] || '';
      lines.push(`| ${mod.name} | ${type} | ${def} | ${desc} |`);
    }
    lines.push('');
    lines.push('> Use `[(name)]` for two-way binding or `(nameChange)` to listen for changes.');
    lines.push('');
  }

  // ── Outputs ──
  if (item.outputs.length > 0) {
    lines.push('### Outputs');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|------|------|-------------|');
    for (const out of item.outputs) {
      const type = `\`${out.type}\``;
      const desc = out.jsdoc?.split('\n')[0] || '';
      lines.push(`| ${out.name} | ${type} | ${desc} |`);
    }
    lines.push('');
  }

  // ── Service methods ──
  if (item.publicMethods.length > 0) {
    lines.push('### Methods');
    lines.push('');
    for (const method of item.publicMethods) {
      lines.push(`#### \`${method.name}(${method.params}): ${method.returnType}\``);
      if (method.jsdoc) lines.push(method.jsdoc);
      lines.push('');
    }
  }

  // ── Content slots ──
  if (item.slots.length > 0) {
    lines.push('### Content Slots');
    lines.push('');
    for (const slot of item.slots) {
      if (slot === '(default)') {
        lines.push('- Default slot: `<ng-content />`');
      } else {
        lines.push(`- \`${slot}\``);
      }
    }
    lines.push('');
  }

  // ── CSS custom properties ──
  const componentSpecificProps = item.customProperties.filter(
    (p) => isComponentSpecificProp(p.name, item.selector)
  );
  if (componentSpecificProps.length > 0) {
    lines.push('### CSS Custom Properties');
    lines.push('');
    lines.push('| Property | Default |');
    lines.push('|----------|---------|');
    for (const prop of componentSpecificProps) {
      const fallback = prop.fallback || '—';
      lines.push(`| \`${prop.name}\` | ${fallback} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function renderFullTypes(doc) {
  const lines = [];

  if (doc.types.length > 0 || doc.interfaces.length > 0) {
    lines.push(`### Related Types`);
    lines.push('');

    for (const t of doc.types) {
      lines.push(`\`\`\`typescript`);
      lines.push(`type ${t.name} = ${t.value};`);
      lines.push(`\`\`\``);
      if (t.jsdoc) lines.push(t.jsdoc);
      lines.push('');
    }

    for (const iface of doc.interfaces) {
      lines.push(`\`\`\`typescript`);
      lines.push(`interface ${iface.name} {${iface.body}`);
      lines.push(`\`\`\``);
      if (iface.jsdoc) lines.push(iface.jsdoc);
      lines.push('');
    }
  }

  return lines.join('\n');
}

function renderFullCssOnly(doc) {
  const lines = [];
  lines.push('## coar-link');
  lines.push('');
  lines.push('**Kind:** CSS-only component (no Angular class)');
  lines.push('**Import:** `@import \'@cocoar/ui/components/display/link/coar-link.css\';`');
  lines.push('');

  const item = doc.items[0];
  if (item) {
    if (item.cssClasses.length > 0) {
      lines.push('### CSS Classes');
      lines.push('');
      for (const cls of item.cssClasses) {
        lines.push(`- \`.${cls}\``);
      }
      lines.push('');
    }

    if (item.customProperties.length > 0) {
      lines.push('### CSS Custom Properties');
      lines.push('');
      lines.push('| Property | Default |');
      lines.push('|----------|---------|');
      for (const prop of item.customProperties) {
        lines.push(`| \`${prop.name}\` | ${prop.fallback || '—'} |`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function renderFullUtilityGroup(doc) {
  const lines = [];
  lines.push(`## ${doc.name}`);
  lines.push('');
  lines.push('**Kind:** Utility exports (types + helper functions)');
  lines.push('**Import:** `import { ... } from \'@cocoar/ui\';`');
  lines.push('');

  if (doc.types.length > 0) {
    lines.push('### Types');
    lines.push('');
    for (const t of doc.types) {
      lines.push(`\`\`\`typescript`);
      lines.push(`type ${t.name} = ${t.value};`);
      lines.push(`\`\`\``);
      if (t.jsdoc) lines.push(t.jsdoc);
      lines.push('');
    }
  }

  if (doc.interfaces.length > 0) {
    lines.push('### Interfaces');
    lines.push('');
    for (const iface of doc.interfaces) {
      lines.push(`\`\`\`typescript`);
      lines.push(`interface ${iface.name} {${iface.body}`);
      lines.push(`\`\`\``);
      if (iface.jsdoc) lines.push(iface.jsdoc);
      lines.push('');
    }
  }

  if (doc.utilities.length > 0) {
    lines.push('### Functions');
    lines.push('');
    for (const fn of doc.utilities) {
      lines.push(`#### \`${fn.name}(${fn.params}): ${fn.returnType}\``);
      if (fn.jsdoc) lines.push(fn.jsdoc);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ─── Helpers ─────────────────────────────────────────────────────────

function groupByCategory(docs) {
  const ordered = ['Display', 'Forms', 'Navigation', 'Overlay', 'Date & Time', 'Menu'];
  const map = new Map();
  for (const cat of ordered) map.set(cat, []);

  for (const doc of docs) {
    const list = map.get(doc.category);
    if (list) list.push(doc);
  }

  // Remove empty categories
  for (const [cat, entries] of map) {
    if (entries.length === 0) map.delete(cat);
  }

  return map;
}

function humanize(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Determine if a CSS custom property is component-specific (worth documenting)
 * vs. a global design token being consumed.
 */
function isComponentSpecificProp(propName, selector) {
  // Component-specific props typically include the component name
  if (selector) {
    const selectorName = selector.replace(/[\[\]]/g, '').replace('coar-', '');
    if (propName.includes(selectorName)) return true;
  }

  // Also include any prop with a fallback (customization point)
  return false;
}
