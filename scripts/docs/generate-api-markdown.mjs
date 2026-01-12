#!/usr/bin/env node
/**
 * Generate API markdown files from Compodoc JSON
 *
 * Reads all Compodoc JSON files from libs/ui-docs/api/ and generates
 * markdown API documentation in docs/libs/{package}/{ClassName}/api.md
 *
 * Structure mirrors the package layout:
 * - docs/libs/ui-components/CoarButtonComponent/api.md
 * - docs/libs/ui-menu/CoarMenuComponent/api.md
 * - docs/libs/logging/LoggerService/api.md
 *
 * Usage: node scripts/docs/generate-api-markdown.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '../..');
const API_DIR = join(ROOT_DIR, 'libs/ui-docs/api');
const DOCS_DIR = join(ROOT_DIR, 'docs/libs');

console.log('📝 Generating API markdown from Compodoc JSON...\n');

let totalGenerated = 0;

/**
 * Limit which non-Angular symbols produce API markdown.
 *
 * Rationale: Compodoc exposes lots of low-level constants/variables across packages
 * (e.g. injection token keys) that create noisy, low-value docs.
 * We only generate extra docs for packages/symbols that are consumer-relevant.
 */
const EXTRA_DOCS_CONFIG = {
  i18n: {
    includeInterfaces: true,
    includeFunctions: false,
    includeFunctionNames: null,
    includeFunctionTagName: null,
    includeVariableNames: new Set(['COAR_I18N_PROVIDER', 'COAR_I18N_EVENTS']),
    includeVariableTagName: null,
  },
  'i18n-transloco': {
    includeInterfaces: true,
    includeFunctions: true,
    // Only document the consumer-facing entry points.
    includeFunctionNames: new Set([
      'provideCoarI18nUsingTransloco',
      'provideCoarI18nUsingTranslocoWithCoarInterpolation',
    ]),
    // Future: allow opting-in a function via JSDoc without touching this script.
    // Example: add `/** @coarDocs */` above the function.
    includeFunctionTagName: 'coarDocs',
    includeVariableNames: new Set(),
    includeVariableTagName: null,
  },
};

function getExtraDocsConfig(packageName) {
  return (
    EXTRA_DOCS_CONFIG[packageName] ?? {
      includeInterfaces: false,
      includeFunctions: false,
      includeFunctionNames: null,
      includeFunctionTagName: null,
      includeVariableNames: new Set(),
      includeVariableTagName: null,
    }
  );
}

function hasJSDocTag(item, expectedTagName) {
  if (!expectedTagName) {
    return false;
  }

  const tags = item?.jsdoctags;
  if (!Array.isArray(tags) || tags.length === 0) {
    return false;
  }

  const wanted = String(expectedTagName).toLowerCase();

  // Compodoc tag shapes vary; handle both simple and TS AST-based ones.
  return tags.some((t) => {
    const raw = t?.tagName?.escapedText ?? t?.tagName ?? t?.name;
    if (!raw) {
      return false;
    }
    const normalized = String(raw).replace(/^@/, '').toLowerCase();
    return normalized === wanted;
  });
}

function shouldEmitFunction(extraDocsConfig, fn) {
  if (!extraDocsConfig.includeFunctions) {
    return false;
  }
  const allowlist = extraDocsConfig.includeFunctionNames;
  if (!allowlist) {
    return true;
  }

  if (fn?.name && allowlist.has(fn.name)) {
    return true;
  }

  return hasJSDocTag(fn, extraDocsConfig.includeFunctionTagName);
}

function shouldEmitVariable(extraDocsConfig, v) {
  const allowlist = extraDocsConfig.includeVariableNames;
  if (allowlist?.size && v?.name && allowlist.has(v.name)) {
    return true;
  }

  return hasJSDocTag(v, extraDocsConfig.includeVariableTagName);
}

// Read all JSON files from api directory
const jsonFiles = readdirSync(API_DIR).filter((f) => f.endsWith('.json') && f !== 'index.json');

for (const jsonFile of jsonFiles) {
  const packageName = jsonFile.replace('.json', '');
  const jsonPath = join(API_DIR, jsonFile);

  const extraDocsConfig = getExtraDocsConfig(packageName);

  console.log(`📦 Processing ${packageName}...`);

  const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  // Process components
  const components = data.components || [];
  for (const component of components) {
    generateApiFile(packageName, component.name, 'Component', component);
    totalGenerated++;
  }

  // Process directives
  const directives = data.directives || [];
  for (const directive of directives) {
    generateApiFile(packageName, directive.name, 'Directive', directive);
    totalGenerated++;
  }

  // Process services (injectables)
  const services = data.injectables || [];
  for (const service of services) {
    generateApiFile(packageName, service.name, 'Service', service);
    totalGenerated++;
  }

  // Process interfaces
  const interfaces = data.interfaces || [];
  if (extraDocsConfig.includeInterfaces) {
    for (const iface of interfaces) {
      generateApiFile(packageName, iface.name, 'Interface', iface);
      totalGenerated++;
    }
  }

  // Process pipes
  const pipes = data.pipes || [];
  for (const pipe of pipes) {
    generateApiFile(packageName, pipe.name, 'Pipe', pipe);
    totalGenerated++;
  }

  // Process miscellaneous (functions, variables, etc.)
  const misc = data.miscellaneous || {};

  if (extraDocsConfig.includeFunctions) {
    // Compodoc output varies by version:
    // - some versions expose `misc.functions` as a flat array
    // - some expose `misc.groupedFunctions` as an object keyed by file
    const miscFunctions = misc.groupedFunctions ?? misc.functions;
    if (Array.isArray(miscFunctions)) {
      for (const fn of miscFunctions) {
        if (!shouldEmitFunction(extraDocsConfig, fn)) {
          continue;
        }
        generateApiFile(packageName, fn.name, 'Function', fn);
        totalGenerated++;
      }
    } else if (miscFunctions && typeof miscFunctions === 'object') {
      for (const fileFunctions of Object.values(miscFunctions)) {
        if (!Array.isArray(fileFunctions)) {
          continue;
        }
        for (const fn of fileFunctions) {
          if (!shouldEmitFunction(extraDocsConfig, fn)) {
            continue;
          }
          generateApiFile(packageName, fn.name, 'Function', fn);
          totalGenerated++;
        }
      }
    }
  }

  const miscVariables = misc.groupedVariables ?? misc.variables;
  const includeVariableNames = extraDocsConfig.includeVariableNames;
  if (includeVariableNames.size > 0 || extraDocsConfig.includeVariableTagName) {
    const emitVariable = (v) => {
      if (!shouldEmitVariable(extraDocsConfig, v)) {
        return;
      }
      generateApiFile(packageName, v.name, 'Variable', v);
      totalGenerated++;
    };

    if (Array.isArray(miscVariables)) {
      for (const v of miscVariables) {
        emitVariable(v);
      }
    } else if (miscVariables && typeof miscVariables === 'object') {
      for (const fileVariables of Object.values(miscVariables)) {
        if (!Array.isArray(fileVariables)) {
          continue;
        }
        for (const v of fileVariables) {
          emitVariable(v);
        }
      }
    }
  }

  console.log(
    `  ✓ ${components.length} components, ${directives.length} directives, ${services.length} services, ${interfaces.length} interfaces, ${pipes.length} pipes\n`
  );
}

console.log(`✅ Generated ${totalGenerated} API files across ${jsonFiles.length} packages`);

/**
 * Generate API file for a single item (component, directive, service, pipe)
 */
function generateApiFile(packageName, className, type, data) {
  const packageDir = join(DOCS_DIR, packageName);
  const itemDir = join(packageDir, className);
  const apiFilePath = join(itemDir, 'api.md');

  // Create directory if it doesn't exist
  if (!existsSync(itemDir)) {
    mkdirSync(itemDir, { recursive: true });
  }

  // Generate markdown
  const markdown = generateItemApiMarkdown(packageName, className, type, data);

  // Write file
  writeFileSync(apiFilePath, markdown);
  console.log(`  ✓ ${packageName}/${className}/api.md`);
}

/**
 * Generate markdown for a single item
 */
function generateItemApiMarkdown(packageName, className, type, data) {
  const lines = [];

  // Title
  lines.push(`# ${className}`);
  lines.push('');
  lines.push(`**Type:** ${type}`);
  lines.push('');
  lines.push(`**Package:** \`@cocoar/${packageName}\``);
  lines.push('');
  lines.push('> 🤖 **Auto-generated** from TypeScript source code using Compodoc.');
  lines.push('> Run `pnpm docs:all` to regenerate.');
  lines.push('');

  // Description
  // Use rawdescription if available (preserves markdown), fall back to HTML description
  const description = data.rawdescription || data.description;
  if (description) {
    const cleanedDesc = cleanDescription(description, data.rawdescription !== undefined);

    // Check if description contains code fences (from @example)
    // Split into main description and examples
    const parts = splitDescriptionAndExamples(cleanedDesc);

    if (parts.description) {
      lines.push('## Description');
      lines.push('');
      lines.push(parts.description);
      lines.push('');
    }

    if (parts.examples) {
      lines.push('## Examples');
      lines.push('');
      lines.push(parts.examples);
      lines.push('');
    }
  }

  // Type-specific sections
  if (type === 'Component') {
    lines.push(...generateComponentSections(data));
  } else if (type === 'Directive') {
    lines.push(...generateDirectiveSections(data));
  } else if (type === 'Service') {
    lines.push(...generateServiceSections(data));
  } else if (type === 'Interface') {
    lines.push(...generateInterfaceSections(data));
  } else if (type === 'Pipe') {
    lines.push(...generatePipeSections(data));
  } else if (type === 'Function') {
    lines.push(...generateFunctionSections(data));
  } else if (type === 'Variable') {
    lines.push(...generateVariableSections(data));
  }

  return lines.join('\n');
}

/**
 * Generate interface-specific sections
 */
function generateInterfaceSections(iface) {
  const lines = [];

  if (iface.properties && iface.properties.length > 0) {
    lines.push('## Properties');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('| --- | --- | --- |');

    for (const prop of iface.properties) {
      const name = `\`${prop.name}\``;
      const type = prop.type ? `\`${escapeMarkdown(prop.type)}\`` : '-';
      const description = cleanHtml(prop.description || '').replace(/\n/g, ' ');
      lines.push(`| ${name} | ${type} | ${description} |`);
    }

    lines.push('');
  }

  return lines;
}

/**
 * Generate function-specific sections
 */
function generateFunctionSections(fn) {
  const lines = [];

  lines.push('## Signature');
  lines.push('');
  lines.push('```ts');

  const args = (fn.args || []).map((a) => (a.type ? `${a.name}: ${a.type}` : a.name)).join(', ');
  const returnType = fn.returnType ? `: ${fn.returnType}` : '';
  lines.push(`function ${fn.name}(${args})${returnType};`);
  lines.push('```');
  lines.push('');

  if (fn.args && fn.args.length > 0) {
    lines.push('## Parameters');
    lines.push('');

    for (const arg of fn.args) {
      const argType = arg.type ? `: \`${escapeMarkdown(arg.type)}\`` : '';
      lines.push(`- \`${arg.name}\`${argType}`);
    }

    lines.push('');
  }

  if (fn.returnType) {
    lines.push(`**Returns:** \`${escapeMarkdown(fn.returnType)}\``);
    lines.push('');
  }

  return lines;
}

/**
 * Generate variable-specific sections
 */
function generateVariableSections(v) {
  const lines = [];

  lines.push('## Type');
  lines.push('');

  if (v.type) {
    lines.push(`\`${escapeMarkdown(v.type)}\``);
  } else {
    lines.push('-');
  }
  lines.push('');

  return lines;
}

/**
 * Generate component-specific sections
 */
function generateComponentSections(component) {
  const lines = [];

  // Selector
  if (component.selector) {
    lines.push('## Selector');
    lines.push('');
    lines.push('```html');
    lines.push(`<${component.selector}></${component.selector}>`);
    lines.push('```');
    lines.push('');
  }

  // Inputs
  if (component.inputsClass && component.inputsClass.length > 0) {
    lines.push('## Inputs');
    lines.push('');
    lines.push('| Name | Type | Default | Required | Description |');
    lines.push('| --- | --- | --- | --- | --- |');

    for (const input of component.inputsClass) {
      const name = `\`${input.name}\``;
      const type = `\`${escapeMarkdown(input.type)}\``;
      const defaultValue = input.defaultValue ? `\`${escapeMarkdown(input.defaultValue)}\`` : '-';
      const required = input.required === true ? '✅' : '-';
      const description = cleanHtml(input.description || '').replace(/\n/g, ' ');

      lines.push(`| ${name} | ${type} | ${defaultValue} | ${required} | ${description} |`);
    }

    lines.push('');
  }

  // Outputs
  if (component.outputsClass && component.outputsClass.length > 0) {
    lines.push('## Outputs');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('| --- | --- | --- |');

    for (const output of component.outputsClass) {
      const name = `\`${output.name}\``;
      const type = `\`${escapeMarkdown(output.type)}\``;
      const description = cleanHtml(output.description || '').replace(/\n/g, ' ');

      lines.push(`| ${name} | ${type} | ${description} |`);
    }

    lines.push('');
  }

  // Methods (public only)
  const publicMethods = (component.methods || []).filter(
    (m) => !m.modifierKind?.includes('private') && !m.modifierKind?.includes('protected')
  );

  if (publicMethods.length > 0) {
    lines.push('## Methods');
    lines.push('');

    for (const method of publicMethods) {
      lines.push(`### \`${method.name}()\``);
      lines.push('');

      // Use rawdescription if available (preserves markdown)
      const methodDesc = method.rawdescription || method.description;
      if (methodDesc) {
        lines.push(cleanDescription(methodDesc, method.rawdescription !== undefined));
        lines.push('');
      }

      // Parameters
      if (method.args && method.args.length > 0) {
        lines.push('**Parameters:**');
        lines.push('');
        for (const arg of method.args) {
          const argType = arg.type ? `: \`${escapeMarkdown(arg.type)}\`` : '';
          const argDesc = arg.description ? ` - ${arg.description}` : '';
          lines.push(`- \`${arg.name}\`${argType}${argDesc}`);
        }
        lines.push('');
      }

      // Return type
      if (method.returnType) {
        lines.push(`**Returns:** \`${escapeMarkdown(method.returnType)}\``);
        lines.push('');
      }
    }
  }

  // Host bindings
  if (component.hostBindings && Object.keys(component.hostBindings).length > 0) {
    lines.push('## Host Bindings');
    lines.push('');
    lines.push('| Binding | Value |');
    lines.push('| --- | --- |');

    for (const [key, value] of Object.entries(component.hostBindings)) {
      lines.push(`| \`${key}\` | \`${escapeMarkdown(String(value))}\` |`);
    }

    lines.push('');
  }

  return lines;
}

/**
 * Generate directive-specific sections
 */
function generateDirectiveSections(directive) {
  const lines = [];

  // Selector
  if (directive.selector) {
    lines.push('## Selector');
    lines.push('');
    lines.push('```html');
    lines.push(`[${directive.selector}]`);
    lines.push('```');
    lines.push('');
  }

  // Inputs
  if (directive.inputsClass && directive.inputsClass.length > 0) {
    lines.push('## Inputs');
    lines.push('');
    lines.push('| Name | Type | Default | Required | Description |');
    lines.push('| --- | --- | --- | --- | --- |');

    for (const input of directive.inputsClass) {
      const name = `\`${input.name}\``;
      const type = `\`${escapeMarkdown(input.type)}\``;
      const defaultValue = input.defaultValue ? `\`${escapeMarkdown(input.defaultValue)}\`` : '-';
      const required = input.required === true ? '✅' : '-';
      const description = cleanHtml(input.description || '').replace(/\n/g, ' ');

      lines.push(`| ${name} | ${type} | ${defaultValue} | ${required} | ${description} |`);
    }

    lines.push('');
  }

  // Outputs
  if (directive.outputsClass && directive.outputsClass.length > 0) {
    lines.push('## Outputs');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('| --- | --- | --- |');

    for (const output of directive.outputsClass) {
      const name = `\`${output.name}\``;
      const type = `\`${escapeMarkdown(output.type)}\``;
      const description = cleanHtml(output.description || '').replace(/\n/g, ' ');

      lines.push(`| ${name} | ${type} | ${description} |`);
    }

    lines.push('');
  }

  return lines;
}

/**
 * Generate service-specific sections
 */
function generateServiceSections(service) {
  const lines = [];

  // Properties
  const publicProperties = (service.properties || []).filter(
    (p) => !p.modifierKind?.includes('private')
  );

  if (publicProperties.length > 0) {
    lines.push('## Properties');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('| --- | --- | --- |');

    for (const prop of publicProperties) {
      const name = `\`${prop.name}\``;
      const type = prop.type ? `\`${escapeMarkdown(prop.type)}\`` : '-';
      const description = cleanHtml(prop.description || '').replace(/\n/g, ' ');

      lines.push(`| ${name} | ${type} | ${description} |`);
    }

    lines.push('');
  }

  // Methods
  const publicMethods = (service.methods || []).filter((m) => !m.modifierKind?.includes('private'));

  if (publicMethods.length > 0) {
    lines.push('## Methods');
    lines.push('');

    for (const method of publicMethods) {
      lines.push(`### \`${method.name}()\``);
      lines.push('');

      if (method.description) {
        lines.push(method.description.trim());
        lines.push('');
      }

      // Parameters
      if (method.args && method.args.length > 0) {
        lines.push('**Parameters:**');
        lines.push('');
        for (const arg of method.args) {
          const argType = arg.type ? `: \`${escapeMarkdown(arg.type)}\`` : '';
          const argDesc = arg.description ? ` - ${arg.description}` : '';
          lines.push(`- \`${arg.name}\`${argType}${argDesc}`);
        }
        lines.push('');
      }

      // Return type
      if (method.returnType) {
        lines.push(`**Returns:** \`${escapeMarkdown(method.returnType)}\``);
        lines.push('');
      }
    }
  }

  return lines;
}

/**
 * Generate pipe-specific sections
 */
function generatePipeSections(pipe) {
  const lines = [];

  // Usage
  if (pipe.name) {
    lines.push('## Usage');
    lines.push('');
    lines.push('```html');
    lines.push(`{{ value | ${pipe.name} }}`);
    lines.push('```');
    lines.push('');
  }

  return lines;
}

/**
 * Escape markdown special characters
 */
function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/**
 * Split description into main description and examples section
 * Detects code fences (from @example) and separates them
 */
function splitDescriptionAndExamples(text) {
  if (!text) return { description: '', examples: '' };

  // Find the first code fence (```)
  const codeFenceIndex = text.indexOf('```');

  if (codeFenceIndex === -1) {
    // No code fence found, it's all description
    return { description: text.trim(), examples: '' };
  }

  // Split at the code fence
  const description = text.substring(0, codeFenceIndex).trim();
  const examples = text.substring(codeFenceIndex).trim();

  return { description, examples };
}

/**
 * Clean description text - handles both raw markdown and HTML from Compodoc
 * @param {string} text - The description text
 * @param {boolean} isRaw - True if this is rawdescription (markdown), false if HTML
 */
function cleanDescription(text, isRaw = false) {
  if (!text) return '';

  // If it's raw markdown, preserve it but clean up Compodoc artifacts
  if (isRaw) {
    return String(text)
      .replace(/___COMPODOC_EMPTY_LINE___/g, '')
      .trim();
  }

  // Otherwise, it's HTML - clean it like before
  return cleanHtml(text);
}

/**
 * Clean HTML from Compodoc descriptions and convert to plain text/markdown
 */
function cleanHtml(html) {
  if (!html) return '';

  return (
    String(html)
      // Remove paragraph tags (just wrappers)
      .replace(/<\/?p>/g, '')
      // Convert <code> to backticks
      .replace(/<code[^>]*>(.*?)<\/code>/gs, '`$1`')
      // Convert <b> and <strong> to bold
      .replace(/<\/?(?:b|strong)>/g, '**')
      // Convert <em> and <i> to italic
      .replace(/<\/?(?:em|i)>/g, '_')
      // Remove list tags (ul/ol/li) - just keep content with line breaks
      .replace(/<ul>/g, '\n')
      .replace(/<\/ul>/g, '\n')
      .replace(/<ol>/g, '\n')
      .replace(/<\/ol>/g, '\n')
      .replace(/<li>/g, '- ')
      .replace(/<\/li>/g, '\n')
      // Remove div, pre, and other block tags
      .replace(/<\/?(?:div|pre|span)(?:\s+[^>]*)?>/g, '')
      // Remove class attributes and other noise from Compodoc
      .replace(/<b>\s*Example\s*:\s*<\/b>/g, '\n\nExample:')
      .replace(/class="[^"]*"/g, '')
      .replace(/___COMPODOC_EMPTY_LINE___/g, '')
      // Decode HTML entities
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      // Clean up multiple newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim whitespace
      .trim()
  );
}
