/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from './logger.interface';
import { NullLogger } from './null-logger';

// Cross-package singleton using Symbol.for()
const LOGGER_REGISTRY_SYMBOL = Symbol.for('@cocoar/logging:registry');

interface LoggerRegistry {
  logger?: ILogger;
  enrichments?: Map<string, Record<string, any>>;
}

declare global {
  interface GlobalThis {
    [key: symbol]: LoggerRegistry | undefined;
  }
}

function getRegistry(): LoggerRegistry {
  const global = globalThis as Record<symbol, LoggerRegistry | undefined>;
  if (!global[LOGGER_REGISTRY_SYMBOL]) {
    global[LOGGER_REGISTRY_SYMBOL] = {
      enrichments: new Map(),
    };
  }
  return global[LOGGER_REGISTRY_SYMBOL] as LoggerRegistry;
}

/**
 * Get the configured logger or NullLogger if none configured.
 *
 * Libraries should use this to get a logger instance.
 * If the application hasn't configured logging, returns NullLogger (no-op).
 *
 * @param source - Optional source context (component name, module name)
 * @returns Configured logger or NullLogger
 *
 * @example Library usage:
 * ```typescript
 * import { getLogger } from '@cocoar/logging-abstractions';
 *
 * export class MyLibraryClass {
 *   private logger = getLogger('MyLibraryClass');
 *
 *   doWork() {
 *     this.logger.debug('Working...');
 *   }
 * }
 * ```
 */
export function getLogger(source?: string): ILogger {
  const registry = getRegistry();

  if (!registry.logger) {
    // No logger configured - return no-op logger
    return new NullLogger();
  }

  if (source) {
    // Check if we have cached enriched logger for this source
    const enrichments = registry.enrichments;
    if (enrichments && !enrichments.has(source)) {
      enrichments.set(source, registry.logger.enrich({ source }));
    }
    return (enrichments?.get(source) ?? registry.logger.enrich({ source })) as ILogger;
  }

  return registry.logger;
}

/**
 * Register a logger implementation (used by applications/@cocoar/logging).
 * Libraries should NEVER call this - only applications.
 *
 * @internal
 */
export function registerLogger(logger: ILogger): void {
  const registry = getRegistry();
  registry.logger = logger;
  registry.enrichments?.clear();
}

/**
 * Check if a logger is configured.
 *
 * @returns true if logger is configured, false if using NullLogger
 */
export function hasLogger(): boolean {
  const registry = getRegistry();
  return !!registry.logger;
}

/**
 * Reset logger registry (for testing only).
 *
 * @internal
 */
export function resetLogger(): void {
  const registry = getRegistry();
  registry.logger = undefined;
  registry.enrichments?.clear();
}
