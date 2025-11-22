/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLogEventLevelNames } from '../helper-functions';
import { Sink } from '../interfaces/sink';
import { WriteLogLevel } from '../models/common-types';
import { LogEvent } from '../models/log-event';

export interface LoggingEvent {
  timestamp: string;
  level: WriteLogLevel;
  message: string;
  properties: Record<string, any>;
  enrichedProperties: Record<string, any>;
  error: Error | null;
}

type Subscriber = (event: LoggingEvent) => void;

// Callback-based Observable-like sink for reactive consumption
// Provides subscribe() method for API compatibility with previous RxJS version
export class ObservableSink implements Sink {
  private subscribers: Subscriber[] = [];

  public constructor() {}

  public subscribe(subscriber: Subscriber): () => void {
    this.subscribers.push(subscriber);
    
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  public emit(events: LogEvent[]): void {
    events.forEach((event) => {
      const loggingEvent: LoggingEvent = {
        level: getLogEventLevelNames(event.level),
        message: event.message.render(event.properties, event.enrichedProperties),
        properties: event.properties,
        enrichedProperties: event.enrichedProperties,
        timestamp: event.timestamp,
        error: event.error,
      };
      
      for (const subscriber of this.subscribers) {
        try {
          subscriber(loggingEvent);
        } catch (error) {
          console.error('ObservableSink subscriber error:', error);
        }
      }
    });
  }

  /* istanbul ignore next */
  public flush(): Promise<void> {
    return Promise.resolve();
  }
}
