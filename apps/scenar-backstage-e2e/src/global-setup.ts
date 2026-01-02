import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { workspaceRoot } from '@nx/devkit';

export default async function globalSetup(): Promise<void> {
  const generatorPath = path.join(workspaceRoot, 'scripts', 'scenar', 'generate-registry.mjs');
  const moduleUrl = pathToFileURL(generatorPath).href;
  const generatorModule = await import(moduleUrl);

  if (typeof generatorModule.generateRegistry !== 'function') {
    throw new Error('scripts/scenar/generate-registry.mjs does not export generateRegistry()');
  }

  await generatorModule.generateRegistry();
}
