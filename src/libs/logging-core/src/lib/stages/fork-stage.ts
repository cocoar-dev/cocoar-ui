import { PipelineStage } from '../interfaces/pipeline-stage';
import { LoggerConfiguration } from '../logger-configuration';
import { LogEvent } from '../models/log-event';
import { Pipeline } from '../pipeline';

export class ForkStage implements PipelineStage {
  private pipeline: Pipeline;

  public constructor(configureFork: (forkConfig: LoggerConfiguration) => void) {
    const forkConfig = new LoggerConfiguration();
    configureFork(forkConfig);
    // Access public method for pipeline creation
    this.pipeline = forkConfig.createPipelineInstance();
  }

  public process(events: LogEvent[]): LogEvent[] {
    // Emit to forked pipeline (fire-and-forget)
    this.pipeline.emit(events);
    // Pass events through to main pipeline
    return events;
  }

  public flush(): Promise<void> {
    return this.pipeline.flush();
  }
}
