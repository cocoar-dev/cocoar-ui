import { LogEvent } from '../models/log-event';

export interface PipelineStage {
  // Synchronously transform log events (filter, enrich, etc.)
  // Return transformed array (can be empty if all filtered out)
  process(events: LogEvent[]): LogEvent[];
  flush(): Promise<void>;
}
