import { LoggerConfiguration } from './logger-configuration';
import { LogEvent } from './models/log-event';
import { WriteLogLevel } from './models/common-types';
import { LoggingEvent, ObservableSink } from './sinks';
import { ConsoleSink } from './sinks/console-sink';
import { EnrichStage } from './stages/enrich-stage';
import { FilterStage } from './stages/filter-stage';
import { SinkStage } from './stages/sink-stage';

describe('LoggingService', () => {
  it('should create a basic LoggerConfiguration with minlevel', () => {
    const config = new LoggerConfiguration().minLevel('info');

    const minLevelStage = config['pipeline'][0];
    expect(minLevelStage).toBeInstanceOf(FilterStage);
  });

  it('should create a basic LoggerConfiguration with filter', () => {
    const config = new LoggerConfiguration().filter(() => true);

    const minLevelStage = config['pipeline'][0];
    expect(minLevelStage).toBeInstanceOf(FilterStage);
  });

  it('should create a basic LoggerConfiguration with enricher object', () => {
    const config = new LoggerConfiguration().enrich({ customer: 'Customer' });
    const minLevelStage = config['pipeline'][0];
    expect(minLevelStage).toBeInstanceOf(EnrichStage);
  });

  it('should create a basic LoggerConfiguration with enricher function', () => {
    const config = new LoggerConfiguration().enrich(() => ({
      customer: 'Customer',
    }));

    const minLevelStage = config['pipeline'][0];
    expect(minLevelStage).toBeInstanceOf(EnrichStage);
  });

  it('should create a basic LoggerConfiguration with minlevel', () => {
    const config = new LoggerConfiguration().minLevel('info');

    const minLevelStage = config['pipeline'][0];
    expect(minLevelStage).toBeInstanceOf(FilterStage);
  });

  it('should create a basic LoggerConfiguration with an ObservableSink', async () => {
    const observableSink = new ObservableSink();
    const dt = new Date();
    const config = new LoggerConfiguration()
      .minLevel('info')
      .enrich({ timestamp: dt })
      .writeTo(observableSink);

    // Sinks are now stored as SinkStage in pipeline
    const sinkStage = config['pipeline'].find((stage) => stage instanceof SinkStage);
    expect(sinkStage).toBeInstanceOf(SinkStage);
    expect((sinkStage as SinkStage).getSink()).toBe(observableSink);

    const logger = config.create();

    const emittedPromise = new Promise<LoggingEvent>((resolve) => {
      observableSink.subscribe((ev) => resolve(ev));
    });

    logger.info('Info Message: {~timestamp}, {n}', 'now');

    const emitted = await emittedPromise;
    expect(emitted.message).toBe(`Info Message: ${dt.toISOString()}, now`);
  }, 10000); // Increase timeout to 10s

  it('should support dynamic minLevel with function', () => {
    const currentLevel: WriteLogLevel = 'info';
    const config = new LoggerConfiguration().minLevel(() => currentLevel);

    const filterStage = config['pipeline'][0];
    expect(filterStage).toBeInstanceOf(FilterStage);
  });

  it('should evaluate minLevel function at runtime', async () => {
    let currentLevel: WriteLogLevel = 'warn';

    const capturedLogs: LoggingEvent[] = [];
    const observableSink = new ObservableSink();
    observableSink.subscribe((event) => {
      capturedLogs.push(event);
    });

    const logger = new LoggerConfiguration()
      .minLevel(() => currentLevel)
      .writeTo(observableSink)
      .create();

    // Should work with warn level
    logger.warn('Warning message');
    logger.info('Info message'); // Should be filtered out

    // Wait for async pipeline processing
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(capturedLogs.length).toBeGreaterThan(0);
    expect(capturedLogs.some((log) => log.message.includes('Warning message'))).toBe(true);
    expect(capturedLogs.some((log) => log.message.includes('Info message'))).toBe(false);

    // Change level to info
    capturedLogs.length = 0;
    currentLevel = 'info';

    logger.info('Info message after level change');

    // Wait for async pipeline processing
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(capturedLogs.length).toBeGreaterThan(0);
    expect(
      capturedLogs.some((log) => log.message.includes('Info message after level change'))
    ).toBe(true);
  });
});
