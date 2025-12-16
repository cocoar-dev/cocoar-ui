import { LogEvent } from '../models/log-event';

export interface PipelineStage {
  process(events: LogEvent[]): LogEvent[];
  flush(): Promise<void>;
}
