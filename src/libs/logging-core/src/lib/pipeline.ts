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

    // Process through stages (filter, enrich, sinks, etc.) in configuration order
    // Each stage transforms events and/or emits to sinks
    let processedEvents = event;
    const asyncResults: Promise<void>[] = [];
    
    for (const stage of this.stages) {
      const stageName = stage.constructor.name;
      const beforeCount = processedEvents.length;
      
      processedEvents = stage.process(processedEvents);
      
      const afterCount = processedEvents.length;
      // console.log(`${stageName}: ${beforeCount} events in, ${afterCount} events out`);
      
      if (processedEvents.length === 0) {
        // All events filtered out, nothing more to process
        break;
      }
      
      // If this is a sink stage, collect any async emission
      if (stage instanceof SinkStage) {
        const emitResult = stage.getLastEmitResult();
        if (emitResult instanceof Promise) {
          asyncResults.push(
            emitResult.catch((error) => {
              // Log sink errors to console as fallback
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
    
    // All sinks were synchronous - return void
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
