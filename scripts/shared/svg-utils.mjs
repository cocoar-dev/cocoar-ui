/**
 * SVG Utilities
 * 
 * Common SVG processing functions for build scripts.
 */

/**
 * Normalize SVG content for production use:
 * - Remove XML declaration
 * - Remove comments
 * - Trim whitespace
 * - Minify (remove newlines between tags)
 * 
 * @param {string} svg - Raw SVG content
 * @returns {string} Normalized SVG
 */
export function normalizeSvg(svg) {
  return svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ');
}

/**
 * Validate SVG content for security issues
 * 
 * @param {string} svg - SVG content to validate
 * @param {string} filename - Filename for error messages
 * @throws {Error} If dangerous content found
 */
export function validateSvg(svg, filename) {
  const dangerous = [
    { pattern: /<script/i, name: 'script tags' },
    { pattern: /on\w+=/i, name: 'event handlers' },
    { pattern: /<foreignObject/i, name: 'foreignObject' },
    { pattern: /@import/i, name: 'CSS imports' },
    { pattern: /javascript:/i, name: 'javascript: URIs' },
  ];

  for (const { pattern, name } of dangerous) {
    if (pattern.test(svg)) {
      throw new Error(`⚠️  Dangerous content found in ${filename}: ${name}`);
    }
  }
}

/**
 * Escape SVG content for use in JavaScript template literals
 * 
 * @param {string} svg - SVG content
 * @returns {string} Escaped SVG safe for template literals
 */
export function escapeSvgForJs(svg) {
  return svg
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}
