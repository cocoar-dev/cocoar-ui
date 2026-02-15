#!/usr/bin/env node

/**
 * extract-component-api.mjs
 *
 * Main entry point for generating llms.txt and llms-full.txt from the
 * Cocoar UI component library source code.
 *
 * Outputs:
 *   libs/ui/llms.txt             → npm package (via ng-packagr assets)
 *   libs/ui/llms-full.txt        → npm package
 *   apps/showcase/public/llms.txt      → GitHub Pages
 *   apps/showcase/public/llms-full.txt → GitHub Pages
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { discoverComponents } from './component-registry.mjs';
import { parseEntry } from './parsers.mjs';
import { renderCompact, renderFull } from './renderers.mjs';

const ROOT = process.cwd();

// ── Discover & parse ─────────────────────────────────────────────────

const entries = discoverComponents();
console.log(`Discovered ${entries.length} component entries`);

const docs = entries.map((entry) => {
  const doc = parseEntry(entry);
  const itemCount = doc.items.length;
  const typeCount = doc.types.length;
  const ifaceCount = doc.interfaces.length;
  console.log(
    `  ${doc.category}/${doc.name}: ${itemCount} items, ${typeCount} types, ${ifaceCount} interfaces`
  );
  return doc;
});

// ── Render ────────────────────────────────────────────────────────────

const compactMd = renderCompact(docs);
const fullMd = renderFull(docs);

// ── Stats ────────────────────────────────────────────────────────────

const totalItems = docs.reduce((sum, d) => sum + d.items.length, 0);
const totalTypes = docs.reduce((sum, d) => sum + d.types.length, 0);
console.log(`\nTotal: ${totalItems} documented items, ${totalTypes} types`);
console.log(`llms.txt: ${(compactMd.length / 1024).toFixed(1)} KB`);
console.log(`llms-full.txt: ${(fullMd.length / 1024).toFixed(1)} KB`);

// ── Write output files ───────────────────────────────────────────────

const outputs = [
  join(ROOT, 'libs/ui/llms.txt'),
  join(ROOT, 'libs/ui/llms-full.txt'),
  join(ROOT, 'apps/showcase/public/llms.txt'),
  join(ROOT, 'apps/showcase/public/llms-full.txt'),
];

// Ensure directories exist
for (const outPath of outputs) {
  mkdirSync(join(outPath, '..'), { recursive: true });
}

writeFileSync(outputs[0], compactMd, 'utf-8');
writeFileSync(outputs[1], fullMd, 'utf-8');
writeFileSync(outputs[2], compactMd, 'utf-8');
writeFileSync(outputs[3], fullMd, 'utf-8');

console.log('\nWrote:');
for (const p of outputs) {
  console.log(`  ${p.replace(ROOT + '/', '')}`);
}
