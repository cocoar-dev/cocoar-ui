import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const sourceDocsDir = path.resolve(workspaceRoot, '../docs');
const sourceOverlayDocsFile = path.resolve(workspaceRoot, 'libs/ui-overlay/OVERLAY.md');
const showcasePublicDocsDir = path.resolve(workspaceRoot, 'apps/showcase/public/docs');
const showcasePublicOverlayDocsFile = path.resolve(
  showcasePublicDocsDir,
  'libs/ui-overlay/OVERLAY.md'
);

async function main() {
  // Keep showcase docs as a generated mirror of the repo-level /docs folder.
  // This lets the showcase load markdown over HTTP while the source of truth
  // remains easily browseable in GitHub.
  await rm(showcasePublicDocsDir, { recursive: true, force: true });
  await cp(sourceDocsDir, showcasePublicDocsDir, {
    recursive: true,
    filter: (src) => {
      // Avoid copying hidden/system files.
      const baseName = path.basename(src);
      if (baseName.startsWith('.')) return false;
      return true;
    },
  });

  // Expose library docs (kept next to the library source) under /docs/libs/* so
  // the showcase can fetch them over HTTP.
  await mkdir(path.dirname(showcasePublicOverlayDocsFile), { recursive: true });
  await cp(sourceOverlayDocsFile, showcasePublicOverlayDocsFile);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[sync-showcase-docs] Failed to sync docs:', error);
  process.exitCode = 1;
});
