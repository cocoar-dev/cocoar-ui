import { PipelineStage } from '../interfaces/pipeline-stage';
import { LogEvent } from '../models/log-event';

export class FilterStage implements PipelineStage {
  public constructor(private predicate: (event: LogEvent) => boolean) {}

  public process(events: LogEvent[]): LogEvent[] {
    return events.filter(this.predicate);
  }

  public async flush(): Promise<void> {
    return Promise.resolve();
  }
}
