import { LogEvent } from '../models/log-event';

export interface Sink {
  // Supports both sync (fire-and-forget) and async (awaitable) patterns
// Return void for immediate synchronous processing (ConsoleSink)
// Return Promise<void> for async operations that should be awaited (AuditSink, HttpSink)
  emit(events: LogEvent[]): void | Promise<void>;
  flush?(): Promise<void>;
}
