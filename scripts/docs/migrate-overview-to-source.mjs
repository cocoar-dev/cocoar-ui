#!/usr/bin/env node
/**
 * ONE-TIME MIGRATION SCRIPT
 * 
 * Moves overview.md files from docs/libs/{package}/{ClassName}/overview.md
 * to source folders as {kebab-name}.component.md
 * 
 * Example:
 *   docs/libs/ui-components/CoarButtonComponent/overview.md
 *   → libs/ui-components/src/lib/coar-button/coar-button.component.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = join(__dirname, '../..');

console.log('📦 Migrating overview.md files to source folders...\n');

// Mapping of class names to source paths (we'll discover these)
const classNameToSourcePath = {
  // ui-components
  'CoarBadgeComponent': 'libs/ui-components/src/lib/coar-badge',
  'CoarButtonComponent': 'libs/ui-components/src/lib/coar-button',
  'CoarCardComponent': 'libs/ui-components/src/lib/coar-card',
  'CoarCheckboxComponent': 'libs/ui-components/src/lib/coar-checkbox',
  'CoarCodeBlockComponent': 'libs/ui-components/src/lib/coar-code-block',
  'CoarDatePickerComponent': 'libs/ui-components/src/lib/coar-date-picker',
  'CoarDividerComponent': 'libs/ui-components/src/lib/coar-divider',
  'CoarIconComponent': 'libs/ui-components/src/lib/coar-icon',
  'CoarLabelComponent': 'libs/ui-components/src/lib/coar-label',
  'CoarMultiSelectComponent': 'libs/ui-components/src/lib/coar-multi-select',
  'CoarNoteComponent': 'libs/ui-components/src/lib/coar-note',
  'CoarNumberInputComponent': 'libs/ui-components/src/lib/coar-number-input',
  'CoarPasswordInputComponent': 'libs/ui-components/src/lib/coar-password-input',
  'CoarPopoverComponent': 'libs/ui-components/src/lib/coar-popover',
  'CoarSingleSelectComponent': 'libs/ui-components/src/lib/coar-single-select',
  'CoarTabComponent': 'libs/ui-components/src/lib/coar-tabs',
  'CoarTabGroupComponent': 'libs/ui-components/src/lib/coar-tabs',
  'CoarTableComponent': 'libs/ui-components/src/lib/coar-table',
  'CoarTagComponent': 'libs/ui-components/src/lib/coar-tag',
  'CoarTagSelectComponent': 'libs/ui-components/src/lib/coar-tag-select',
  'CoarTextInputComponent': 'libs/ui-components/src/lib/coar-text-input',
  'CoarTooltipDirective': 'libs/ui-components/src/lib/coar-tooltip',
  
  // ui-menu
  'CoarMenuComponent': 'libs/ui-menu/src/lib/coar-menu',
  'CoarMenuDividerComponent': 'libs/ui-menu/src/lib/coar-menu-divider',
  'CoarMenuHeadingComponent': 'libs/ui-menu/src/lib/coar-menu-heading',
  'CoarMenuItemComponent': 'libs/ui-menu/src/lib/coar-menu-item',
  'CoarSubmenuItemComponent': 'libs/ui-menu/src/lib/coar-submenu-item',
  
  // markdown-viewer
  'CoarMarkdownComponent': 'libs/markdown-viewer/src/lib/coar-markdown',
};

function classNameToKebab(className) {
  // CoarButtonComponent → coar-button.component
  // CoarTooltipDirective → coar-tooltip.directive
  let name = className
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  
  // Extract type suffix
  if (name.endsWith('-component')) {
    return name.replace(/-component$/, '.component');
  } else if (name.endsWith('-directive')) {
    return name.replace(/-directive$/, '.directive');
  } else if (name.endsWith('-service')) {
    return name.replace(/-service$/, '.service');
  }
  return name;
}

// Find all overview.md files
function findOverviewFiles(dir, files = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findOverviewFiles(fullPath, files);
      } else if (entry.isFile() && entry.name === 'overview.md') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore errors (e.g., permission denied)
  }
  
  return files;
}

const docsLibsDir = join(workspaceRoot, 'docs/libs');
const overviewFiles = findOverviewFiles(docsLibsDir);

let migratedCount = 0;
let skippedCount = 0;

for (const overviewPath of overviewFiles) {
  // Extract className from path: docs/libs/{package}/{ClassName}/overview.md
  const relativePath = overviewPath.replace(docsLibsDir + '\\', '').replace(docsLibsDir + '/', '');
  const parts = relativePath.split(/[/\\]/);
  
  if (parts.length < 2) {
    continue;
  }
  
  const packageName = parts[0];
  const className = parts[1];
  
  const sourcePath = classNameToSourcePath[className];
  
  if (!sourcePath) {
    console.log(`  ⚠ No mapping for ${className} - skipping`);
    skippedCount++;
    continue;
  }
  
  const kebabName = classNameToKebab(className);
  const targetPath = join(workspaceRoot, sourcePath, `${kebabName}.md`);
  
  // Create target directory if needed
  const targetDir = dirname(targetPath);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy content
  const content = readFileSync(overviewPath, 'utf8');
  writeFileSync(targetPath, content);
  
  console.log(`  ✓ ${className} → ${sourcePath}/${kebabName}.md`);
  migratedCount++;
}

console.log(`\n✅ Migrated ${migratedCount} files`);
if (skippedCount > 0) {
  console.log(`⚠️  Skipped ${skippedCount} files (no mapping)`);
}
console.log('\n💡 Next steps:');
console.log('   1. Review the migrated files');
console.log('   2. Delete docs/libs/ folder');
console.log('   3. Run: pnpm docs:overview to regenerate docs/libs/');
