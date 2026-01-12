#!/usr/bin/env node
/**
 * Generate API documentation using Compodoc
 *
 * Runs Compodoc for each library and copies the generated JSON
 * to libs/ui-docs/api/ for inclusion in the documentation package.
 *
 * Usage: node scripts/docs/generate-compodoc.mjs
 */

import { execSync } from 'child_process';
import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '../..');
const API_OUTPUT_DIR = join(ROOT_DIR, 'libs/ui-docs/api');
const TMP_DIR = join(ROOT_DIR, 'tmp/compodoc');

// Libraries to generate docs for (Angular components/services)
const LIBRARIES = [
  'ui-components',
  'ui-menu',
  'ui-overlay',
  'markdown-viewer',
  'i18n',
  'i18n-transloco',
  'logging',
  'logging-abstractions',
];

console.log('📚 Generating API documentation with Compodoc...\n');

// Ensure output directory exists
if (!existsSync(API_OUTPUT_DIR)) {
  mkdirSync(API_OUTPUT_DIR, { recursive: true });
}

// Generate docs for each library
for (const lib of LIBRARIES) {
  const libPath = join(ROOT_DIR, 'libs', lib);
  const configFile = join(libPath, '.compodocrc.json');

  if (!existsSync(configFile)) {
    console.warn(`⚠️  Skipping ${lib} - no .compodocrc.json found`);
    continue;
  }

  console.log(`📖 Generating docs for @cocoar/${lib}...`);

  try {
    // Run Compodoc from the library directory (config paths are relative to lib)
    const result = execSync(
      `npx compodoc -p tsconfig.lib.json -d ${join('../../tmp/compodoc', lib)} --exportFormat json --silent`,
      {
        cwd: libPath,
        stdio: 'pipe',
        encoding: 'utf-8',
      }
    );

    // Copy the generated JSON to api folder
    const generatedJsonPath = join(TMP_DIR, lib, 'documentation.json');
    const targetJsonPath = join(API_OUTPUT_DIR, `${lib}.json`);

    if (existsSync(generatedJsonPath)) {
      copyFileSync(generatedJsonPath, targetJsonPath);
      console.log(`   ✓ Copied to libs/ui-docs/api/${lib}.json\n`);
    } else {
      console.warn(`   ⚠️  No documentation.json generated for ${lib}\n`);
      // Show last few lines of compodoc output for debugging
      const lines = result.split('\n').filter((l) => l.trim());
      if (lines.length > 0) {
        console.log(`   Last output: ${lines[lines.length - 1]}`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Failed to generate docs for ${lib}:`);
    console.error(`      ${error.message}`);
    if (error.stderr) {
      console.error(`      ${error.stderr.toString()}`);
    }
    // Don't exit - continue with other libraries
  }
}

// Create index.json for AI discovery
console.log('📋 Creating API index...');
const indexData = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  generator: 'Compodoc',
  packages: LIBRARIES.map((lib) => {
    const jsonPath = join(API_OUTPUT_DIR, `${lib}.json`);
    let componentCount = 0;

    if (existsSync(jsonPath)) {
      try {
        const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
        componentCount = (data.components || []).length;
      } catch (e) {
        console.warn(`   ⚠️  Could not parse ${lib}.json`);
      }
    }

    return {
      name: `@cocoar/${lib}`,
      apiFile: `./${lib}.json`,
      componentCount,
    };
  }),
};

const indexPath = join(API_OUTPUT_DIR, 'index.json');
writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
console.log('   ✓ Created libs/ui-docs/api/index.json\n');

console.log('✅ API documentation generation complete!\n');
console.log(`📁 Output: libs/ui-docs/api/`);
console.log(`   - index.json (package index for AI discovery)`);
LIBRARIES.forEach((lib) => {
  console.log(`   - ${lib}.json`);
});
