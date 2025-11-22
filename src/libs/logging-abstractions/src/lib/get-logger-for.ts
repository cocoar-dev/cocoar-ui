/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from './logger.interface';
import { getLogger } from './global-registry';

/**
 * Get a logger with source context extracted from class, instance, or string.
 * 
 * This is a convenience method that accepts:
 * - String: Used as-is
 * - Class constructor: Extracts class name
 * - Class instance: Extracts class name from constructor
 * - Plain object: Extracts "Object" (not useful, but won't crash)
 * 
 * @param source - String, class constructor, or instance to extract source name from
 * @returns Logger instance enriched with source context
 * 
 * @example String source:
 * ```typescript
 * const logger = getLoggerFor('MyModule');
 * ```
 * 
 * @example Class source:
 * ```typescript
 * class MyService {}
 * const logger = getLoggerFor(MyService);  // source: 'MyService'
 * ```
 * 
 * @example Instance source:
 * ```typescript
 * class MyComponent {
 *   private logger = getLoggerFor(this);  // source: 'MyComponent'
 * }
 * ```
 */
export function getLoggerFor<T>(source: string | (new (...args: any[]) => T) | T): ILogger {
  let name: string;
  
  if (typeof source === 'string') {
    // Direct string - use as-is (preserve underscores, special chars, etc.)
    name = source;
  } else if (typeof source === 'function') {
    // Class constructor - strip TypeScript/Angular compilation artifact
    name = source.name;
    if (name.startsWith('_')) {
      name = name.slice(1);
    }
  } else if (source && typeof source === 'object') {
    // Instance or plain object - get constructor name and strip underscore
    name = source.constructor.name;
    if (name.startsWith('_')) {
      name = name.slice(1);
    }
  } else {
    // Fallback for primitives/null/undefined (shouldn't happen in normal usage)
    name = 'Unknown';
  }
  
  return getLogger(name);
}
