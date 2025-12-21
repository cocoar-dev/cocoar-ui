import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { loadCtHostConfig } from './ct-host-config.mjs';

const PROJECT_ROOT = path.resolve(process.cwd());

const config = await loadCtHostConfig(PROJECT_ROOT);

const IGNORED_DIR_NAMES = new Set(config.ignoredDirNames);

const ALLOWED_IMPORTERS = new Set(config.allowedImporterRelPaths);

function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkTsFiles(dirPath, results) {
  if (!(await pathExists(dirPath))) return;

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIR_NAMES.has(entry.name)) continue;
      await walkTsFiles(fullPath, results);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.ts')) continue;

    results.push(fullPath);
  }
}

function findCtStoryImports(text) {
  // We only want to catch runtime imports, not comments.
  // Keep the heuristic simple: scan for import statements that reference ".ct-story".
  const lines = text.split(/\r?\n/);
  const hits = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('ct-story')) continue;

    // Static imports: import ... from '...ct-story...'
    // Also catch `import('...ct-story...')`.
    const isStatic = /\bfrom\s+['"][^'"]*\.ct-story(?:\.ts)?['"]/u.test(line);
    const isDynamic = /\bimport\(\s*['"][^'"]*\.ct-story(?:\.ts)?['"]\s*\)/u.test(line);

    if (isStatic || isDynamic) {
      hits.push({ line: i + 1, text: line.trim() });
    }
  }

  return hits;
}

async function main() {
  const candidates = [];
  await walkTsFiles(path.join(PROJECT_ROOT, 'apps'), candidates);
  await walkTsFiles(path.join(PROJECT_ROOT, 'libs'), candidates);

  const violations = [];

  for (const filePath of candidates) {
    const rel = toPosixPath(path.relative(PROJECT_ROOT, filePath));
    if (ALLOWED_IMPORTERS.has(rel)) continue;

    const text = await fs.readFile(filePath, 'utf8');
    const hits = findCtStoryImports(text);
    if (hits.length === 0) continue;

    for (const hit of hits) {
      violations.push({ file: rel, line: hit.line, text: hit.text });
    }
  }

  if (violations.length > 0) {
    process.stderr.write(
      'Found forbidden runtime imports of *.ct-story files.\n' +
        'Rule: Only the generated registry may import story metadata modules.\n\n'
    );

    for (const v of violations) {
      process.stderr.write(`${v.file}:${v.line}  ${v.text}\n`);
    }

    process.stderr.write('\nFix: remove the import, or move the logic into the generator.\n');

    process.exitCode = 1;
    return;
  }

  process.stdout.write('OK: no forbidden *.ct-story imports found.\n');
}

await main();
