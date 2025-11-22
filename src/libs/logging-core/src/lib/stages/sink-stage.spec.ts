import { describe, it, expect } from 'vitest';
import { Sink } from '../interfaces/sink';
import { LogEvent } from '../models/log-event';
import { LogEventLevel } from '../models/log-event-level';
import { MessageParser } from '../models/message-parser';
import { LoggerConfiguration } from '../logger-configuration';

describe('SinkStage', () => {
  const createLogEvent = (): LogEvent => {
    return new LogEvent(
      new Date().toISOString(),
      LogEventLevel.info,
      new MessageParser('Test message'),
      {},
      [],
      {}
    );
  };

  class TestSink implements Sink {
    public emittedEvents: LogEvent[][] = [];

    emit(events: LogEvent[]): void {
      this.emittedEvents.push(events);
    }

    flush(): Promise<void> {
      return Promise.resolve();
    }
  }

  it('should emit events to sink when no predicate provided', () => {
    const sink = new TestSink();
    const logger = new LoggerConfiguration()
      .writeTo(sink)
      .create();

    logger.info('Test message');

    expect(sink.emittedEvents.length).toBe(1);
  });

  it('should emit events when predicate returns true', () => {
    const sink = new TestSink();
    const logger = new LoggerConfiguration()
      .writeTo(sink, () => true)
      .create();
    
    logger.info('Test message');

    expect(sink.emittedEvents.length).toBe(1);
  });

  it('should not emit events when predicate returns false', () => {
    const sink = new TestSink();
    const logger = new LoggerConfiguration()
      .writeTo(sink, () => false)
      .create();
    
    logger.info('Test message');

    expect(sink.emittedEvents.length).toBe(0);
  });

  it('should evaluate predicate at runtime for each batch', () => {
    const sink = new TestSink();
    let enabled = true;
    
    const logger = new LoggerConfiguration()
      .writeTo(sink, () => enabled)
      .create();

    logger.info('Message 1');
    expect(sink.emittedEvents.length).toBe(1);

    enabled = false;
    logger.info('Message 2');
    expect(sink.emittedEvents.length).toBe(1);

    enabled = true;
    logger.info('Message 3');
    expect(sink.emittedEvents.length).toBe(2);
  });

  it('should pass through events even when sink is disabled', () => {
    const sink1 = new TestSink();
    const sink2 = new TestSink();
    
    const logger = new LoggerConfiguration()
      .writeTo(sink1, () => false)
      .writeTo(sink2, () => true)
      .create();

    logger.info('Test message');

    expect(sink1.emittedEvents.length).toBe(0);
    expect(sink2.emittedEvents.length).toBe(1);
  });
});
