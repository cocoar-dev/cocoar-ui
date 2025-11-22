import { isEnabled } from '../helper-functions';
import { Sink } from '../interfaces/sink';
import { LogEvent } from '../models/log-event';
import { LogEventLevel } from '../models/log-event-level';

export interface ConsoleSinkOptions {
  includeTimestamps?: boolean;
  restrictedToMinimumLevel?: LogEventLevel;
  includeProperties?: boolean;
  useGroups?: boolean;
}

export class ConsoleSink implements Sink {
  public constructor(private options: ConsoleSinkOptions = {}) {}

  public emit(events: LogEvent[]) {
    for (let i = 0; i < events.length; ++i) {
      const e = events[i];
      if (!isEnabled(this.options.restrictedToMinimumLevel, e.level)) continue;

      switch (e.level) {
        case LogEventLevel.fatal:
          this.writeToConsole(console.error, 'Fatal', e);
          break;

        case LogEventLevel.error:
          this.writeToConsole(console.error, 'Error', e);
          break;

        case LogEventLevel.warn:
          this.writeToConsole(console.warn, 'Warning', e);
          break;

        case LogEventLevel.info:
          this.writeToConsole(console.info, 'Information', e);
          break;

        case LogEventLevel.debug:
          this.writeToConsole(console.debug, 'Debug', e);
          break;

        case LogEventLevel.verbose:
          this.writeToConsole(console.debug, 'Verbose', e);
          break;
      }
    }
  }

  public flush() {
    return Promise.resolve();
  }

  private isEmptyObject(obj: object): boolean {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  private writeToConsole(logMethod: Function, prefix: string, e: LogEvent) {
    let output = `>>%c[${prefix}]`;
    const source = e.enrichedProperties['source'];
    if (source) {
      output = `${output}:${source}`;
    }

    output = `${output}%c ${e.message.render(e.properties, e.enrichedProperties)}`;
    if (this.options.includeTimestamps) {
      output = `${e.timestamp} ${output}`;
    }
    const values = [];
    if (this.options.includeProperties && !this.isEmptyObject(e.properties)) {
      values.push(e.properties);
    }
    if (e.error instanceof Error) {
      values.push(e.error);
    }
    if (e.unboundProperties) {
      values.push(...e.unboundProperties);
    }

    if (this.options.useGroups && values.length > 0) {
      console.groupCollapsed(output, this.colorPrefix(prefix), '');
      for (const value of values) {
        logMethod(value);
      }
      console.groupEnd();
    } else {
      logMethod(output, this.colorPrefix(prefix), '', ...values);
    }
  }

  private colorPrefix(prefix: string) {
    switch (prefix) {
      case 'Fatal': {
        return 'background:#8b0000;color:white;font-weight:bold;padding:2px 6px;border-radius:3px';
      }
      case 'Error': {
        return 'color:#ff0000;font-weight:bold';
      }
      case 'Warning': {
        return 'color:#ff8800;font-weight:bold';
      }
      case 'Information': {
        return 'color:#0088ff';
      }
      case 'Debug': {
        return 'color:#888888';
      }
      case 'Verbose': {
        return 'color:#aaaaaa';
      }
    }
    return 'color:black';
  }
}
