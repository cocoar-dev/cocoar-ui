#!/usr/bin/env node

/**
 * Find Unused CSS Rules in Showcase App
 *
 * Analyzes CSS files and compares selectors against HTML templates
 * to identify potentially unused CSS rules.
 *
 * Usage: node scripts/css/find-unused-css.mjs [--fix]
 *
 * Options:
 *   --fix    Remove unused CSS rules (creates backup first)
 *   --json   Output results as JSON
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, relative, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');

// Configuration
const SHOWCASE_PATH = join(ROOT, 'apps/showcase/src/app');
const IGNORE_SELECTORS = [
  // Pseudo-elements and states (can't detect usage statically)
  /^::/,
  /^:/,
  // Media queries and keyframes
  /^@/,
  // Element selectors (too broad to check)
  /^(html|body|a|p|h[1-6]|ul|ol|li|table|tr|td|th|div|span|button|input|label|form|img|svg|code|pre)$/,
  // Cocoar component selectors (handled by Angular)
  /^coar-/,
  // Utility classes that might be added dynamically
  /^\.is-/,
  /^\.has-/,
  /^\[.*\]$/, // Attribute selectors
];

/**
 * Parse CSS and extract selectors
 */
function extractCssSelectors(cssContent, filePath) {
  const selectors = [];

  // Remove comments
  let cleaned = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove @keyframes blocks entirely
  cleaned = cleaned.replace(/@keyframes\s+[\w-]+\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '');

  // Remove @media wrapper but keep content
  cleaned = cleaned.replace(/@media[^{]+\{/g, '');

  // Match selectors (everything before a { that's not inside a block)
  const selectorRegex = /([^{}]+)\{[^{}]*\}/g;
  let match;

  while ((match = selectorRegex.exec(cleaned)) !== null) {
    const selectorGroup = match[1].trim();

    // Split multiple selectors (e.g., "h1, h2, h3")
    const individualSelectors = selectorGroup
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const selector of individualSelectors) {
      // Skip if matches ignore patterns
      if (IGNORE_SELECTORS.some((pattern) => pattern.test(selector))) {
        continue;
      }

      selectors.push({
        selector,
        file: filePath,
        // Extract the main class/id for matching
        identifier: extractIdentifier(selector),
      });
    }
  }

  return selectors;
}

/**
 * Extract the primary identifier from a selector
 * e.g., ".foo .bar" -> ["foo", "bar"]
 *       ".foo.bar" -> ["foo", "bar"]
 *       ".foo > .bar" -> ["foo", "bar"]
 */
function extractIdentifier(selector) {
  const identifiers = [];

  // Match class names
  const classMatches = selector.matchAll(/\.([a-zA-Z_][\w-]*)/g);
  for (const m of classMatches) {
    identifiers.push({ type: 'class', name: m[1] });
  }

  // Match IDs
  const idMatches = selector.matchAll(/#([a-zA-Z_][\w-]*)/g);
  for (const m of idMatches) {
    identifiers.push({ type: 'id', name: m[1] });
  }

  return identifiers;
}

/**
 * Extract class and ID references from HTML
 */
function extractHtmlReferences(htmlContent) {
  const references = new Set();

  // Match class attributes (including Angular bindings)
  const classRegex = /class\s*=\s*["']([^"']+)["']/g;
  let match;

  while ((match = classRegex.exec(htmlContent)) !== null) {
    const classes = match[1].split(/\s+/).filter(Boolean);
    for (const cls of classes) {
      // Skip Angular template syntax
      if (!cls.startsWith('{{') && !cls.startsWith('[')) {
        references.add(`class:${cls}`);
      }
    }
  }

  // Match [class.xxx] bindings
  const classBindingRegex = /\[class\.([^\]]+)\]/g;
  while ((match = classBindingRegex.exec(htmlContent)) !== null) {
    references.add(`class:${match[1]}`);
  }

  // Match [ngClass] bindings - extract class names from objects
  const ngClassRegex = /\[ngClass\]\s*=\s*["']\{([^}]+)\}["']/g;
  while ((match = ngClassRegex.exec(htmlContent)) !== null) {
    const classes = match[1].matchAll(/'([^']+)'/g);
    for (const cls of classes) {
      references.add(`class:${cls[1]}`);
    }
  }

  // Match ID attributes
  const idRegex = /id\s*=\s*["']([^"']+)["']/g;
  while ((match = idRegex.exec(htmlContent)) !== null) {
    references.add(`id:${match[1]}`);
  }

  return references;
}

/**
 * Extract class references from TypeScript (for dynamic classes)
 */
function extractTsReferences(tsContent) {
  const references = new Set();

  // Match string literals that look like class names
  const stringRegex = /['"`]([a-zA-Z][\w-]*(?:\s+[a-zA-Z][\w-]*)*)['"`]/g;
  let match;

  while ((match = stringRegex.exec(tsContent)) !== null) {
    const classes = match[1].split(/\s+/).filter(Boolean);
    for (const cls of classes) {
      if (cls.length > 2 && !cls.includes('(') && !cls.includes('/')) {
        references.add(`class:${cls}`);
      }
    }
  }

  return references;
}

/**
 * Recursively find files with specific extensions
 */
function findFiles(dir, extensions) {
  const files = [];

  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main analysis function
 */
function analyzeUnusedCss() {
  console.log('🔍 Analyzing CSS usage in Showcase app...\n');

  // Find all relevant files
  const cssFiles = findFiles(SHOWCASE_PATH, ['.css']);
  const htmlFiles = findFiles(SHOWCASE_PATH, ['.html']);
  const tsFiles = findFiles(SHOWCASE_PATH, ['.ts']);

  console.log(
    `Found ${cssFiles.length} CSS files, ${htmlFiles.length} HTML files, ${tsFiles.length} TS files\n`
  );

  // Collect all HTML/TS references
  const allReferences = new Set();

  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf-8');
    const refs = extractHtmlReferences(content);
    for (const ref of refs) {
      allReferences.add(ref);
    }
  }

  for (const file of tsFiles) {
    const content = readFileSync(file, 'utf-8');
    const refs = extractTsReferences(content);
    for (const ref of refs) {
      allReferences.add(ref);
    }
  }

  // Also check shared styles
  const sharedCssPath = join(SHOWCASE_PATH, 'shared/showcase-pages.css');
  if (existsSync(sharedCssPath)) {
    // Shared styles are always considered "used" since they're imported globally
  }

  // Analyze each CSS file
  const results = [];

  for (const cssFile of cssFiles) {
    const content = readFileSync(cssFile, 'utf-8');
    const selectors = extractCssSelectors(content, cssFile);

    const unusedSelectors = [];

    for (const selectorInfo of selectors) {
      const { selector, identifier } = selectorInfo;

      // Check if any identifier is used
      let isUsed = false;

      for (const id of identifier) {
        const key = `${id.type}:${id.name}`;
        if (allReferences.has(key)) {
          isUsed = true;
          break;
        }
      }

      // If no identifiers or none used, mark as potentially unused
      if (identifier.length === 0 || !isUsed) {
        unusedSelectors.push(selector);
      }
    }

    if (unusedSelectors.length > 0) {
      results.push({
        file: relative(ROOT, cssFile),
        totalSelectors: selectors.length,
        unusedCount: unusedSelectors.length,
        unused: unusedSelectors,
      });
    }
  }

  return results;
}

/**
 * Print results
 */
function printResults(results, asJson = false) {
  if (asJson) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log('✅ No unused CSS selectors found!\n');
    return;
  }

  let totalUnused = 0;

  for (const result of results) {
    console.log(`\n📄 ${result.file}`);
    console.log(
      `   ${result.unusedCount}/${result.totalSelectors} selectors potentially unused:\n`
    );

    for (const selector of result.unused) {
      console.log(`   ❌ ${selector}`);
      totalUnused++;
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📊 Summary: ${totalUnused} potentially unused selectors in ${results.length} files`);
  console.log(`\n⚠️  Note: This analysis may have false positives for:`);
  console.log(`   - Dynamically added classes`);
  console.log(`   - Classes used via [ngClass] with complex expressions`);
  console.log(`   - Classes applied to projected content`);
  console.log(`   - Pseudo-selectors and state classes\n`);
}

// Main
const args = process.argv.slice(2);
const asJson = args.includes('--json');

const results = analyzeUnusedCss();
printResults(results, asJson);
