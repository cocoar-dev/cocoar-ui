import { describe, it, expect } from 'vitest';
import { LoggerConfiguration } from './logger-configuration';
import { Sink } from './interfaces/sink';
import { LogEvent } from './models/log-event';
import { LogEventLevel } from './models/log-event-level';

describe('Interleaved Async/Sync Sinks', () => {
  class SyncSink implements Sink {
    public events: LogEvent[] = [];
    public name: string;

    constructor(name: string) {
      this.name = name;
    }

    emit(events: LogEvent[]): void {
      this.events.push(...events);
    }

    flush(): Promise<void> {
      return Promise.resolve();
    }
  }

  class AsyncSink implements Sink {
    public events: LogEvent[] = [];
    public name: string;

    constructor(name: string) {
      this.name = name;
    }

    async emit(events: LogEvent[]): Promise<void> {
      // Simulate async operation (e.g., HTTP call)
      await new Promise(resolve => setTimeout(resolve, 10));
      this.events.push(...events);
    }

    flush(): Promise<void> {
      return Promise.resolve();
    }
  }

  it('should handle mixed sync and async sinks in sequence', async () => {
    const syncSink1 = new SyncSink('sync1');
    const asyncSink = new AsyncSink('async');
    const syncSink2 = new SyncSink('sync2');

    const logger = new LoggerConfiguration()
      .writeTo(syncSink1)    // Sync - gets all events
      .filter(e => e.level <= LogEventLevel.warn)
      .writeTo(asyncSink)    // Async - gets filtered events
      .enrich({ extra: 'data' })
      .writeTo(syncSink2)    // Sync - gets filtered + enriched
      .create();

    // Fire-and-forget (all sinks process, but we don't wait)
    logger.info('Info message');
    logger.warn('Warning message');

    // Give async sink time to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(syncSink1.events.length).toBe(2);  // info, warn
    expect(asyncSink.events.length).toBe(1);  // only warn (filtered)
    expect(syncSink2.events.length).toBe(1);  // only warn (filtered + enriched)
    expect(syncSink2.events[0].enrichedProperties['extra']).toBe('data');
  });

  it('should allow awaiting when async sinks are present', async () => {
    const syncSink = new SyncSink('sync');
    const asyncSink = new AsyncSink('async');

    const logger = new LoggerConfiguration()
      .writeTo(syncSink)
      .filter(e => e.level <= LogEventLevel.error)
      .writeTo(asyncSink)  // Async sink present
      .create();

    logger.info('Info');
    
    // Await for critical log to ensure async sink completes
    await logger.error('Critical error');

    // No need to wait - async sink completed because we awaited
    expect(syncSink.events.length).toBe(2);   // info, error
    expect(asyncSink.events.length).toBe(1);  // only error
    expect(asyncSink.events[0].level).toBe(LogEventLevel.error);
  });

  it('should return void when all sinks are synchronous', () => {
    const sync1 = new SyncSink('sync1');
    const sync2 = new SyncSink('sync2');

    const logger = new LoggerConfiguration()
      .writeTo(sync1)
      .filter(e => e.level <= LogEventLevel.warn)
      .writeTo(sync2)
      .create();

    // Should return void (not Promise)
    const result = logger.info('Test');
    
    expect(result).toBeUndefined();
    expect(sync1.events.length).toBe(1);
    expect(sync2.events.length).toBe(0);  // filtered out
  });

  it('should return Promise when any sink is async', async () => {
    const syncSink = new SyncSink('sync');
    const asyncSink = new AsyncSink('async');

    const logger = new LoggerConfiguration()
      .writeTo(syncSink)
      .writeTo(asyncSink)  // Async sink makes result a Promise
      .create();

    // Should return Promise<void>
    const result = logger.info('Test');
    
    expect(result).toBeInstanceOf(Promise);

    await result;    expect(syncSink.events.length).toBe(1);
    expect(asyncSink.events.length).toBe(1);
  });

  it('should handle real-world scenario: sync console + async HTTP', async () => {
    const consoleSink = new SyncSink('console');
    const httpSink = new AsyncSink('http');

    const logger = new LoggerConfiguration()
      .minLevel('debug')
      .writeTo(consoleSink)  // Sync - immediate console output
      .filter(e => e.level <= LogEventLevel.error)
      .enrich({ 
        userAgent: 'Mozilla/5.0',
        timestamp: Date.now() 
      })
      .writeTo(httpSink)  // Async - batched HTTP calls
      .create();

    // Fire-and-forget for normal logs
    logger.debug('Debug info');
    logger.info('User action');
    logger.warn('Warning');

    // Await for critical error to ensure it reaches server
    await logger.error('Critical error');
    await logger.fatal('System failure');

    // Console got all 5 events immediately
    expect(consoleSink.events.length).toBe(5);
    expect(consoleSink.events[0].enrichedProperties['userAgent']).toBeUndefined();

    // HTTP got only 2 critical events (error, fatal) with enrichment
    expect(httpSink.events.length).toBe(2);
    expect(httpSink.events[0].level).toBe(LogEventLevel.error);
    expect(httpSink.events[0].enrichedProperties['userAgent']).toBe('Mozilla/5.0');
    expect(httpSink.events[1].level).toBe(LogEventLevel.fatal);
    expect(httpSink.events[1].enrichedProperties['timestamp']).toBeDefined();
  });
});
