#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(process.cwd());

function parseArgs(argv) {
  const outIdx = argv.findIndex((a) => a === '--out');
  if (outIdx === -1) {
    return { outDir: path.join(PROJECT_ROOT, 'tmp', 'scenar-backstage-export') };
  }
  const value = argv[outIdx + 1];
  if (!value || value.startsWith('--')) {
    throw new Error('Missing value for --out');
  }
  return { outDir: path.resolve(PROJECT_ROOT, value) };
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
      continue;
    }

    if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function copyFileIfExists(src, dest) {
  if (!(await pathExists(src))) return;
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function main() {
  const { outDir } = parseArgs(process.argv.slice(2));

  if (await pathExists(outDir)) {
    // Intentionally avoid destructive deletes; users can remove the folder if they want a clean export.
    process.stderr.write(
      `Export target already exists: ${outDir}\n` +
        `Refusing to overwrite. Remove it or choose another path via --out.\n`
    );
    process.exit(1);
  }

  const exportRoot = outDir;

  // Minimal, copy-ready set to bootstrap a new Scenar Backstage repo.
  // This is intentionally coarse-grained: copy whole folders to preserve relative paths.
  await copyDir(
    path.join(PROJECT_ROOT, 'apps', 'component-test-host'),
    path.join(exportRoot, 'apps', 'component-test-host')
  );
  await copyDir(
    path.join(PROJECT_ROOT, 'scripts', 'component-test-host'),
    path.join(exportRoot, 'scripts', 'component-test-host')
  );
  await copyDir(
    path.join(PROJECT_ROOT, 'scripts', 'scenar-backstage'),
    path.join(exportRoot, 'scripts', 'scenar-backstage')
  );

  await copyFileIfExists(
    path.join(PROJECT_ROOT, 'scenar-backstage.config.json'),
    path.join(exportRoot, 'scenar-backstage.config.json')
  );

  // Docs that describe the authoring and extraction model.
  await copyFileIfExists(
    path.join(PROJECT_ROOT, 'docs', 'component-test-host.md'),
    path.join(exportRoot, 'docs', 'component-test-host.md')
  );
  await copyFileIfExists(
    path.join(PROJECT_ROOT, 'docs', 'component-test-host-scenario-authoring.md'),
    path.join(exportRoot, 'docs', 'component-test-host-scenario-authoring.md')
  );
  await copyFileIfExists(
    path.join(PROJECT_ROOT, 'docs', 'component-test-host-extraction.md'),
    path.join(exportRoot, 'docs', 'component-test-host-extraction.md')
  );

  process.stdout.write(
    `Exported Scenar Backstage sources to ${exportRoot}\n` +
      `Next: copy this folder into a new repo and wire Nx/Angular tooling as desired.\n`
  );
}

await main();
