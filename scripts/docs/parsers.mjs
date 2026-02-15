/**
 * Parsers — regex-based extraction of Angular component metadata from
 * TypeScript, HTML, and CSS source files. No TypeScript compiler needed.
 *
 * JSDoc extraction uses a two-pass approach:
 *  1. Build a position map of all `/** ... *​/` comments
 *  2. For each declaration, look up the nearest preceding JSDoc
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

// ─── Inputs (no inline JSDoc) ────────────────────────────────────────

const INPUT_RE =
  /(?:readonly\s+)?(\w+)\s*=\s*input<([^>]+)>\s*\(([^)]*)\)/g;

const INPUT_BARE_RE =
  /(?:readonly\s+)?(\w+)\s*=\s*input\(([^)]*)\)/g;

const INPUT_REQUIRED_RE =
  /(?:readonly\s+)?(\w+)\s*=\s*input\.required<([^>]+)>\s*\(/g;

// ─── Models ──────────────────────────────────────────────────────────

const MODEL_RE =
  /(?:readonly\s+)?(\w+)\s*=\s*model<([^>]+)>\s*\(([^)]*)\)/g;

const MODEL_BARE_RE =
  /(?:readonly\s+)?(\w+)\s*=\s*model\(([^)]*)\)/g;

// ─── Outputs ─────────────────────────────────────────────────────────

const OUTPUT_RE =
  /(?:readonly\s+)?(\w+)\s*=\s*output<([^>]*)>\s*\(/g;

const OUTPUT_VOID_RE =
  /(?:readonly\s+)?(\w+)\s*=\s*output\(\)/g;

// ─── Decorator ───────────────────────────────────────────────────────

const SELECTOR_RE = /selector:\s*'([^']+)'/;
const EXPORT_AS_RE = /exportAs:\s*'([^']+)'/;
const TEMPLATE_URL_RE = /templateUrl:\s*'([^']+)'/;
const STYLE_URL_RE = /styleUrls?:\s*(?:\[)?'([^']+)'(?:\])?/;
const INLINE_TEMPLATE_RE = /template:\s*`([\s\S]*?)`/;

// ─── Type exports ────────────────────────────────────────────────────

const TYPE_ALIAS_RE = /export\s+type\s+(\w+)\s*=\s*([^;]+)/g;

const INTERFACE_RE =
  /export\s+interface\s+(\w+)(?:<[^>]+>)?\s*\{([\s\S]*?\n\})/g;

// ─── Service ─────────────────────────────────────────────────────────

const INJECTABLE_RE = /@Injectable\s*\(\s*\{[^}]*providedIn:\s*'root'/;

const PUBLIC_METHOD_RE =
  /(?:public\s+)?(\w+)\s*(?:<[^>]+>)?\s*\(([^)]*)\)\s*:\s*([^\s{]+)/g;

// ─── Content slots ───────────────────────────────────────────────────

const NG_CONTENT_RE = /<ng-content(?:\s+select="([^"]+)")?\s*\/?>/g;

// ─── CSS custom properties ───────────────────────────────────────────

const CSS_VAR_RE = /var\(--coar-([\w-]+)(?:,\s*([^)]+))?\)/g;

// ─── CVA ─────────────────────────────────────────────────────────────

const EXTENDS_CVA_RE = /extends\s+CoarControlValueAccessor/;

// ─── Host directives ────────────────────────────────────────────────

const HOST_DIRECTIVES_RE = /hostDirectives:\s*\[([\s\S]*?)\]/;

// ─── CSS class documentation (for CSS-only components) ──────────────

const CSS_CLASS_RE = /\.(coar-[\w-]+)/g;

// ─── JSDoc index ─────────────────────────────────────────────────────

const JSDOC_BLOCK_RE = /\/\*\*([\s\S]*?)\*\//g;

/**
 * Build an index of all JSDoc blocks in the source,
 * keyed by their end position.
 * Returns an array sorted by position: { start, end, text }.
 */
function buildJsdocIndex(source) {
  const blocks = [];
  let m;
  JSDOC_BLOCK_RE.lastIndex = 0;
  while ((m = JSDOC_BLOCK_RE.exec(source)) !== null) {
    blocks.push({
      start: m.index,
      end: m.index + m[0].length,
      text: m[1],
    });
  }
  return blocks;
}

/**
 * Find the JSDoc block that immediately precedes a given position.
 * "Immediately" means only whitespace between the JSDoc `*​/` and the declaration.
 */
function findPrecedingJsdoc(jsdocIndex, source, position) {
  // Walk backwards through JSDoc blocks
  for (let i = jsdocIndex.length - 1; i >= 0; i--) {
    const block = jsdocIndex[i];
    if (block.end > position) continue;
    // Check that only whitespace separates the JSDoc end and the declaration
    const gap = source.slice(block.end, position);
    if (/^\s*$/.test(gap)) {
      return block.text;
    }
    // If the closest block doesn't touch, no point checking further ones
    break;
  }
  return null;
}

/**
 * Parse a single TypeScript source file and extract component/directive metadata.
 */
export function parseTypeScript(filePath) {
  const source = readFileSync(filePath, 'utf-8');
  const jsdocIndex = buildJsdocIndex(source);

  const result = {
    filePath,
    selector: null,
    exportAs: null,
    className: null,
    classJsdoc: null,
    kind: null, // 'component' | 'directive' | 'service'
    inputs: [],
    models: [],
    outputs: [],
    types: [],
    interfaces: [],
    isCva: false,
    isInjectable: false,
    publicMethods: [],
    hostDirectiveInputs: [],
    templateUrl: null,
    styleUrl: null,
    inlineTemplate: null,
  };

  // Determine kind
  if (/@Component\s*\(/.test(source)) result.kind = 'component';
  else if (/@Directive\s*\(/.test(source)) result.kind = 'directive';
  else if (INJECTABLE_RE.test(source)) {
    result.kind = 'service';
    result.isInjectable = true;
  }

  // Class name
  const classMatch = source.match(/export\s+class\s+(\w+)/);
  if (classMatch) result.className = classMatch[1];

  // Class-level JSDoc — find the decorator and look for the JSDoc immediately before it
  const decoratorMatch = source.match(/@(Component|Directive|Injectable)\s*\(/);
  if (decoratorMatch) {
    const jsdocText = findPrecedingJsdoc(jsdocIndex, source, decoratorMatch.index);
    if (jsdocText) result.classJsdoc = cleanJsdoc(jsdocText);
  }

  // Selector
  const selectorMatch = source.match(SELECTOR_RE);
  if (selectorMatch) result.selector = selectorMatch[1];

  // ExportAs
  const exportAsMatch = source.match(EXPORT_AS_RE);
  if (exportAsMatch) result.exportAs = exportAsMatch[1];

  // Template / style URLs
  const templateUrlMatch = source.match(TEMPLATE_URL_RE);
  if (templateUrlMatch) result.templateUrl = templateUrlMatch[1];

  const styleUrlMatch = source.match(STYLE_URL_RE);
  if (styleUrlMatch) result.styleUrl = styleUrlMatch[1];

  // Inline template
  const inlineTemplateMatch = source.match(INLINE_TEMPLATE_RE);
  if (inlineTemplateMatch) result.inlineTemplate = inlineTemplateMatch[1];

  // CVA
  result.isCva = EXTENDS_CVA_RE.test(source);

  // Host directives
  const hostDirMatch = source.match(HOST_DIRECTIVES_RE);
  if (hostDirMatch) {
    const inputsRe = /inputs:\s*\[([^\]]+)\]/g;
    let m;
    while ((m = inputsRe.exec(hostDirMatch[1])) !== null) {
      const names = m[1].match(/'([^']+)'/g);
      if (names) {
        result.hostDirectiveInputs.push(...names.map((n) => n.replace(/'/g, '')));
      }
    }
  }

  // ── Inputs ──
  let m;

  // input<Type>(default)
  INPUT_RE.lastIndex = 0;
  while ((m = INPUT_RE.exec(source)) !== null) {
    const [, name, type, defaultRaw] = m;
    if (isProtected(source, m.index)) continue;
    result.inputs.push({
      name,
      type: cleanType(type),
      default: extractDefault(defaultRaw),
      required: false,
      isBoolean: isBooleanInput(defaultRaw),
      jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
    });
  }

  // input(default) — bare (no generic, inferred boolean)
  INPUT_BARE_RE.lastIndex = 0;
  while ((m = INPUT_BARE_RE.exec(source)) !== null) {
    const [, name, defaultRaw] = m;
    if (isProtected(source, m.index)) continue;
    // Skip if already captured by INPUT_RE (input<Type> also matches input()
    // since the generic is optional; avoid duplicates)
    if (result.inputs.some((i) => i.name === name)) continue;
    result.inputs.push({
      name,
      type: isBooleanInput(defaultRaw) ? 'boolean' : inferType(defaultRaw),
      default: extractDefault(defaultRaw),
      required: false,
      isBoolean: isBooleanInput(defaultRaw),
      jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
    });
  }

  // input.required<Type>()
  INPUT_REQUIRED_RE.lastIndex = 0;
  while ((m = INPUT_REQUIRED_RE.exec(source)) !== null) {
    const [, name, type] = m;
    if (isProtected(source, m.index)) continue;
    result.inputs.push({
      name,
      type: cleanType(type),
      default: null,
      required: true,
      isBoolean: false,
      jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
    });
  }

  // ── Models ──
  MODEL_RE.lastIndex = 0;
  while ((m = MODEL_RE.exec(source)) !== null) {
    const [, name, type, defaultRaw] = m;
    result.models.push({
      name,
      type: cleanType(type),
      default: extractDefault(defaultRaw),
      jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
    });
  }

  MODEL_BARE_RE.lastIndex = 0;
  while ((m = MODEL_BARE_RE.exec(source)) !== null) {
    const [, name, defaultRaw] = m;
    if (result.models.some((mod) => mod.name === name)) continue;
    result.models.push({
      name,
      type: inferType(defaultRaw),
      default: extractDefault(defaultRaw),
      jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
    });
  }

  // ── Outputs ──
  OUTPUT_RE.lastIndex = 0;
  while ((m = OUTPUT_RE.exec(source)) !== null) {
    const [, name, type] = m;
    if (isProtected(source, m.index)) continue;
    result.outputs.push({
      name,
      type: cleanType(type) || 'void',
      jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
    });
  }

  OUTPUT_VOID_RE.lastIndex = 0;
  while ((m = OUTPUT_VOID_RE.exec(source)) !== null) {
    const [, name] = m;
    if (isProtected(source, m.index)) continue;
    if (!result.outputs.some((o) => o.name === name)) {
      result.outputs.push({
        name,
        type: 'void',
        jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
      });
    }
  }

  // ── Types ──
  TYPE_ALIAS_RE.lastIndex = 0;
  while ((m = TYPE_ALIAS_RE.exec(source)) !== null) {
    const [, name, value] = m;
    result.types.push({
      name,
      value: value.trim(),
      jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
    });
  }

  // ── Interfaces ──
  INTERFACE_RE.lastIndex = 0;
  while ((m = INTERFACE_RE.exec(source)) !== null) {
    const [, name, body] = m;
    result.interfaces.push({
      name,
      body: body.trim(),
      jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
    });
  }

  // ── Service public methods ──
  if (result.kind === 'service') {
    // Find the class body to avoid matching functions outside the class
    const classBodyMatch = source.match(/export\s+class\s+\w+[^{]*\{/);
    const classStart = classBodyMatch
      ? classBodyMatch.index + classBodyMatch[0].length
      : 0;

    PUBLIC_METHOD_RE.lastIndex = classStart;
    while ((m = PUBLIC_METHOD_RE.exec(source)) !== null) {
      const [, name, params, returnType] = m;
      // Skip Angular lifecycle hooks, constructor, and private/protected
      if (name.startsWith('ng') || name === 'constructor') continue;
      if (isProtected(source, m.index)) continue;
      result.publicMethods.push({
        name,
        params: params.trim(),
        returnType: returnType.trim(),
        jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIndex, source, m.index)),
      });
    }
  }

  return result;
}

/**
 * Parse an HTML template for ng-content slots.
 */
export function parseTemplate(filePath) {
  if (!existsSync(filePath)) return { slots: [] };
  const source = readFileSync(filePath, 'utf-8');
  return parseTemplateSource(source);
}

/**
 * Parse an HTML template string for ng-content slots.
 */
export function parseTemplateSource(source) {
  const slots = [];
  let m;
  NG_CONTENT_RE.lastIndex = 0;
  while ((m = NG_CONTENT_RE.exec(source)) !== null) {
    slots.push(m[1] || '(default)');
  }
  return { slots };
}

/**
 * Parse a CSS file for custom properties.
 */
export function parseCss(filePath) {
  if (!existsSync(filePath)) return { customProperties: [], cssClasses: [] };
  const source = readFileSync(filePath, 'utf-8');
  return parseCssSource(source);
}

/**
 * Parse CSS source for custom properties and CSS classes.
 */
export function parseCssSource(source) {
  const propSet = new Map();
  let m;
  CSS_VAR_RE.lastIndex = 0;
  while ((m = CSS_VAR_RE.exec(source)) !== null) {
    const name = `--coar-${m[1]}`;
    const fallback = m[2]?.trim() || null;
    if (!propSet.has(name)) {
      propSet.set(name, fallback);
    }
  }

  const cssClasses = [];
  CSS_CLASS_RE.lastIndex = 0;
  while ((m = CSS_CLASS_RE.exec(source)) !== null) {
    if (!cssClasses.includes(m[1])) {
      cssClasses.push(m[1]);
    }
  }

  return {
    customProperties: [...propSet.entries()].map(([name, fallback]) => ({ name, fallback })),
    cssClasses,
  };
}

/**
 * Parse all files for a component registry entry.
 * Returns a unified component documentation object.
 */
export function parseEntry(entry) {
  const doc = {
    name: entry.name,
    category: entry.category,
    isCssOnly: entry.isCssOnly || false,
    isUtilityGroup: entry.isUtilityGroup || false,
    items: [],
    types: [],
    interfaces: [],
    utilities: [],
  };

  const tsFiles = entry.files.filter(
    (f) => f.kind === 'component' || f.kind === 'directive' || f.kind === 'service' || f.kind === 'typescript'
  );
  const typeFiles = entry.files.filter((f) => f.kind === 'types');
  const cssFiles = entry.files.filter((f) => f.kind === 'css');

  // Parse type files
  for (const tf of typeFiles) {
    const parsed = parseTypeScript(tf.path);
    doc.types.push(...parsed.types);
    doc.interfaces.push(...parsed.interfaces);
  }

  // Parse CSS-only entries
  if (entry.isCssOnly) {
    for (const cf of cssFiles) {
      const cssData = parseCss(cf.path);
      doc.items.push({
        kind: 'css-only',
        selector: null,
        className: null,
        jsdoc: null,
        inputs: [],
        models: [],
        outputs: [],
        slots: [],
        customProperties: cssData.customProperties,
        cssClasses: cssData.cssClasses,
        isCva: false,
        publicMethods: [],
        hostDirectiveInputs: [],
      });
    }
    return doc;
  }

  // Parse utility groups
  if (entry.isUtilityGroup) {
    for (const f of entry.files) {
      const source = readFileSync(f.path, 'utf-8');
      const jsdocIdx = buildJsdocIndex(source);
      const parsed = parseTypeScript(f.path);
      doc.types.push(...parsed.types);
      doc.interfaces.push(...parsed.interfaces);

      const funcRe =
        /export\s+function\s+(\w+)\s*(?:<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^\s{]+))?/g;
      let fm;
      while ((fm = funcRe.exec(source)) !== null) {
        doc.utilities.push({
          name: fm[1],
          params: fm[2].trim(),
          returnType: fm[3]?.trim() || 'void',
          jsdoc: cleanJsdoc(findPrecedingJsdoc(jsdocIdx, source, fm.index)),
        });
      }
    }
    return doc;
  }

  // Parse each TS file (component/directive/service)
  for (const tf of tsFiles) {
    const parsed = parseTypeScript(tf.path);
    if (!parsed.kind) {
      doc.types.push(...parsed.types);
      doc.interfaces.push(...parsed.interfaces);
      continue;
    }

    doc.types.push(...parsed.types);
    doc.interfaces.push(...parsed.interfaces);

    // Resolve template
    let slots = [];
    if (parsed.templateUrl) {
      const templatePath = join(dirname(tf.path), parsed.templateUrl);
      const templateData = parseTemplate(templatePath);
      slots = templateData.slots;
    } else if (parsed.inlineTemplate) {
      const templateData = parseTemplateSource(parsed.inlineTemplate);
      slots = templateData.slots;
    }

    // Resolve CSS
    let customProperties = [];
    if (parsed.styleUrl) {
      const cssPath = join(dirname(tf.path), parsed.styleUrl);
      const cssData = parseCss(cssPath);
      customProperties = cssData.customProperties;
    }

    doc.items.push({
      kind: parsed.kind,
      selector: parsed.selector,
      exportAs: parsed.exportAs,
      className: parsed.className,
      jsdoc: parsed.classJsdoc,
      inputs: parsed.inputs,
      models: parsed.models,
      outputs: parsed.outputs,
      slots,
      customProperties,
      isCva: parsed.isCva,
      isInjectable: parsed.isInjectable,
      publicMethods: parsed.publicMethods,
      hostDirectiveInputs: parsed.hostDirectiveInputs,
    });
  }

  // Also parse standalone CSS files not associated with a specific component
  for (const cf of cssFiles) {
    const alreadyParsed = doc.items.some(
      (item) => item.customProperties && item.customProperties.length > 0
    );
    if (!alreadyParsed) {
      const cssData = parseCss(cf.path);
      if (doc.items.length > 0 && doc.items[0].customProperties.length === 0) {
        doc.items[0].customProperties = cssData.customProperties;
      }
    }
  }

  return doc;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function cleanJsdoc(raw) {
  if (!raw) return null;
  // Strip leading `* ` from each line (JSDoc formatting)
  let cleaned = raw.replace(/^\s*\*\s?/gm, '');
  // Remove @example blocks and everything after them (code samples)
  cleaned = cleaned.replace(/@example[\s\S]*$/, '');
  // Remove other @tags (single line)
  cleaned = cleaned.replace(/@\w+.*$/gm, '');
  return cleaned.trim() || null;
}

function cleanType(type) {
  // Remove the second generic param (transform type): `boolean, unknown` → `boolean`
  return type.split(',')[0].trim();
}

function extractDefault(raw) {
  if (!raw) return null;
  const defaultVal = raw.split(/,\s*\{/)[0].trim();
  if (!defaultVal) return null;
  return defaultVal;
}

function isBooleanInput(defaultRaw) {
  return /booleanAttribute/.test(defaultRaw);
}

function inferType(defaultRaw) {
  const val = extractDefault(defaultRaw);
  if (val === 'true' || val === 'false') return 'boolean';
  if (val === 'null') return 'unknown';
  if (/^\d+$/.test(val)) return 'number';
  if (/^'[^']*'$/.test(val)) return 'string';
  return 'unknown';
}

/**
 * Check if the match position is preceded by `protected` or `private`.
 */
function isProtected(source, index) {
  const before = source.slice(Math.max(0, index - 40), index);
  return /(?:protected|private)\s+(?:readonly\s+)?$/.test(before);
}
