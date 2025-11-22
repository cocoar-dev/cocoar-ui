import { PipelineStage } from '../interfaces/pipeline-stage';
import { ObjectFactory } from '../models/common-types';
import { LogEvent } from '../models/log-event';

// Simple deep clone implementation for logging purposes
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }
  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone((obj as any)[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

export class EnrichStage implements PipelineStage {
  public constructor(private enricher: object | ObjectFactory) {}

  public process(events: LogEvent[]): LogEvent[] {
    // Create new LogEvent instances with enriched properties
    // This prevents mutation from affecting upstream sinks
    return events.map((event) => {
      const enrichedProps =
        this.enricher instanceof Function ? this.enricher(deepClone(event.properties)) : this.enricher;
      
      // Merge existing enriched properties with new ones
      const mergedEnriched = { ...event.enrichedProperties, ...enrichedProps };
      
      // Create new LogEvent with merged enrichment
      return new LogEvent(
        event.timestamp,
        event.level,
        event.message,
        event.properties,
        event.unboundProperties,
        mergedEnriched,
        event.error
      );
    });
  }

  public async flush(): Promise<void> {
    return Promise.resolve();
  }
}
