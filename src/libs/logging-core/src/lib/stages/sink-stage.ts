import { PipelineStage } from '../interfaces/pipeline-stage';
import { Sink } from '../interfaces/sink';
import { LogEvent } from '../models/log-event';

export type SinkPredicate = () => boolean;

// SinkStage wraps a sink as a pipeline stage
// Emits events to the sink AND passes them through unchanged
// This allows interleaving sinks with other stages in configuration order
export class SinkStage implements PipelineStage {
  private lastEmitResult: void | Promise<void> = undefined;
  
  public constructor(
    private sink: Sink,
    private predicate?: SinkPredicate
  ) {}

  public process(events: LogEvent[]): LogEvent[] {
    // Emit to sink if predicate allows (or no predicate)
    if (!this.predicate || this.predicate()) {
      try {
        this.lastEmitResult = this.sink.emit(events);
      } catch (error) {
        // Synchronous sink error - log but don't throw
        console.error('Sink error:', error);
        this.lastEmitResult = undefined;
      }
    } else {
      this.lastEmitResult = undefined;
    }
    
    // Pass events through unchanged for next stages/sinks
    return events;
  }

  // Pipeline uses this to collect async results
  public getLastEmitResult(): void | Promise<void> {
    return this.lastEmitResult;
  }

  public getSink(): Sink {
    return this.sink;
  }

  public getPredicate(): SinkPredicate | undefined {
    return this.predicate;
  }

  public flush(): Promise<void> {
    return this.sink.flush ? this.sink.flush() : Promise.resolve();
  }
}
