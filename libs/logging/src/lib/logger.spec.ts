import { Logger } from './logger';
import { LoggerConfiguration } from './logger-configuration';
import { LogEventLevel } from './models/log-event-level';
import { LoggingEvent, ObservableSink } from './sinks';

// Helper to get first value from ObservableSink as Promise
function firstValueFrom(sink: ObservableSink): Promise<LoggingEvent> {
  return new Promise((resolve) => {
    const unsubscribe = sink.subscribe((event) => {
      unsubscribe();
      resolve(event);
    });
  });
}

describe('Logger', () => {
  const error = new Error('ERROR!');

  describe('with default Configuraion', () => {
    let logger: Logger;
    const observableSink = new ObservableSink();
    let resultPromise: Promise<LoggingEvent>;

    beforeEach(() => {
      logger = new LoggerConfiguration()
        .minLevel('verbose')
        .enrich({ customer: 'Customer' })
        .enrich(() => ({ source: 'Testing' }))
        .writeTo(observableSink)
        .create();
      // Set up the promise to resolve with the first value from the observableSink
      // before any log event is emitted.
      resultPromise = firstValueFrom(observableSink);
    });

    it('should log an info event with the log method', async () => {
      logger.log('info', 'Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('info');
    });

    it('should log an error event with the log method', async () => {
      logger.log('error', error, 'Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('error');
    });

    it('should log a fatal event', async () => {
      logger.fatal('Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('fatal');
    });

    it('should log a fatal event with Error', async () => {
      logger.fatal(error, 'Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('fatal');
    });

    it('should log a error event', async () => {
      logger.error('Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('error');
    });

    it('should log a error event with Error', async () => {
      logger.error(error, 'Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('error');
    });

    it('should log a warning event', async () => {
      logger.warn('Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('warn');
    });

    it('should log a warning event with Error', async () => {
      logger.warn(error, 'Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('warn');
    });

    it('should log a information event', async () => {
      logger.info('Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('info');
    });

    it('should log a information event with Error', async () => {
      logger.info(error, 'Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('info');
    });

    it('should log a debug event', async () => {
      logger.debug('Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('debug');
    });

    it('should log a debug event with Error', async () => {
      logger.debug(error, 'Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('debug');
    });

    it('should log a verbose event', async () => {
      logger.verbose('Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('verbose');
    });

    it('should log a verbose event with Error', async () => {
      logger.verbose(error, 'Testmessage: {count}', 1);
      const loggedEvent = await resultPromise;
      expect(loggedEvent.message).toBe('Testmessage: 1');
      expect(loggedEvent.level).toBe('verbose');
    });
  });
});

describe('LoggerConfiguration with Forking', () => {
  it('should fork configuration and only log matching events to the fork', async () => {
    const mainSink = new ObservableSink();
    const forkSink = new ObservableSink();

    const config = new LoggerConfiguration()
      .minLevel('verbose') // Set to capture all logs in the main config
      .writeTo(mainSink)
      .fork((fork) => {
        // Fork configuration
        fork
          .filter((logEvent) => logEvent.level === LogEventLevel.error) // Only errors in this fork
          .writeTo(forkSink);
      });

    const logger = config.create();

    const mainEvents: LoggingEvent[] = [];
    const forkEvents: LoggingEvent[] = [];

    // Subscribing to main sink
    const mainSubscription = mainSink.subscribe((event) => {
      mainEvents.push(event);
    });

    // Subscribing to fork sink
    const forkSubscription = forkSink.subscribe((event) => {
      forkEvents.push(event);
    });

    // Logging different levels of messages
    logger.info('Info message');
    logger.error('Error message');

    const fl = await logger.flush();

    mainSubscription(); // Unsubscribe
    forkSubscription(); // Unsubscribe

    // Assertions
    expect(mainEvents.length).toBe(2);
    expect(mainEvents.some((e) => e.message.includes('Info message'))).toBeTruthy();
    expect(mainEvents.some((e) => e.message.includes('Error message'))).toBeTruthy();

    // Fork should only receive the error message
    expect(forkEvents.length).toBe(1);
    expect(forkEvents[0].message).toContain('Error message');
  });
});
