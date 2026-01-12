#!/usr/bin/env node

import { cpSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const distPath = 'dist/libs/ui-docs';

// Copy docs/libs → dist/libs/ui-docs/docs/libs
const docsSource = 'docs/libs';
const docsDest = join(distPath, 'docs', 'libs');
if (existsSync(docsSource)) {
  // Avoid stale docs: cpSync merges folders but does not remove deleted files.
  rmSync(docsDest, { recursive: true, force: true });
  cpSync(docsSource, docsDest, { recursive: true });
  console.log(`✓ Copied ${docsSource} → ${docsDest}`);
} else {
  console.warn(`⚠ ${docsSource} does not exist, skipping`);
}

// Copy libs/ui-docs/api → dist/libs/ui-docs/api
const apiSource = 'libs/ui-docs/api';
const apiDest = join(distPath, 'api');
if (existsSync(apiSource)) {
  rmSync(apiDest, { recursive: true, force: true });
  cpSync(apiSource, apiDest, { recursive: true });
  console.log(`✓ Copied ${apiSource} → ${apiDest}`);
} else {
  console.warn(`⚠ ${apiSource} does not exist, skipping`);
}

// Copy docs/consuming → dist/libs/ui-docs/docs/consuming (setup guides)
const consumingSource = 'docs/consuming';
const consumingDest = join(distPath, 'docs', 'consuming');
if (existsSync(consumingSource)) {
  rmSync(consumingDest, { recursive: true, force: true });
  cpSync(consumingSource, consumingDest, { recursive: true });
  console.log(`✓ Copied ${consumingSource} → ${consumingDest}`);
} else {
  console.warn(`⚠ ${consumingSource} does not exist, skipping`);
}

console.log('✅ Documentation copied to dist');
