import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const E2E_ROOT = path.join(REPO_ROOT, 'apps', 'showcase-e2e', 'src');

/**
 * Minimal tag policy:
 * - Every e2e spec file must contain at least one @tag in a test/test.describe title.
 * - Files under accessibility/ must include @a11y.
 * - smoke.spec.ts must include @smoke.
 * - Tags must be lowercase kebab-case: /@[a-z0-9-]+/
 */

function isSpecFile(filePath) {
  return filePath.endsWith('.spec.ts');
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(fullPath)));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

function extractTitles(sourceText) {
  const titles = [];

  // test.describe('Title', ...)
  for (const match of sourceText.matchAll(/\btest\.describe\(\s*(['"])(.*?)\1/g)) {
    titles.push(match[2]);
  }

  // test('Title', ...)
  for (const match of sourceText.matchAll(/\btest\(\s*(['"])(.*?)\1/g)) {
    titles.push(match[2]);
  }

  return titles;
}

function extractTagsFromTitles(titles) {
  const tags = new Set();
  for (const title of titles) {
    for (const match of title.matchAll(/@([A-Za-z0-9-]+)/g)) {
      tags.add(match[1]);
    }
  }

  return Array.from(tags);
}

function normalizeSlashes(p) {
  return p.split(path.sep).join('/');
}

function validateFile(filePath, tags) {
  const errors = [];
  const rel = normalizeSlashes(path.relative(REPO_ROOT, filePath));

  if (tags.length === 0) {
    errors.push('missing @tag in any test/test.describe title');
    return { rel, errors };
  }

  const invalid = tags.filter((t) => t !== t.toLowerCase() || !/^[a-z0-9-]+$/.test(t));
  if (invalid.length > 0) {
    errors.push(`invalid tag(s): ${invalid.map((t) => `@${t}`).join(', ')} (use lowercase kebab-case)`);
  }

  if (rel.includes('/accessibility/') && !tags.includes('a11y')) {
    errors.push('accessibility spec must include @a11y');
  }

  if (rel.endsWith('/smoke.spec.ts') && !tags.includes('smoke')) {
    errors.push('smoke spec must include @smoke');
  }

  return { rel, errors };
}

async function main() {
  const files = (await walk(E2E_ROOT)).filter(isSpecFile);

  const failures = [];
  for (const filePath of files) {
    const text = await readFile(filePath, 'utf8');
    const titles = extractTitles(text);
    const tags = extractTagsFromTitles(titles);

    const result = validateFile(filePath, tags);
    if (result.errors.length > 0) {
      failures.push(result);
    }
  }

  if (failures.length === 0) {
    process.stdout.write(`OK: e2e tags look good (${files.length} spec files checked)\n`);
    return;
  }

  process.stderr.write('E2E tag check failed:\n\n');
  for (const failure of failures) {
    process.stderr.write(`- ${failure.rel}\n`);
    for (const err of failure.errors) {
      process.stderr.write(`  - ${err}\n`);
    }
  }

  process.exitCode = 1;
}

await main();
