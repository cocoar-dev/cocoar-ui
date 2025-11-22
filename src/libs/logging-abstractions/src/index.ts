// Public API for libraries
export * from './lib/logger.interface';
export * from './lib/null-logger';
export { getLogger, hasLogger } from './lib/global-registry';
export { getLoggerFor } from './lib/get-logger-for';

// Internal API (should not be used by libraries, only by logging implementations)
export { registerLogger, resetLogger } from './lib/global-registry';
