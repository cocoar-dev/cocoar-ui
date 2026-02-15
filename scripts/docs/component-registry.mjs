/**
 * Component registry — discovers public API items from barrel exports.
 *
 * Scans each category's index.ts to find re-exported directories,
 * then collects all relevant source files (.component.ts, .directive.ts,
 * .service.ts, .types.ts, .html, .css) from those directories.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

const ROOT = process.cwd();

/** Barrel index files grouped by category. */
const CATEGORY_BARRELS = [
  { category: 'Display', barrel: 'libs/ui/components/src/lib/display/index.ts' },
  { category: 'Forms', barrel: 'libs/ui/components/src/lib/forms/index.ts' },
  { category: 'Navigation', barrel: 'libs/ui/components/src/lib/navigation/index.ts' },
  { category: 'Overlay', barrel: 'libs/ui/components/src/lib/overlay/index.ts' },
  { category: 'Date & Time', barrel: 'libs/ui/components/src/lib/date-time/index.ts' },
  { category: 'Menu', barrel: 'libs/ui/menu/src/lib/index.ts' },
];

/**
 * File extensions we care about for documentation extraction.
 * Order matters — .component.ts is checked before .ts so we can
 * distinguish component files from plain type files.
 */
const DOC_EXTENSIONS = [
  '.component.ts',
  '.directive.ts',
  '.service.ts',
  '.types.ts',
  '.interface.ts',
  '.component.html',
  '.component.css',
  '.css',
];

/**
 * Discover all public API items from barrel exports.
 *
 * @returns {{ category: string, name: string, dir: string, files: { path: string, kind: string }[] }[] }
 */
export function discoverComponents() {
  const results = [];

  for (const { category, barrel } of CATEGORY_BARRELS) {
    const barrelPath = join(ROOT, barrel);
    if (!existsSync(barrelPath)) continue;

    const barrelContent = readFileSync(barrelPath, 'utf-8');
    const barrelDir = dirname(barrelPath);

    // Menu barrel exports files directly (not sub-directories)
    if (category === 'Menu') {
      const entry = collectMenuFiles(barrelContent, barrelDir);
      if (entry) results.push({ ...entry, category });
      continue;
    }

    // Parse `export * from './button';` lines → directory names
    const exportRe = /export\s+\*\s+from\s+['"]\.\/([\w-]+)['"]/g;
    let match;
    while ((match = exportRe.exec(barrelContent)) !== null) {
      const dirName = match[1];
      // Skip internal/shared directories
      if (dirName.startsWith('_')) continue;

      const dirPath = join(barrelDir, dirName);
      if (!existsSync(dirPath)) continue;

      const entry = collectDirectoryFiles(dirName, dirPath);
      if (entry) results.push({ ...entry, category });
    }

    // Also parse `export type { ... } from './...'` and `export { ... } from './...'`
    // for shared utilities exported from _shared directories
    const namedExportRe = /export\s+(?:type\s+)?\{[^}]+\}\s+from\s+['"]\.\/([\w-]+\/[\w-]+)['"]/g;
    while ((match = namedExportRe.exec(barrelContent)) !== null) {
      const relPath = match[1];
      const filePath = join(barrelDir, relPath + '.ts');
      if (!existsSync(filePath)) continue;

      const name = basename(relPath);
      // Check if we already have an entry for this directory's parent
      const existing = results.find(
        (r) => r.category === category && r.name === dirname(relPath).replace(/^_/, '')
      );
      if (existing) {
        existing.files.push({ path: filePath, kind: classifyFile(filePath) });
      } else {
        results.push({
          category,
          name,
          dir: dirname(filePath),
          files: [{ path: filePath, kind: classifyFile(filePath) }],
        });
      }
    }

    // Handle the "export * from './_shared/...'" pattern (date-time _shared)
    const sharedExportRe = /export\s+\*\s+from\s+['"]\.\/_shared\/([\w-]+)['"]/g;
    const sharedFiles = [];
    while ((match = sharedExportRe.exec(barrelContent)) !== null) {
      const fileName = match[1];
      const filePath = join(barrelDir, '_shared', fileName + '.ts');
      if (existsSync(filePath)) {
        sharedFiles.push({ path: filePath, kind: 'utility' });
      }
    }
    if (sharedFiles.length > 0) {
      results.push({
        category,
        name: 'date-utilities',
        dir: join(barrelDir, '_shared'),
        files: sharedFiles,
        isUtilityGroup: true,
      });
    }
  }

  // Handle CSS-only components (link)
  const linkCss = join(ROOT, 'libs/ui/components/src/lib/display/link/coar-link.css');
  if (existsSync(linkCss)) {
    results.push({
      category: 'Display',
      name: 'link',
      dir: dirname(linkCss),
      files: [{ path: linkCss, kind: 'css' }],
      isCssOnly: true,
    });
  }

  return results;
}

/**
 * Collect all relevant files from a component directory.
 */
function collectDirectoryFiles(name, dirPath) {
  let allFiles;
  try {
    allFiles = readdirSync(dirPath);
  } catch {
    return null;
  }

  const docFiles = allFiles
    .filter((f) => DOC_EXTENSIONS.some((ext) => f.endsWith(ext)))
    .filter((f) => !f.endsWith('.spec.ts') && !f.endsWith('.scenario.ts') && !f.endsWith('.docs.md'))
    .map((f) => ({
      path: join(dirPath, f),
      kind: classifyFile(f),
    }));

  if (docFiles.length === 0) return null;

  return { name, dir: dirPath, files: docFiles };
}

/**
 * Menu barrel exports individual files, not sub-directories.
 * Group all menu files into a single entry.
 */
function collectMenuFiles(barrelContent, barrelDir) {
  const menuFiles = [];
  const exportRe = /export\s+\*\s+from\s+['"]\.\/([\w.-]+)['"]/g;
  let match;

  while ((match = exportRe.exec(barrelContent)) !== null) {
    const moduleName = match[1];
    const filePath = join(barrelDir, moduleName + '.ts');
    if (existsSync(filePath)) {
      menuFiles.push({ path: filePath, kind: classifyFile(filePath) });

      // Check for associated HTML/CSS
      const htmlPath = filePath.replace(/\.ts$/, '.html');
      const cssPath = filePath.replace(/\.ts$/, '.css');
      if (existsSync(htmlPath)) menuFiles.push({ path: htmlPath, kind: 'template' });
      if (existsSync(cssPath)) menuFiles.push({ path: cssPath, kind: 'css' });
    }
  }

  if (menuFiles.length === 0) return null;

  return { name: 'menu', dir: barrelDir, files: menuFiles };
}

/**
 * Classify a file by its extension/name.
 */
function classifyFile(filePath) {
  const f = basename(filePath);
  if (f.endsWith('.component.ts')) return 'component';
  if (f.endsWith('.directive.ts')) return 'directive';
  if (f.endsWith('.service.ts')) return 'service';
  if (f.endsWith('.types.ts') || f.endsWith('.interface.ts')) return 'types';
  if (f.endsWith('.component.html')) return 'template';
  if (f.endsWith('.component.css')) return 'css';
  if (f.endsWith('.css')) return 'css';
  if (f.endsWith('.ts')) return 'typescript';
  return 'unknown';
}
