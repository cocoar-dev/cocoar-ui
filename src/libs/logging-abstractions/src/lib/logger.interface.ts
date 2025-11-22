/* eslint-disable @typescript-eslint/no-explicit-any */

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'verbose';

export type LogProperties = Record<string, any>;

/**
 * Logger interface for libraries to depend on.
 * Libraries should ONLY import from @cocoar/logging-abstractions.
 */
export interface ILogger {
  fatal(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  fatal(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  
  error(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  error(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  
  warn(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  warn(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  
  info(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  info(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  
  debug(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  debug(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  
  verbose(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  verbose(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  
  enrich(properties: LogProperties): ILogger;
}
