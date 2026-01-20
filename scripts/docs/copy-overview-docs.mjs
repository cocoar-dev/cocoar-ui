#!/usr/bin/env node
/**
 * Copy documentation from source files to docs/libs/
 *
 * Finds all *.docs.md files in libs/ and copies them to
 * docs/libs/{package}/ keeping the original filename.
 *
 * This keeps documentation co-located with source code while making it available
 * to the showcase app and @cocoar/ui-docs package.
 *
 * Naming convention:
 * - Source: libs/ui-components/src/lib/coar-button/coar-button.docs.md
 * - Output: docs/libs/ui-components/coar-button.docs.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = join(__dirname, '../..');

console.log('📄 Copying documentation from source...\n');

let copiedCount = 0;

// Recursively find all *.docs.md files in libs/
function findDocsFiles(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and dist folders
      if (entry.name === 'node_modules' || entry.name === 'dist') {
        continue;
      }
      findDocsFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.docs.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

const libsDir = join(workspaceRoot, 'libs');
const docsFiles = findDocsFiles(libsDir);

for (const fullPath of docsFiles) {
  // Get relative path from workspace root
  const relativePath = fullPath.replace(workspaceRoot + '\\', '').replace(workspaceRoot + '/', '');

  // Extract package name from path: libs/{package}/src/...
  const pathParts = relativePath.split(/[/\\]/);
  if (pathParts[0] !== 'libs' || !pathParts[1]) {
    continue;
  }
  const packageName = pathParts[1]; // e.g., 'ui-components'
  const fileName = basename(fullPath); // e.g., 'coar-button.docs.md'

  // Determine output path: docs/libs/{package}/{filename}
  const outputDir = join(workspaceRoot, 'docs/libs', packageName);
  const outputPath = join(outputDir, fileName);

  // Create directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Copy file
  const content = readFileSync(fullPath, 'utf8');
  writeFileSync(outputPath, content);

  console.log(`  ✓ ${packageName}/${fileName}`);
  copiedCount++;
}

console.log(`\n✅ Copied ${copiedCount} docs files\n`);
