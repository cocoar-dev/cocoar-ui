#!/usr/bin/env node
/**
 * Copy overview documentation from source files to docs/libs/
 *
 * Finds all *.component.md, *.directive.md, *.service.md files in libs/
 * and copies them to the corresponding docs/libs/{package}/{ClassName}/overview.md
 *
 * This keeps documentation co-located with source code while making it available
 * to the showcase app and @cocoar/ui-docs package.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = join(__dirname, '../..');

console.log('📄 Copying overview documentation from source...\n');

let copiedCount = 0;

// Recursively find all markdown files in libs/
function findMarkdownFiles(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and dist folders
      if (entry.name === 'node_modules' || entry.name === 'dist') {
        continue;
      }
      findMarkdownFiles(fullPath, files);
    } else if (
      entry.isFile() &&
      entry.name.match(/\.(component|directive|service|pipe|overview)\.md$/)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

const libsDir = join(workspaceRoot, 'libs');
const markdownFiles = findMarkdownFiles(libsDir);

for (const fullPath of markdownFiles) {
  // Get relative path from workspace root
  const relativePath = fullPath.replace(workspaceRoot + '\\', '').replace(workspaceRoot + '/', '');

  // Extract package name from path: libs/{package}/src/...
  const pathParts = relativePath.split(/[/\\]/);
  if (pathParts[0] !== 'libs' || !pathParts[1]) {
    continue;
  }
  const packageName = pathParts[1]; // e.g., 'ui-components'

  // Extract output name from filename.
  // - coar-button.component.md → CoarButtonComponent
  // - provide-coar-i18n-using-transloco.overview.md → provideCoarI18nUsingTransloco
  const className = fullPath.endsWith('.overview.md')
    ? kebabToCamel(basename(fullPath, '.overview.md'))
    : convertToClassName(basename(fullPath, '.md'));

  // Determine output path: docs/libs/{package}/{ClassName}/overview.md
  const outputDir = join(workspaceRoot, 'docs/libs', packageName, className);
  const outputPath = join(outputDir, 'overview.md');

  // Create directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Copy file
  const content = readFileSync(fullPath, 'utf8');
  writeFileSync(outputPath, content);

  console.log(`  ✓ ${packageName}/${className}/overview.md`);
  copiedCount++;
}

console.log(`\n✅ Copied ${copiedCount} overview files\n`);

/**
 * Convert filename to PascalCase class name
 * Examples:
 *   coar-button.component → CoarButtonComponent
 *   coar-tooltip.directive → CoarTooltipDirective
 *   coar-icon.service → CoarIconService
 */
function convertToClassName(filename) {
  return filename
    .split('.')
    .map((part) =>
      part
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
    )
    .join('');
}

function kebabToCamel(input) {
  const parts = input.split('-').filter(Boolean);
  if (parts.length === 0) {
    return input;
  }

  const [first, ...rest] = parts;
  return first + rest.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}
