import { describe, it, expect } from 'vitest';
import { LoggerConfiguration } from './logger-configuration';
import { Sink } from './interfaces/sink';
import { LogEvent } from './models/log-event';
import { LogEventLevel } from './models/log-event-level';

describe('Interleaved Sinks', () => {
  class CollectorSink implements Sink {
    public events: LogEvent[] = [];

    emit(events: LogEvent[]): void {
      this.events.push(...events);
    }

    flush(): Promise<void> {
      return Promise.resolve();
    }
  }

  it('should allow sinks to receive events at different pipeline stages', () => {
    const sink1 = new CollectorSink();
    const sink2 = new CollectorSink();
    const sink3 = new CollectorSink();

    const logger = new LoggerConfiguration()
      .writeTo(sink1) // Gets ALL events
      .filter((e) => e.level <= LogEventLevel.warn) // Filter to warn and below (fatal, error, warn)
      .enrich({ enriched: 'yes' }) // Add property
      .writeTo(sink2) // Gets warn+ with enrichment
      .filter((e) => e.level <= LogEventLevel.error) // Filter to error and below (fatal, error)
      .writeTo(sink3) // Gets error+ with enrichment
      .create();

    logger.debug('Debug message'); // Only sink1
    logger.info('Info message'); // Only sink1
    logger.warn('Warning message'); // sink1 + sink2
    logger.error('Error message'); // sink1 + sink2 + sink3

    console.log(
      'sink1 events:',
      sink1.events.map((e) => ({ level: e.level, enriched: e.enrichedProperties }))
    );
    console.log(
      'sink2 events:',
      sink2.events.map((e) => ({ level: e.level, enriched: e.enrichedProperties }))
    );
    console.log(
      'sink3 events:',
      sink3.events.map((e) => ({ level: e.level, enriched: e.enrichedProperties }))
    );

    // sink1 should have all 4 events, none enriched
    expect(sink1.events.length).toBe(4);
    expect(sink1.events[0].enrichedProperties).toEqual({});
    expect(sink1.events[1].enrichedProperties).toEqual({});
    expect(sink1.events[2].enrichedProperties).toEqual({});
    expect(sink1.events[3].enrichedProperties).toEqual({});

    expect(sink2.events.length).toBe(2);
    expect(sink2.events[0].level).toBe(LogEventLevel.warn);
    expect(sink2.events[0].enrichedProperties['enriched']).toBe('yes');
    expect(sink2.events[1].level).toBe(LogEventLevel.error);
    expect(sink2.events[1].enrichedProperties['enriched']).toBe('yes');

    expect(sink3.events.length).toBe(1);
    expect(sink3.events[0].level).toBe(LogEventLevel.error);
    expect(sink3.events[0].enrichedProperties['enriched']).toBe('yes');
  });

  it('should handle real-world browser console + HTTP scenario', () => {
    const consoleSink = new CollectorSink();
    const httpSink = new CollectorSink();

    const logger = new LoggerConfiguration()
      .minLevel('debug')
      .writeTo(consoleSink) // Console gets all debug+ events
      .filter((e) => e.level <= LogEventLevel.error) // Only errors and below (fatal, error)
      .enrich({
        userAgent: 'Mozilla/5.0',
        url: 'https://example.com',
        buildVersion: '1.2.3',
      })
      .writeTo(httpSink) // HTTP gets only errors with client info
      .create();

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.fatal('Fatal message');

    // Console gets all 5 events, no enrichment
    expect(consoleSink.events.length).toBe(5);
    expect(consoleSink.events[0].enrichedProperties['userAgent']).toBeUndefined();

    // HTTP gets only 2 events (error, fatal), both enriched
    expect(httpSink.events.length).toBe(2);
    expect(httpSink.events[0].level).toBe(LogEventLevel.error);
    expect(httpSink.events[0].enrichedProperties['userAgent']).toBe('Mozilla/5.0');
    expect(httpSink.events[0].enrichedProperties['buildVersion']).toBe('1.2.3');
    expect(httpSink.events[1].level).toBe(LogEventLevel.fatal);
    expect(httpSink.events[1].enrichedProperties['userAgent']).toBe('Mozilla/5.0');
  });
});
