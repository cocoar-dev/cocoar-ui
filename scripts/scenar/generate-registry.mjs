#!/usr/bin/env node

/**
 * Scenar Registry Generator
 *
 * Scans the workspace for `*.scenario.ts` files and generates a registry
 * that imports all scenarios for the backstage app.
 *
 * This enables co-located scenarios - scenarios live next to their components
 * in libraries, and the backstage app automatically discovers them.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../..');
// Check if running in watch mode
const watchMode = process.argv.includes('--watch');
/**
 * Simple glob implementation using fs.readdir recursively
 */
async function globFiles(patterns, cwd) {
  const results = [];

  for (const pattern of patterns) {
    const baseDir = pattern.split('*')[0];
    const files = await walkDirectory(path.join(cwd, baseDir));

    // Filter by pattern (simple *.scenario.ts matching)
    const matches = files.filter(file => file.endsWith('.scenario.ts'));
    results.push(...matches.map(f => path.relative(cwd, f)));
  }

  return results;
}

async function walkDirectory(dir) {
  const results = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and dist
        if (entry.name === 'node_modules' || entry.name === 'dist') {
          continue;
        }
        results.push(...await walkDirectory(fullPath));
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    // Ignore errors (e.g., permission denied)
  }

  return results;
}

/**
 * Scans workspace for scenario files and generates registry.
 */
async function generateRegistry() {
  console.log('🔍 Scanning workspace for scenarios...');

  // Find all *.scenario.ts files in the workspace
  const scenarioFiles = await globFiles(
    [
      'libs/',
      'apps/scenar-backstage/src/scenarios/',
    ],
    workspaceRoot
  );

  console.log(`✅ Found ${scenarioFiles.length} scenario file(s)`);

  if (scenarioFiles.length === 0) {
    console.warn('⚠️  No scenario files found. Registry will be empty.');
  }

  // Extract scenario exports from each file
  const scenarios = [];
  for (const file of scenarioFiles) {
    const filePath = path.join(workspaceRoot, file);
    const exports = await extractScenarioExports(filePath, file);

    // Enhance each scenario with auto-generated component loader and inputs
    for (const scenario of exports) {
      await enhanceScenario(scenario, filePath);
    }

    scenarios.push(...exports);
  }

  console.log(`📦 Extracted ${scenarios.length} scenario(s)`);

  // Generate the registry file
  const registryPath = path.join(
    workspaceRoot,
    'apps/scenar-backstage/src/app/registry.generated.ts'
  );
  const registryContent = generateRegistryContent(scenarios, registryPath, workspaceRoot);

  await fs.writeFile(registryPath, registryContent, 'utf-8');

  console.log(`✨ Generated registry: ${path.relative(workspaceRoot, registryPath)}`);
  console.log('');
  console.log('Scenarios registered:');
  scenarios.forEach((s) => {
    console.log(`  • ${s.exportName} (from ${s.relativeFile})`);
  });
}

/**
 * Extracts exported scenario definitions from a TypeScript file.
 */
async function extractScenarioExports(filePath, relativeFile) {
  const sourceCode = await fs.readFile(filePath, 'utf-8');

  // Create a source file
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const scenarios = [];

  // Visit all top-level statements
  ts.forEachChild(sourceFile, (node) => {
    // Look for: export const X = defineScenario(...)
    if (
      ts.isVariableStatement(node) &&
      hasExportModifier(node)
    ) {
      // Process all variable declarations in the statement
      for (const declaration of node.declarationList.declarations) {
        if (
          ts.isVariableDeclaration(declaration) &&
          declaration.initializer &&
          ts.isCallExpression(declaration.initializer)
        ) {
          const callExpr = declaration.initializer;
          const funcName = callExpr.expression.getText(sourceFile);

          // Check if it's a defineScenario call
          if (funcName === 'defineScenario') {
            const exportName = declaration.name.getText(sourceFile);

            // Convert file path to import path
            const importPath = convertToImportPath(relativeFile);

            scenarios.push({
              exportName,
              importPath,
              relativeFile,
            });
          }
        }
      }
    }
  });

  return scenarios;
}

/**
 * Enhances a scenario with auto-generated component loader and inputs.
 */
async function enhanceScenario(scenario, scenarioFilePath) {
  // Infer component file path from scenario file
  // Try multiple naming patterns:
  // 1. hello-demo.scenario.ts -> hello-demo.component.ts
  // 2. icon.scenario.ts -> coar-icon.component.ts (with coar- prefix)
  // 3. hello-demo.component.scenario.ts -> component is in the same file
  const scenarioDir = path.dirname(scenarioFilePath);
  const scenarioBasename = path.basename(scenarioFilePath, '.scenario.ts');

  let possibleComponentPaths = [];
  let componentInSameFile = false;

  // Check if scenario is defined in the component file itself (e.g., *.component.scenario.ts)
  if (scenarioBasename.endsWith('.component')) {
    // Component is in the same file
    componentInSameFile = true;
    possibleComponentPaths = [scenarioFilePath];
  } else {
    // Component is in a separate file
    possibleComponentPaths = [
      path.join(scenarioDir, `${scenarioBasename}.component.ts`),
      path.join(scenarioDir, `coar-${scenarioBasename}.component.ts`),
    ];
  }

  let componentFilePath = null;
  let componentFileName = null;

  for (const candidatePath of possibleComponentPaths) {
    try {
      await fs.access(candidatePath);
      componentFilePath = candidatePath;
      if (componentInSameFile) {
        // Extract component filename from the scenario filename
        componentFileName = scenarioBasename; // e.g., "hello-demo.component"
      } else {
        componentFileName = path.basename(candidatePath, '.ts');
      }
      break;
    } catch {
      // Try next candidate
    }
  }

  // Check if component file exists
  if (!componentFilePath) {
    // Component file doesn't exist - this is an error!
    console.warn(`⚠️  No component file found for scenario '${scenario.exportName}' in ${scenarioFilePath}`);
    return;
  }

  // Store component info for registry generation
  scenario.componentFilePath = componentFilePath;
  scenario.componentFileName = componentFileName;
  scenario.componentInSameFile = componentInSameFile;

  // Parse component file to extract input defaults
  scenario.componentInputs = await extractComponentInputs(componentFilePath);
}

/**
 * Extracts input() signal defaults from a component file.
 */
async function extractComponentInputs(componentFilePath) {
  const inputs = {};

  try {
    const sourceCode = await fs.readFile(componentFilePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      componentFilePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    // Find the component class
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node)) {
        // Look through class members for input() calls
        node.members?.forEach((member) => {
          if (ts.isPropertyDeclaration(member) && member.initializer) {
            // Check if it's an input() call
            if (ts.isCallExpression(member.initializer)) {
              const funcName = member.initializer.expression.getText(sourceFile);

              if (funcName === 'input') {
                const inputName = member.name.getText(sourceFile);

                // Extract default value (first argument to input())
                if (member.initializer.arguments.length > 0) {
                  const defaultValue = member.initializer.arguments[0];
                  const defaultValueText = defaultValue.getText(sourceFile);

                  // Try to parse the default value
                  try {
                    // Handle common cases: strings, numbers, booleans, null, undefined
                    if (defaultValue.kind === ts.SyntaxKind.StringLiteral) {
                      inputs[inputName] = defaultValueText.slice(1, -1); // Remove quotes
                    } else if (defaultValue.kind === ts.SyntaxKind.NumericLiteral) {
                      inputs[inputName] = parseFloat(defaultValueText);
                    } else if (defaultValue.kind === ts.SyntaxKind.TrueKeyword) {
                      inputs[inputName] = true;
                    } else if (defaultValue.kind === ts.SyntaxKind.FalseKeyword) {
                      inputs[inputName] = false;
                    } else if (defaultValue.kind === ts.SyntaxKind.NullKeyword) {
                      inputs[inputName] = null;
                    } else if (defaultValue.kind === ts.SyntaxKind.UndefinedKeyword) {
                      inputs[inputName] = undefined;
                    } else {
                      // For complex values, use the text as-is (arrays, objects, etc.)
                      inputs[inputName] = `__RAW__${defaultValueText}`;
                    }
                  } catch (err) {
                    // If parsing fails, skip this input
                  }
                }
              }
            }
          }
        });
      }
    });
  } catch (err) {
    // If we can't parse the component, return empty inputs
  }

  return inputs;
}

/**
 * Checks if a node has an export modifier.
 */
function hasExportModifier(node) {
  return (
    node.modifiers &&
    node.modifiers.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)
  );
}

/**
 * Converts a file path to an import path.
 * Examples:
 *   libs/ui-components/src/lib/button/button.scenario.ts
 *     -> ../../../libs/ui-components/src/lib/button/button.scenario
 *
 *   apps/scenar-backstage/src/scenarios/hello-demo.scenario.ts
 *     -> ../scenarios/hello-demo.scenario
 */
function convertToImportPath(relativeFile) {
  // Remove .ts extension
  const withoutExt = relativeFile.replace(/\.ts$/, '');

  // Calculate relative path from registry.generated.ts location
  // registry.generated.ts is at: apps/scenar-backstage/src/app/
  const registryDir = 'apps/scenar-backstage/src/app';

  // Get relative path from registry dir to scenario file
  const relativePath = path.relative(registryDir, withoutExt);

  // Ensure it starts with ../ or ./
  if (!relativePath.startsWith('.')) {
    return './' + relativePath.replace(/\\/g, '/');
  }

  return relativePath.replace(/\\/g, '/');
}

/**
 * Converts a kebab-case string to PascalCase.
 */
function pascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Formats inputs object for code generation.
 */
function formatInputsObject(inputs) {
  const entries = Object.entries(inputs).map(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('__RAW__')) {
      // Raw value - use as-is without quotes
      return `${key}: ${value.replace('__RAW__', '')}`;
    } else if (typeof value === 'string') {
      return `${key}: '${value}'`;
    } else if (value === null) {
      return `${key}: null`;
    } else if (value === undefined) {
      return `${key}: undefined`;
    } else {
      return `${key}: ${JSON.stringify(value)}`;
    }
  });

  return `{ ${entries.join(', ')} }`;
}

/**
 * Generates the registry file content.
 */
function generateRegistryContent(scenarios, registryPath, workspaceRoot) {
  if (scenarios.length === 0) {
    return `// Auto-generated by scripts/scenar/generate-registry.mjs
// No scenarios found in workspace

import type { ScenarioDefinition } from '@cocoar/scenar-abstractions';

export const SCENARIO_REGISTRY: Record<string, ScenarioDefinition> = {};
`;
  }

  // Handle naming collisions by generating unique aliases
  const importMap = new Map(); // exportName -> count
  const scenariosWithAliases = scenarios.map((s) => {
    const count = importMap.get(s.exportName) || 0;
    importMap.set(s.exportName, count + 1);

    // Generate unique alias if there's a collision
    const baseAlias = count > 0
      ? `${s.exportName}_${count}`
      : s.exportName;

    // Add _base suffix since all scenarios get enhanced
    const sourceAlias = s.componentFileName ? `${baseAlias}_base` : baseAlias;
    const finalAlias = baseAlias;

    return { ...s, alias: finalAlias, sourceAlias };
  });

  // Generate imports with aliases for collisions
  const imports = scenariosWithAliases
    .map((s) => {
      const importName = (s.sourceAlias !== s.exportName)
        ? `${s.exportName} as ${s.sourceAlias}`
        : s.exportName;
      return `import { ${importName} } from '${s.importPath}';`;
    })
    .join('\n');

  // Generate registry entries - all scenarios get enhanced with component loader
  const entries = scenariosWithAliases
    .map((s) => {
      // Skip if no component file was found
      if (!s.componentFileName) {
        console.warn(`⚠️  Skipping scenario '${s.exportName}' - no component file found`);
        return null;
      }

      // Generate enhanced scenario
      const scenarioDir = path.dirname(path.join(workspaceRoot, s.relativeFile));
      const registryDir = path.dirname(registryPath);

      let componentRelPath;
      if (s.componentInSameFile) {
        // Component is in the same file as the scenario - use the scenario's import path
        componentRelPath = s.importPath;
      } else {
        // Component is in a separate file
        const componentAbsPath = path.join(scenarioDir, `${s.componentFileName}.ts`);
        componentRelPath = path.relative(registryDir, componentAbsPath)
          .replace(/\\/g, '/')
          .replace(/\.ts$/, '');
        componentRelPath = componentRelPath.startsWith('.') ? componentRelPath : `./${componentRelPath}`;
      }

      // Infer component class name from file name
      const componentClassName = pascalCase(s.componentFileName.replace('.component', '')) + 'Component';

      const parts = [];
      parts.push(`    ...${s.sourceAlias}`);
      parts.push(`    component: async () => (await import('${componentRelPath}')).${componentClassName}`);

      if (s.componentInputs && Object.keys(s.componentInputs).length > 0) {
        const inputsStr = formatInputsObject(s.componentInputs);
        parts.push(`    inputs: ${inputsStr}`);
      }

      return `  [${s.sourceAlias}.id]: {\n${parts.join(',\n')}\n  }`;
    })
    .filter(entry => entry !== null)
    .join(',\n');

  return `// Auto-generated by scripts/scenar/generate-registry.mjs
// DO NOT EDIT MANUALLY - This file is generated from *.scenario.ts files

import type { ScenarioDefinition } from '@cocoar/scenar-abstractions';
${imports}

export const SCENARIO_REGISTRY: Record<string, ScenarioDefinition> = {
${entries}
};
`;
}

/**
 * Watch for changes to scenario files and regenerate
 */
async function watchScenarios() {
  console.log('👀 Watching for scenario file changes...\n');

  const watchPaths = [
    path.join(workspaceRoot, 'libs'),
    path.join(workspaceRoot, 'apps/scenar-backstage/src/scenarios'),
  ];

  // Initial generation
  await generateRegistry();

  // Use Node's built-in fs.watch (available in Node 20+)
  const { watch } = await import('fs');

  for (const watchPath of watchPaths) {
    try {
      const watcher = watch(watchPath, { recursive: true }, async (eventType, filename) => {
        if (filename && filename.endsWith('.scenario.ts')) {
          console.log(`\n🔄 Detected change in ${filename}, regenerating...`);
          try {
            await generateRegistry();
          } catch (err) {
            console.error('❌ Regeneration failed:', err.message);
          }
        }
      });

      watcher.on('error', (err) => {
        console.error(`⚠️  Watcher error for ${watchPath}:`, err.message);
      });
    } catch (err) {
      console.error(`⚠️  Could not watch ${watchPath}:`, err.message);
    }
  }
}

// Run the generator
if (watchMode) {
  watchScenarios().catch((err) => {
    console.error('❌ Watch mode failed:', err);
    process.exit(1);
  });
} else {
  generateRegistry().catch((err) => {
    console.error('❌ Failed to generate registry:', err);
    process.exit(1);
  });
}
