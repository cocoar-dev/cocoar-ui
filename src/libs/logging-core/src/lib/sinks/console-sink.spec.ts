import { getLogEventLevel } from '../helper-functions';
import { WriteLogLevel } from '../models/common-types';
import { LogEvent } from '../models/log-event';
import { LogEventLevel } from '../models/log-event-level';
import { MessageParser } from '../models/message-parser';
import { ConsoleSink } from './console-sink';

const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

describe('ConsoleSink', () => {
  let consoleSink: ConsoleSink;

  const createLogEvent = (level: LogEventLevel | WriteLogLevel) => {
    return new LogEvent(new Date().toISOString(), getLogEventLevel(level), new MessageParser('Testmessage'), {}, [], {});
  };

  beforeEach(() => {
    // Clear mocks before each test
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
    consoleInfoSpy.mockClear();
    consoleDebugSpy.mockClear();
    consoleSink = new ConsoleSink();
  });

  it('should call console.debug for verbose level log events', async () => {
    const event = createLogEvent('verbose');
    consoleSink.emit([event]);
    await consoleSink.flush();
    expect(consoleDebugSpy).toHaveBeenCalledWith('>>%c[Verbose]%c Testmessage', 'color:grey', '');
  });
  it('should call console.debug for debug level log events', async () => {
    consoleSink.emit([createLogEvent('debug')]);
    await consoleSink.flush();
    expect(consoleDebugSpy).toHaveBeenCalledWith('>>%c[Debug]%c Testmessage', 'color:grey', '');
  });
  it('should call console.info for information level log events', async () => {
    consoleSink.emit([createLogEvent('info')]);
    await consoleSink.flush();
    expect(consoleInfoSpy).toHaveBeenCalledWith('>>%c[Information]%c Testmessage', 'color:black', '');
  });

  it('should call console.warning for warning level log events', async () => {
    consoleSink.emit([createLogEvent('warn')]);
    await consoleSink.flush();
    expect(consoleWarnSpy).toHaveBeenCalledWith('>>%c[Warning]%c Testmessage', 'color:darkorange', '');
  });

  it('should call console.error for error level log events', async () => {
    consoleSink.emit([createLogEvent('error')]);
    await consoleSink.flush();
    expect(consoleErrorSpy).toHaveBeenCalledWith('>>%c[Error]%c Testmessage', 'color:darkred', '');
  });

  it('should call console.error for fatal level log events', async () => {
    consoleSink.emit([createLogEvent('fatal')]);
    await consoleSink.flush();
    expect(consoleErrorSpy).toHaveBeenCalledWith('>>%c[Fatal]%c Testmessage', 'color:darkred', '');
  });

  it('should call console.error for events with an Error Object', async () => {
    const errorEvent = new LogEvent(
      new Date().toISOString(),
      LogEventLevel.error,
      new MessageParser('Testmessage'),
      {},
      [],
      {},
      new Error('Error!!!')
    );
    consoleSink.emit([errorEvent]);
    await consoleSink.flush();
    expect(consoleErrorSpy).toHaveBeenCalledWith('>>%c[Error]%c Testmessage', 'color:darkred', '', expect.any(Error));
  });

  it('should not emit log events below the restrictedToMinimumLevel', async () => {
    const consoleSinkRestricted = new ConsoleSink({ restrictedToMinimumLevel: LogEventLevel.error });
    const parser = new MessageParser('Error message');
    const logEvent = new LogEvent(new Date().toISOString(), LogEventLevel.info, parser, {}, [], {});
    const errorLogEvent = new LogEvent(new Date().toISOString(), LogEventLevel.error, parser, {}, [], {});

    consoleSinkRestricted.emit([logEvent, errorLogEvent]); // logEvent should be ignored
    await consoleSinkRestricted.flush();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('>>%c[Error]%c Error message', 'color:darkred', '');
  });

  it('should prepend timestamp if includeTimestamps option is true', async () => {
    const consoleSinkWithTimestamp = new ConsoleSink({ includeTimestamps: true, includeProperties: true });
    const parser = new MessageParser('Testmessage {count}');
    const logEvent = new LogEvent(new Date().toISOString(), LogEventLevel.info, parser, { count: 1 }, [], {});
    consoleSinkWithTimestamp.emit([logEvent]);
    await consoleSinkWithTimestamp.flush();
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z >>%c\[Information\]%c Testmessage 1$/),
      'color:black',
      '',
      { count: 1 }
    );
  });
});
