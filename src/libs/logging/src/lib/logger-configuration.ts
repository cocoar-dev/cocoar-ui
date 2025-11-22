import { getLogEventLevel, isEnabled } from './helper-functions';
import { PipelineStage } from './interfaces/pipeline-stage';
import { Sink } from './interfaces/sink';
import { Logger } from './logger';
import { ObjectFactory, WriteLogLevel } from './models/common-types';
import { LogEvent } from './models/log-event';
import { LogEventLevel } from './models/log-event-level';
import { Pipeline } from './pipeline';
import { EnrichStage } from './stages/enrich-stage';
import { FilterStage } from './stages/filter-stage';
import { ForkStage } from './stages/fork-stage';
import { SinkStage, SinkPredicate } from './stages/sink-stage';

export type LevelProvider = () => LogEventLevel | WriteLogLevel;

export class LoggerConfiguration {
  private pipeline: PipelineStage[] = [];
  private pipelineInstance?: Pipeline;

  /**
   * Write log events to a sink.
   * 
   * Sinks are processed in configuration order, receiving events
   * after all preceding stages have been applied.
   * 
   * @param sink - The sink to write to
   * @param predicate - Optional function that controls whether the sink is active
   *                    Evaluated at runtime for each log event batch
   *                    Return true to write to sink, false to skip
   * 
   * @example
   * ```typescript
   * let consoleEnabled = true;
   * 
   * const logger = new LoggerConfiguration()
   *   .writeTo(new ConsoleSink(), () => consoleEnabled)
   *   .create();
   * 
   * // Later: disable console logging
   * consoleEnabled = false;
   * ```
   */
  public writeTo(sink: Sink, predicate?: SinkPredicate): LoggerConfiguration {
    this.pipeline.push(new SinkStage(sink, predicate));
    return this;
  }

  /**
   * Filter log events by minimum level.
   * 
   * @param levelOrSwitch - Static level or function that returns level at runtime
   * 
   * @example Static level:
   * ```typescript
   * config.minLevel('debug')
   * ```
   * 
   * @example Dynamic level:
   * ```typescript
   * let currentLevel: WriteLogLevel = 'info';
   * 
   * config.minLevel(() => currentLevel)
   * 
   * // Later: change level at runtime
   * currentLevel = 'debug';
   * ```
   */
  public minLevel(levelOrSwitch: LogEventLevel | WriteLogLevel | LevelProvider): LoggerConfiguration {
    if (typeof levelOrSwitch === 'function') {
      return this.filter((e) => {
        const level = getLogEventLevel(levelOrSwitch());
        return isEnabled(level, e.level);
      });
    } else {
      const level = getLogEventLevel(levelOrSwitch);
      return this.filter((e) => isEnabled(level, e.level));
    }
  }

  public filter(predicate: (e: LogEvent) => boolean): LoggerConfiguration {
    this.pipeline.push(new FilterStage(predicate));
    return this;
  }

  public enrich(enricher: object | ObjectFactory): LoggerConfiguration {
    this.pipeline.push(new EnrichStage(enricher));
    return this;
  }

  public fork(configureFork: (forkConfig: Omit<LoggerConfiguration, 'create'>) => void): LoggerConfiguration {
    this.pipeline.push(new ForkStage(configureFork));
    return this;
  }

  // Helper method for ForkStage to access pipeline creation
  public createPipelineInstance(): Pipeline {
    return new Pipeline(this.pipeline);
  }

  public create(): Logger {
    if (!this.pipelineInstance) {
      this.pipelineInstance = this.createPipelineInstance();
    }
    return new Logger(this.pipelineInstance);
  }
}
