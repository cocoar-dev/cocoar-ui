import { WriteLogLevel } from './models/common-types';
import { LogEventLevel } from './models/log-event-level';

export function getLogEventLevel(input: LogEventLevel | WriteLogLevel | 'off'): LogEventLevel {
  if (typeof input === 'string') {
    const foundLevel = LogEventLevel[input as keyof typeof LogEventLevel];
    if (!foundLevel) {
      throw new Error('no matching LogLevel found!');
    }
    return foundLevel;
  }
  return input;
}

export function getLogEventLevelNames(value: number): WriteLogLevel {
  for (const level in LogEventLevel) {
    const numericValue = Number(LogEventLevel[level as keyof typeof LogEventLevel]);
    if (!isNaN(numericValue) && value === numericValue) {
      return level as WriteLogLevel;
    }
  }
  throw new Error(`no matching LogLevelName found!`);
}

export function isEnabled(level: LogEventLevel | undefined, target: LogEventLevel): boolean {
  return !level || (level & target) === target;
}
