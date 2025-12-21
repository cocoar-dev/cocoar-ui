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
 * Loads configuration for the component preview registry scripts.
 *
 * This is intentionally lightweight: it supports both Nx workspaces and plain Angular CLI repos.
 */
export async function loadCtHostConfig(projectRoot) {
  const defaults = {
    tsconfigPath: 'tsconfig.base.json',
    outputFile: 'apps/component-test-host/src/app/scenario/scenario-registry.generated.ts',
    scenarioRoot: 'apps/component-test-host/src/app/scenario/scenarios',
    searchRoots: ['apps/component-test-host/src/app/scenario/scenarios', 'libs'],
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

  const configPath = path.join(projectRoot, 'scenar-backstage.config.json');

  if (!(await pathExists(configPath))) {
    return {
      ...defaults,
      projectRoot,
      configPath: null,
      outputFileAbs: path.join(projectRoot, defaults.outputFile),
      scenarioRootAbs: path.join(projectRoot, defaults.scenarioRoot),
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

  const scenarioRoot =
    typeof parsed.scenarioRoot === 'string' && parsed.scenarioRoot.trim().length > 0
      ? parsed.scenarioRoot
      : defaults.scenarioRoot;

  const searchRoots = normalizeStringArray(parsed.searchRoots) ?? defaults.searchRoots;
  const ignoredDirNames = normalizeStringArray(parsed.ignoredDirNames) ?? defaults.ignoredDirNames;

  return {
    tsconfigPath,
    outputFile,
    scenarioRoot,
    searchRoots,
    ignoredDirNames,
    projectRoot,
    configPath,
    outputFileAbs: path.join(projectRoot, outputFile),
    scenarioRootAbs: path.join(projectRoot, scenarioRoot),
    searchRootsAbs: searchRoots.map((p) => path.join(projectRoot, p)),
    tsconfigPathAbs: path.join(projectRoot, tsconfigPath),
    allowedImporterRelPaths: new Set([toPosixPath(outputFile)]),
  };
}
