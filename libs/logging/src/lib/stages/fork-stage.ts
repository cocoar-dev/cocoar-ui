import { PipelineStage } from '../interfaces/pipeline-stage';
import { LoggerConfiguration } from '../logger-configuration';
import { LogEvent } from '../models/log-event';
import { Pipeline } from '../pipeline';

export class ForkStage implements PipelineStage {
  private pipeline: Pipeline;

  public constructor(configureFork: (forkConfig: LoggerConfiguration) => void) {
    const forkConfig = new LoggerConfiguration();
    configureFork(forkConfig);
    this.pipeline = forkConfig.createPipelineInstance();
  }

  public process(events: LogEvent[]): LogEvent[] {
    this.pipeline.emit(events);
    return events;
  }

  public flush(): Promise<void> {
    return this.pipeline.flush();
  }
}
