import { getLogEventLevel } from './helper-functions';
import { WriteLogLevel } from './models/common-types';
import { LogEvent } from './models/log-event';
import { MessageParser } from './models/message-parser';
import { Pipeline } from './pipeline';
import { ObservableSink } from './sinks';
import { EnrichStage } from './stages/enrich-stage';
import { SinkStage } from './stages/sink-stage';

describe('EnrichStage', () => {
  const createLogEvent = (level: WriteLogLevel) => {
    return new LogEvent(
      new Date().toISOString(),
      getLogEventLevel(level),
      new MessageParser(`[${level}] Testmessage`),
      {},
      [],
      {}
    );
  };

  it('enriches log events with additional properties', async () => {
    const observableSink = new ObservableSink();
    const enrichStage = new EnrichStage({ additional: 'data' });
    const sinkStage = new SinkStage(observableSink);
    const pipeline = new Pipeline([enrichStage, sinkStage]);

    const inputEvent = createLogEvent('info');

    const event = await new Promise<LogEvent>((resolve) => {
      observableSink.subscribe((loggingEvent) => {
        // ObservableSink emits LoggingEvent, not LogEvent
        // Check enriched properties
        expect(loggingEvent.level).toBe('info');
        expect(loggingEvent.enrichedProperties['additional']).toBe('data');
        resolve(inputEvent); // Resolve with something to end the promise
      });

      pipeline.emit(inputEvent);
    });

    // Test passed if we got here
    expect(event).toBeDefined();
  });
});
