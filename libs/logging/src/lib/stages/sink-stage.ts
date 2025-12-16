import { PipelineStage } from '../interfaces/pipeline-stage';
import { Sink } from '../interfaces/sink';
import { LogEvent } from '../models/log-event';

export type SinkPredicate = () => boolean;

export class SinkStage implements PipelineStage {
  private lastEmitResult: void | Promise<void> = undefined;

  public constructor(private sink: Sink, private predicate?: SinkPredicate) {}

  public process(events: LogEvent[]): LogEvent[] {
    if (!this.predicate || this.predicate()) {
      try {
        this.lastEmitResult = this.sink.emit(events);
      } catch (error) {
        console.error('Sink error:', error);
        this.lastEmitResult = undefined;
      }
    } else {
      this.lastEmitResult = undefined;
    }

    return events;
  }

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
