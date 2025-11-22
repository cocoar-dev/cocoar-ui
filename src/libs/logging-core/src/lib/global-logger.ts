import { Logger } from './logger';
import { LoggerConfiguration } from './logger-configuration';
import { ConsoleSink } from './sinks/console-sink';

// Using Symbol.for() instead of regular Symbol to enable cross-package singleton
// Multiple packages can load different versions of this library but still share the same logger instance
const GLOBAL_LOGGER_SYMBOL = Symbol.for('@cocoar/logging-core:global-logger');

interface GlobalLoggerState {
  logger?: Logger;
  configuration?: LoggerConfiguration;
}

declare global {
  interface GlobalThis {
    [key: symbol]: GlobalLoggerState | undefined;
  }
}

function getGlobalState(): GlobalLoggerState {
  const global = globalThis as Record<symbol, GlobalLoggerState | undefined>;
  if (!global[GLOBAL_LOGGER_SYMBOL]) {
    global[GLOBAL_LOGGER_SYMBOL] = {};
  }
  return global[GLOBAL_LOGGER_SYMBOL] as GlobalLoggerState;
}

/**
 * Configure the global logger instance.
 * This should be called once at application startup.
 * All packages using @cocoar/logging-core will share this configuration.
 * 
 * @example
 * ```typescript
 * import { configureGlobalLogger } from '@cocoar/logging-core';
 * 
 * configureGlobalLogger((config) => 
 *   config
 *     .minLevel('debug')
 *     .writeTo(new ConsoleSink({ includeProperties: true }))
 * );
 * ```
 */
export function configureGlobalLogger(
  configure: (config: LoggerConfiguration) => LoggerConfiguration
): Logger {
  const state = getGlobalState();
  const config = configure(new LoggerConfiguration());
  state.configuration = config;
  state.logger = config.create();
  return state.logger;
}

/**
 * Get the global logger instance.
 * If not configured, returns a default logger with console sink.
 * 
 * @param source - Optional source context (component name, class name, etc.)
 * @returns Logger instance, optionally enriched with source context
 * 
 * @example
 * ```typescript
 * import { getLogger } from '@cocoar/logging-core';
 * 
 * const logger = getLogger('MyComponent');
 * logger.info('Component initialized');
 * ```
 */
export function getLogger(source?: string): Logger {
  const state = getGlobalState();
  
  if (!state.logger) {
    // Lazy initialization ensures logger works even without explicit configuration
    // Default to 'info' level to avoid verbose noise in production
    state.logger = new LoggerConfiguration()
      .minLevel('info')
      .writeTo(new ConsoleSink({ includeProperties: true }))
      .create();
  }
  
  if (source) {
    return state.logger.enrich({ source });
  }
  
  return state.logger;
}

/**
 * Get a logger enriched with the source context from a class.
 * Automatically extracts the class name.
 * 
 * @param sourceClass - The class to use as source context
 * @returns Logger instance enriched with source class name
 * 
 * @example
 * ```typescript
 * import { getLoggerFor } from '@cocoar/logging-core';
 * 
 * class MyService {
 *   private logger = getLoggerFor(MyService);
 *   
 *   doWork() {
 *     this.logger.debug('Working...');
 *   }
 * }
 * ```
 */
export function getLoggerFor<T>(sourceClass: new (...args: unknown[]) => T): Logger {
  let sourceName = sourceClass.name;
  
  // TypeScript/Angular compiler sometimes prefixes class names with underscore
  // Strip it to get clean class name for logging context
  if (sourceName.startsWith('_')) {
    sourceName = sourceName.slice(1);
  }
  
  return getLogger(sourceName);
}

/**
 * Reset the global logger (mainly for testing purposes).
 * ⚠️ Use with caution - this affects all packages using the logger.
 */
export function resetGlobalLogger(): void {
  const state = getGlobalState();
  state.logger = undefined;
  state.configuration = undefined;
}
