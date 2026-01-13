/**
 * Interpolates {placeholders} in a template string using the given params.
 *
 * This is the official Cocoar placeholder syntax for i18n strings.
 * Placeholders use curly braces: {name}, {count}, etc.
 *
 * @param template - The template string containing {placeholder} patterns
 * @param params - Optional key-value pairs for interpolation
 * @returns The interpolated string
 *
 * @example
 * ```ts
 * coarInterpolate("Hello {name}, you have {count} items.", { name: 'Alice', count: 3 })
 * // => "Hello Alice, you have 3 items."
 * ```
 */
export function coarInterpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value == null ? '' : String(value);
  });
}
