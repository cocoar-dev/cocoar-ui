import { ILogger } from '@cocoar/logging-abstractions';
import { getLogEventLevel } from './helper-functions';
import { WriteLogLevel } from './models/common-types';
import { LogEvent } from './models/log-event';
import { LogEventLevel } from './models/log-event-level';
import { MessageParser } from './models/message-parser';
import { Pipeline } from './pipeline';

export class Logger implements ILogger {
  private dynamicEnrichments: Record<string, any> = {};

  public constructor(
    private pipeline: Pipeline,
    enrichments?: Record<string, any>
  ) {
    if (enrichments) {
      this.dynamicEnrichments = enrichments;
    }
  }

  public enrich(context: Record<string, any>): Logger {
    return new Logger(this.pipeline, { ...this.dynamicEnrichments, ...context });
  }

  public fatal(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public fatal(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public fatal(errorOrMessageTemplate: Error | string, ...properties: any[]): void | Promise<void> {
    if (errorOrMessageTemplate instanceof Error) {
      return this.write(LogEventLevel.fatal, properties[0], properties.slice(1), errorOrMessageTemplate);
    } else {
      return this.write(LogEventLevel.fatal, errorOrMessageTemplate, properties);
    }
  }

  public error(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public error(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public error(errorOrMessageTemplate: Error | string, ...properties: any[]): void | Promise<void> {
    if (errorOrMessageTemplate instanceof Error) {
      return this.write(LogEventLevel.error, properties[0], properties.slice(1), errorOrMessageTemplate);
    } else {
      return this.write(LogEventLevel.error, errorOrMessageTemplate, properties);
    }
  }

  public warn(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public warn(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public warn(errorOrMessageTemplate: Error | string, ...properties: any[]): void | Promise<void> {
    if (errorOrMessageTemplate instanceof Error) {
      return this.write(LogEventLevel.warn, properties[0], properties.slice(1), errorOrMessageTemplate);
    } else {
      return this.write(LogEventLevel.warn, errorOrMessageTemplate, properties);
    }
  }

  public info(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public info(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public info(errorOrMessageTemplate: Error | string, ...properties: any[]): void | Promise<void> {
    if (errorOrMessageTemplate instanceof Error) {
      return this.write(LogEventLevel.info, properties[0], properties.slice(1), errorOrMessageTemplate);
    } else {
      return this.write(LogEventLevel.info, errorOrMessageTemplate, properties);
    }
  }

  public debug(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public debug(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public debug(errorOrMessageTemplate: Error | string, ...properties: any[]): void | Promise<void> {
    if (errorOrMessageTemplate instanceof Error) {
      return this.write(LogEventLevel.debug, properties[0], properties.slice(1), errorOrMessageTemplate);
    } else {
      return this.write(LogEventLevel.debug, errorOrMessageTemplate, properties);
    }
  }

  public verbose(messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public verbose(error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public verbose(errorOrMessageTemplate: Error | string, ...properties: any[]): void | Promise<void> {
    if (errorOrMessageTemplate instanceof Error) {
      return this.write(LogEventLevel.verbose, properties[0], properties.slice(1), errorOrMessageTemplate);
    } else {
      return this.write(LogEventLevel.verbose, errorOrMessageTemplate, properties);
    }
  }

  public log(level: LogEventLevel | WriteLogLevel, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public log(level: LogEventLevel | WriteLogLevel, error: Error, messageTemplate: string, ...properties: any[]): void | Promise<void>;
  public log(level: LogEventLevel | WriteLogLevel, errorOrMessageTemplate: Error | string, ...properties: any[]): void | Promise<void> {
    if (errorOrMessageTemplate instanceof Error) {
      return this.write(level, properties[0], properties.slice(1), errorOrMessageTemplate);
    } else {
      return this.write(level, errorOrMessageTemplate, properties);
    }
  }

  public flush(): Promise<any> {
    return this.pipeline.flush();
  }

  private write(level: LogEventLevel | WriteLogLevel, rawMessageTemplate: string, unboundProperties: any[], error?: Error): void | Promise<void> {
    const messageTemplate = new MessageParser(rawMessageTemplate);
    const properties = messageTemplate.bindProperties(...unboundProperties);

    const logEvent = new LogEvent(
      new Date().toISOString(),
      getLogEventLevel(level),
      messageTemplate,
      { ...this.dynamicEnrichments, ...properties.boundProperties },
      properties.unboundProperties,
      {},
      error
    );
    return this.pipeline.emit([logEvent]);
  }
}
