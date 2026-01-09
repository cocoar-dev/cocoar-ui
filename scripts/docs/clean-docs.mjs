#!/usr/bin/env node
/**
 * Clean generated documentation folders
 *
 * Removes docs/libs/ before regeneration to ensure no stale files remain
 * from deleted or renamed components.
 */

import { rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = join(__dirname, '../..');

const docsLibsPath = join(workspaceRoot, 'docs/libs');

console.log('🧹 Cleaning generated documentation...\n');

if (existsSync(docsLibsPath)) {
  rmSync(docsLibsPath, { recursive: true, force: true });
  console.log('  ✓ Removed docs/libs/\n');
} else {
  console.log('  ✓ docs/libs/ already clean\n');
}
