/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogEventLevel } from './log-event-level';
import { MessageParser } from './message-parser';

export class LogEvent {
  public constructor(
    public timestamp: string,
    public level: LogEventLevel,
    public message: MessageParser,
    public properties: Record<string, any>,
    public unboundProperties: Array<any>,
    public enrichedProperties: Record<string, any>,
    public error: Error | null = null
  ) {}
}
