#!/usr/bin/env node
/**
 * Component API Extractor
 *
 * Parses Angular component files using ts-morph to extract:
 * - Inputs with types, defaults, and JSDoc descriptions
 * - Outputs with types and JSDoc descriptions
 *
 * Generates TypeScript files that can be imported by the showcase app.
 *
 * Usage: node scripts/docs/extract-component-api.mjs
 */

import { Project, SyntaxKind } from 'ts-morph';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '../..');
const COMPONENTS_DIR = join(ROOT_DIR, 'libs/ui-components/src/lib');
const OUTPUT_DIR = join(ROOT_DIR, 'apps/showcase/src/generated');

/**
 * Extract API documentation from a component file
 */
function extractComponentApi(sourceFile) {
  const classes = sourceFile.getClasses();
  const results = [];

  for (const classDecl of classes) {
    const decorator = classDecl.getDecorator('Component');
    if (!decorator) continue;

    const className = classDecl.getName();
    const selector = extractSelector(decorator);

    const inputs = [];
    const outputs = [];

    for (const prop of classDecl.getProperties()) {
      const inputInfo = extractInput(prop, sourceFile);
      if (inputInfo) {
        inputs.push(inputInfo);
        continue;
      }

      const outputInfo = extractOutput(prop);
      if (outputInfo) {
        outputs.push(outputInfo);
      }
    }

    if (inputs.length > 0 || outputs.length > 0) {
      results.push({
        className,
        selector,
        inputs,
        outputs,
      });
    }
  }

  return results;
}

/**
 * Extract selector from @Component decorator
 */
function extractSelector(decorator) {
  const args = decorator.getArguments()[0];
  if (!args) return '';

  const selectorProp = args
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((p) => p.getName() === 'selector');

  if (selectorProp) {
    const init = selectorProp.getInitializer();
    if (init) {
      return init.getText().replace(/['"]/g, '');
    }
  }
  return '';
}

/**
 * Extract input() signal information
 */
function extractInput(prop, sourceFile) {
  const initializer = prop.getInitializer();
  if (!initializer) return null;

  const text = initializer.getText();

  // Match input(), input.required(), input<Type>(), etc.
  const isInput =
    text.startsWith('input(') || text.startsWith('input.required(') || text.startsWith('input<');
  if (!isInput) return null;

  // Skip protected/private inputs (internal state)
  const modifiers = prop.getModifiers().map((m) => m.getText());
  if (modifiers.includes('protected') || modifiers.includes('private')) {
    return null;
  }

  const name = prop.getName();
  const jsDoc = extractJsDoc(prop);
  const { type, defaultValue, required } = parseInputSignature(text, prop, sourceFile);

  return {
    name,
    type,
    default: defaultValue,
    description: jsDoc,
    required,
  };
}

/**
 * Extract output() signal information
 */
function extractOutput(prop) {
  const initializer = prop.getInitializer();
  if (!initializer) return null;

  const text = initializer.getText();

  // Match output(), output<Type>()
  const isOutput = text.startsWith('output(') || text.startsWith('output<');
  if (!isOutput) return null;

  // Skip protected/private outputs
  const modifiers = prop.getModifiers().map((m) => m.getText());
  if (modifiers.includes('protected') || modifiers.includes('private')) {
    return null;
  }

  const name = prop.getName();
  const jsDoc = extractJsDoc(prop);
  const type = parseOutputType(text);

  return {
    name,
    type,
    description: jsDoc,
  };
}

/**
 * Parse input() signature to extract type and default value
 */
function parseInputSignature(text, prop, sourceFile) {
  const required = text.includes('input.required');

  // Try to get type from property type annotation first
  const typeNode = prop.getTypeNode();
  let type = 'unknown';

  if (typeNode) {
    type = resolveType(typeNode, sourceFile);
  } else {
    // Extract from generic: input<boolean>(true) -> boolean
    const genericMatch = text.match(/input(?:\.required)?<([^>]+)>/);
    if (genericMatch) {
      const genericType = genericMatch[1];
      // Try to resolve the type if it's a type alias
      type = resolveTypeString(genericType, sourceFile);
    } else {
      // Infer from default value
      const defaultMatch = text.match(/input(?:\.required)?\(([^)]*)\)/);
      if (defaultMatch && defaultMatch[1]) {
        type = inferTypeFromValue(defaultMatch[1].trim());
      }
    }
  }

  // Extract default value - only first argument, ignore options object
  let defaultValue = required ? 'required' : "''";
  const valueMatch = text.match(/input(?:\.required)?(?:<[^>]+>)?\(([^)]*)\)/);
  if (valueMatch && valueMatch[1]) {
    const args = valueMatch[1].trim();

    // Split by comma, but only take first argument (default value)
    // Handle cases like: input(false, { transform: booleanAttribute })
    if (args) {
      // Find first comma that's not inside braces/brackets
      let depth = 0;
      let firstArgEnd = args.length;

      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        if (char === '{' || char === '[' || char === '(') depth++;
        if (char === '}' || char === ']' || char === ')') depth--;
        if (char === ',' && depth === 0) {
          firstArgEnd = i;
          break;
        }
      }

      defaultValue = args.substring(0, firstArgEnd).trim() || (required ? 'required' : "''");
    } else {
      defaultValue = required ? 'required' : "''";
    }
  }

  // Clean up InputSignal wrapper if present
  if (type.startsWith('InputSignal<')) {
    type = type.replace(/^InputSignal<(.+)>$/, '$1');
  }

  return { type, defaultValue, required };
}

/**
 * Resolve a TypeNode to its actual type, expanding type aliases to union literals
 */
function resolveType(typeNode, sourceFile) {
  const typeText = typeNode.getText();

  // If it's already a union type or primitive, return as-is
  if (
    typeText.includes('|') ||
    ['string', 'number', 'boolean', 'void', 'unknown', 'any'].includes(typeText)
  ) {
    return typeText;
  }

  // Try to resolve type alias
  return resolveTypeString(typeText, sourceFile);
}

/**
 * Resolve a type string to its definition, expanding type aliases
 */
function resolveTypeString(typeStr, sourceFile) {
  // Remove any generic parameters for lookup (e.g., "Type<X>" -> "Type")
  const baseType = typeStr.split('<')[0].split(',')[0].trim();

  // Check if it's a type alias in the same file
  const typeAlias = sourceFile.getTypeAlias(baseType);
  if (typeAlias) {
    const typeNode = typeAlias.getTypeNode();
    if (typeNode) {
      const resolvedType = typeNode.getText();
      // If it's a union type, return the union
      if (resolvedType.includes('|')) {
        return resolvedType;
      }
    }
  }

  // Return original if we couldn't resolve it
  return typeStr;
}

/**
 * Parse output() type
 */
function parseOutputType(text) {
  const genericMatch = text.match(/output<([^>]+)>/);
  if (genericMatch) {
    return genericMatch[1];
  }
  return 'void';
}

/**
 * Infer type from a literal value
 */
function inferTypeFromValue(value) {
  if (value === 'true' || value === 'false') return 'boolean';
  if (/^['"]/.test(value)) return 'string';
  if (/^\d+$/.test(value)) return 'number';
  if (/^\d+\.\d+$/.test(value)) return 'number';
  return 'unknown';
}

/**
 * Extract JSDoc comment from a property
 */
function extractJsDoc(prop) {
  const jsDocs = prop.getJsDocs();
  if (jsDocs.length === 0) return '';

  const doc = jsDocs[0];
  const description = doc.getDescription().trim();
  return description;
}

/**
 * Generate TypeScript file content
 */
function generateTypeScriptContent(components) {
  let content = `/**
 * Auto-generated API documentation
 * Generated by: scripts/docs/extract-component-api.mjs
 * DO NOT EDIT MANUALLY
 */

export interface ApiProperty {
  name: string;
  type: string;
  default: string;
  description: string;
  required?: boolean;
}

export interface ApiOutput {
  name: string;
  type: string;
  description: string;
}

export interface ComponentApi {
  className: string;
  selector: string;
  inputs: ApiProperty[];
  outputs: ApiOutput[];
}

`;

  for (const comp of components) {
    const varName = comp.className.replace(/Component$/, '').replace(/^Coar/, '') + 'Api';

    content += `export const ${varName}: ComponentApi = ${JSON.stringify(comp, null, 2)};\n\n`;
  }

  return content;
}

/**
 * Main extraction function
 */
async function main() {
  console.log('🔍 Extracting component APIs...\n');

  const project = new Project({
    tsConfigFilePath: join(ROOT_DIR, 'libs/ui-components/tsconfig.lib.json'),
  });

  // Find all component files
  const componentFiles = project.getSourceFiles().filter((sf) => {
    const path = sf.getFilePath();
    return path.includes('/lib/') && path.endsWith('.component.ts');
  });

  console.log(`Found ${componentFiles.length} component files\n`);

  const allComponents = [];

  for (const sourceFile of componentFiles) {
    const fileName = basename(sourceFile.getFilePath());
    const components = extractComponentApi(sourceFile);

    for (const comp of components) {
      console.log(`  ✓ ${comp.className}`);
      console.log(`    - ${comp.inputs.length} inputs, ${comp.outputs.length} outputs`);
      allComponents.push(comp);
    }
  }

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate combined output file
  const outputPath = join(OUTPUT_DIR, 'component-api.generated.ts');
  const content = generateTypeScriptContent(allComponents);
  writeFileSync(outputPath, content, 'utf-8');

  console.log(`\n✅ Generated: ${outputPath}`);
  console.log(`   ${allComponents.length} components documented`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
