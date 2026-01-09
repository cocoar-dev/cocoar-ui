#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MARKER_START = '<!-- @cocoar/ui-docs:start -->';
const MARKER_END = '<!-- @cocoar/ui-docs:end -->';

/**
 * Adds or updates the Cocoar documentation section in AGENTS.md.
 */
export function setupAgents(options = {}) {
  const { force = false, cwd = process.cwd() } = options;

  const agentsPath = join(cwd, 'AGENTS.md');
  const templatePath = join(__dirname, 'templates', 'AGENTS.md');
  const template = readFileSync(templatePath, 'utf-8');

  // Case 1: AGENTS.md doesn't exist - create it
  if (!existsSync(agentsPath)) {
    const initialContent = `# AI Assistant Guidelines\n\n${template}\n`;
    writeFileSync(agentsPath, initialContent, 'utf-8');
    console.log('✓ Created AGENTS.md with Cocoar documentation section');
    return { created: true, updated: false, path: agentsPath };
  }

  // Case 2: AGENTS.md exists - check for markers
  const existingContent = readFileSync(agentsPath, 'utf-8');

  if (existingContent.includes(MARKER_START)) {
    // Section exists - update it
    if (!force) {
      console.log('✓ AGENTS.md already contains Cocoar documentation section');
      console.log('  Run with --force to update.');
      return { created: false, updated: false, path: agentsPath };
    }

    const startIndex = existingContent.indexOf(MARKER_START);
    const endIndex = existingContent.indexOf(MARKER_END) + MARKER_END.length;

    if (endIndex < MARKER_END.length) {
      console.error('✗ Found start marker but missing end marker in AGENTS.md');
      console.error('  Please fix the markers manually.');
      return { created: false, updated: false, error: 'missing-end-marker' };
    }

    const before = existingContent.substring(0, startIndex);
    const after = existingContent.substring(endIndex);
    const updatedContent = before + template + after;

    writeFileSync(agentsPath, updatedContent, 'utf-8');
    console.log('✓ Updated Cocoar documentation section in AGENTS.md');
    return { created: false, updated: true, path: agentsPath };
  } else {
    // Section doesn't exist - append it
    const updatedContent = existingContent.trim() + '\n\n' + template + '\n';
    writeFileSync(agentsPath, updatedContent, 'utf-8');
    console.log('✓ Added Cocoar documentation section to AGENTS.md');
    return { created: false, updated: true, path: agentsPath };
  }
}
