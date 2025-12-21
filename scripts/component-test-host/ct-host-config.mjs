import { promises as fs } from 'node:fs';
import path from 'node:path';

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

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return null;
  const parts = value.filter((v) => typeof v === 'string' && v.trim().length > 0);
  return parts.length > 0 ? parts : null;
}

/**
 * Loads configuration for CT-host scripts.
 *
 * This is intentionally lightweight: it supports both Nx workspaces and plain Angular CLI repos.
 */
export async function loadCtHostConfig(projectRoot) {
  const defaults = {
    tsconfigPath: 'tsconfig.base.json',
    outputFile: 'apps/component-test-host/src/app/ct/ct-registry.generated.ts',
    ctStoriesRoot: 'apps/component-test-host/src/app/ct/stories',
    searchRoots: ['apps/component-test-host/src/app/ct/stories', 'libs'],
    ignoredDirNames: [
      'node_modules',
      'dist',
      'tmp',
      '.nx',
      '.git',
      'playwright-report',
      'test-results',
    ],
  };

  const configPath = path.join(projectRoot, 'ct-host.config.json');
  if (!(await pathExists(configPath))) {
    return {
      ...defaults,
      projectRoot,
      configPath: null,
      outputFileAbs: path.join(projectRoot, defaults.outputFile),
      ctStoriesRootAbs: path.join(projectRoot, defaults.ctStoriesRoot),
      searchRootsAbs: defaults.searchRoots.map((p) => path.join(projectRoot, p)),
      tsconfigPathAbs: path.join(projectRoot, defaults.tsconfigPath),
      allowedImporterRelPaths: new Set([toPosixPath(defaults.outputFile)]),
    };
  }

  const parsed = JSON.parse(await fs.readFile(configPath, 'utf8'));
  const tsconfigPath =
    typeof parsed.tsconfigPath === 'string' && parsed.tsconfigPath.trim().length > 0
      ? parsed.tsconfigPath
      : defaults.tsconfigPath;

  const outputFile =
    typeof parsed.outputFile === 'string' && parsed.outputFile.trim().length > 0
      ? parsed.outputFile
      : defaults.outputFile;

  const ctStoriesRoot =
    typeof parsed.ctStoriesRoot === 'string' && parsed.ctStoriesRoot.trim().length > 0
      ? parsed.ctStoriesRoot
      : defaults.ctStoriesRoot;

  const searchRoots = normalizeStringArray(parsed.searchRoots) ?? defaults.searchRoots;
  const ignoredDirNames = normalizeStringArray(parsed.ignoredDirNames) ?? defaults.ignoredDirNames;

  return {
    tsconfigPath,
    outputFile,
    ctStoriesRoot,
    searchRoots,
    ignoredDirNames,
    projectRoot,
    configPath,
    outputFileAbs: path.join(projectRoot, outputFile),
    ctStoriesRootAbs: path.join(projectRoot, ctStoriesRoot),
    searchRootsAbs: searchRoots.map((p) => path.join(projectRoot, p)),
    tsconfigPathAbs: path.join(projectRoot, tsconfigPath),
    allowedImporterRelPaths: new Set([toPosixPath(outputFile)]),
  };
}
