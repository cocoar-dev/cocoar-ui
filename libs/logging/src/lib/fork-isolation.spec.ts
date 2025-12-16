import { describe, it, expect } from 'vitest';
import { LoggerConfiguration } from './logger-configuration';
import { ObservableSink, LoggingEvent } from './sinks/observable-sink';
import { LogEventLevel } from './models/log-event-level';

describe('Fork Isolation', () => {
  it('should isolate fork filtering and enrichment from main pipeline', () => {
    const consoleSink = new ObservableSink();
    const httpSink = new ObservableSink();
    const afterForkSink = new ObservableSink();

    const config = new LoggerConfiguration()
      .minLevel('debug')
      .writeTo(consoleSink) // Gets all debug+ events (no filtering, no enrichment)
      .fork(
        (p) =>
          p
            .filter((e) => e.level <= LogEventLevel.error) // Filter to errors and below
            .enrich({
              userAgent: 'test-agent',
              url: 'https://example.com',
              buildVersion: '1.2.3',
            })
            .writeTo(httpSink) // Gets only errors with enrichment
      )
      .writeTo(afterForkSink); // Should get all events, no fork enrichment

    const logger = config.create();

    const consoleEvents: LoggingEvent[] = [];
    const httpEvents: LoggingEvent[] = [];
    const afterForkEvents: LoggingEvent[] = [];

    consoleSink.subscribe((event) => consoleEvents.push(event));
    httpSink.subscribe((event) => httpEvents.push(event));
    afterForkSink.subscribe((event) => afterForkEvents.push(event));

    // Log events at different levels
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    // Console sink: Gets ALL 4 events, no enrichment
    expect(consoleEvents).toHaveLength(4);
    expect(consoleEvents[0].enrichedProperties).toEqual({});
    expect(consoleEvents[1].enrichedProperties).toEqual({});
    expect(consoleEvents[2].enrichedProperties).toEqual({});
    expect(consoleEvents[3].enrichedProperties).toEqual({});

    // HTTP sink (inside fork): Gets only ERROR (1 event), WITH fork enrichment
    expect(httpEvents).toHaveLength(1);
    expect(httpEvents[0].level).toBe('error');
    expect(httpEvents[0].enrichedProperties).toEqual({
      userAgent: 'test-agent',
      url: 'https://example.com',
      buildVersion: '1.2.3',
    });

    // After-fork sink: Gets ALL 4 events, NO fork enrichment (fork is isolated)
    expect(afterForkEvents).toHaveLength(4);
    expect(afterForkEvents[0].level).toBe('debug');
    expect(afterForkEvents[1].level).toBe('info');
    expect(afterForkEvents[2].level).toBe('warn');
    expect(afterForkEvents[3].level).toBe('error');
    expect(afterForkEvents[0].enrichedProperties).toEqual({});
    expect(afterForkEvents[1].enrichedProperties).toEqual({});
    expect(afterForkEvents[2].enrichedProperties).toEqual({});
    expect(afterForkEvents[3].enrichedProperties).toEqual({}); // Error has no fork enrichment in main pipeline
  });

  it('should support multiple forks with different enrichment', () => {
    const mainSink = new ObservableSink();
    const fork1Sink = new ObservableSink();
    const fork2Sink = new ObservableSink();

    const config = new LoggerConfiguration()
      .minLevel('debug')
      .writeTo(mainSink)
      .fork((p) =>
        p
          .filter((e) => e.level <= LogEventLevel.error)
          .enrich({ source: 'fork1' })
          .writeTo(fork1Sink)
      )
      .fork((p) =>
        p
          .filter((e) => e.level <= LogEventLevel.warn)
          .enrich({ source: 'fork2' })
          .writeTo(fork2Sink)
      );

    const logger = config.create();

    const mainEvents: LoggingEvent[] = [];
    const fork1Events: LoggingEvent[] = [];
    const fork2Events: LoggingEvent[] = [];

    mainSink.subscribe((event) => mainEvents.push(event));
    fork1Sink.subscribe((event) => fork1Events.push(event));
    fork2Sink.subscribe((event) => fork2Events.push(event));

    logger.debug('Debug');
    logger.info('Info');
    logger.warn('Warning');
    logger.error('Error');

    // Main sink: All 4 events, no enrichment
    expect(mainEvents).toHaveLength(4);
    expect(mainEvents.every((e) => Object.keys(e.enrichedProperties).length === 0)).toBe(true);

    // Fork1: Only error (1 event), enriched with source=fork1
    expect(fork1Events).toHaveLength(1);
    expect(fork1Events[0].level).toBe('error');
    expect(fork1Events[0].enrichedProperties).toEqual({ source: 'fork1' });

    // Fork2: Warn + error (2 events), enriched with source=fork2
    expect(fork2Events).toHaveLength(2);
    expect(fork2Events[0].level).toBe('warn');
    expect(fork2Events[0].enrichedProperties).toEqual({ source: 'fork2' });
    expect(fork2Events[1].level).toBe('error');
    expect(fork2Events[1].enrichedProperties).toEqual({ source: 'fork2' });
  });

  it('should support nested forks (fork within fork)', () => {
    const mainSink = new ObservableSink();
    const fork1Sink = new ObservableSink();
    const nestedForkSink = new ObservableSink();

    const config = new LoggerConfiguration()
      .minLevel('debug')
      .writeTo(mainSink)
      .fork((p) =>
        p
          .enrich({ level1: 'fork' })
          .writeTo(fork1Sink)
          .fork((p2) =>
            p2
              .filter((e) => e.level <= LogEventLevel.error)
              .enrich({ level2: 'nested' })
              .writeTo(nestedForkSink)
          )
      );

    const logger = config.create();

    const mainEvents: LoggingEvent[] = [];
    const fork1Events: LoggingEvent[] = [];
    const nestedEvents: LoggingEvent[] = [];

    mainSink.subscribe((event) => mainEvents.push(event));
    fork1Sink.subscribe((event) => fork1Events.push(event));
    nestedForkSink.subscribe((event) => nestedEvents.push(event));

    logger.info('Info');
    logger.error('Error');

    // Main: 2 events, no enrichment
    expect(mainEvents).toHaveLength(2);
    expect(mainEvents[0].enrichedProperties).toEqual({});

    // Fork1: 2 events, enriched with level1=fork
    expect(fork1Events).toHaveLength(2);
    expect(fork1Events[0].enrichedProperties).toEqual({ level1: 'fork' });
    expect(fork1Events[1].enrichedProperties).toEqual({ level1: 'fork' });

    // Nested fork: 1 event (error), enriched with BOTH level1=fork AND level2=nested
    expect(nestedEvents).toHaveLength(1);
    expect(nestedEvents[0].level).toBe('error');
    expect(nestedEvents[0].enrichedProperties).toEqual({
      level1: 'fork',
      level2: 'nested',
    });
  });
});
