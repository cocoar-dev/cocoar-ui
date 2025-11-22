/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger, LogProperties } from './logger.interface';

/**
 * No-op logger implementation.
 * Used when no logger is configured in the application.
 * All methods do nothing - safe for libraries to call without checking.
 */
export class NullLogger implements ILogger {
  fatal(_errorOrMessageTemplate: Error | string, ..._properties: any[]): void {}
  error(_errorOrMessageTemplate: Error | string, ..._properties: any[]): void {}
  warn(_errorOrMessageTemplate: Error | string, ..._properties: any[]): void {}
  info(_errorOrMessageTemplate: Error | string, ..._properties: any[]): void {}
  debug(_errorOrMessageTemplate: Error | string, ..._properties: any[]): void {}
  verbose(_errorOrMessageTemplate: Error | string, ..._properties: any[]): void {}
  
  enrich(_properties: LogProperties): ILogger {
    return this;
  }
}
