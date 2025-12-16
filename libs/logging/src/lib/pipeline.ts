import { PipelineStage } from './interfaces/pipeline-stage';
import { LogEvent } from './models/log-event';
import { SinkStage } from './stages/sink-stage';

export class Pipeline {
  private stages: PipelineStage[] = [];

  public constructor(stages: PipelineStage[]) {
    this.stages = stages;
  }

  // Returns void for fire-and-forget, Promise<void> if any sink is async
  public emit(event: LogEvent | LogEvent[]): void | Promise<void> {
    if (!Array.isArray(event)) {
      event = [event];
    }

    let processedEvents = event;
    const asyncResults: Promise<void>[] = [];

    for (const stage of this.stages) {
      processedEvents = stage.process(processedEvents);

      if (processedEvents.length === 0) {
        break;
      }

      if (stage instanceof SinkStage) {
        const emitResult = stage.getLastEmitResult();
        if (emitResult instanceof Promise) {
          asyncResults.push(
            emitResult.catch((error) => {
              console.error('Sink error:', error);
            })
          );
        }
      }
    }

    // If any sink is async, return aggregated promise
    // Caller can choose to await or fire-and-forget
    if (asyncResults.length > 0) {
      return Promise.all(asyncResults).then(() => void 0);
    }
  }

  public flush(): Promise<void> {
    const flushPromises = this.stages
      .filter((stage) => stage instanceof SinkStage)
      .map((stage) => (stage as SinkStage).flush())
      .filter((p) => p);

    if (flushPromises.length === 0) {
      return Promise.resolve();
    }

    return Promise.all(flushPromises).then(() => void 0);
  }
}
