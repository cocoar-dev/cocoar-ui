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
const consoleGroupCollapsedSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

describe('ConsoleSink', () => {
  let consoleSink: ConsoleSink;

  const createLogEvent = (level: LogEventLevel | WriteLogLevel) => {
    return new LogEvent(
      new Date().toISOString(),
      getLogEventLevel(level),
      new MessageParser('Testmessage'),
      {},
      [],
      {}
    );
  };

  beforeEach(() => {
    // Clear mocks before each test
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
    consoleInfoSpy.mockClear();
    consoleDebugSpy.mockClear();
    consoleGroupCollapsedSpy.mockClear();
    consoleGroupEndSpy.mockClear();
    consoleSink = new ConsoleSink();
  });

  it('should call console.debug for verbose level log events', async () => {
    const event = createLogEvent('verbose');
    consoleSink.emit([event]);
    await consoleSink.flush();
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '>>%c[Verbose]%c Testmessage',
      'color:#aaaaaa',
      ''
    );
  });
  it('should call console.debug for debug level log events', async () => {
    consoleSink.emit([createLogEvent('debug')]);
    await consoleSink.flush();
    expect(consoleDebugSpy).toHaveBeenCalledWith('>>%c[Debug]%c Testmessage', 'color:#888888', '');
  });
  it('should call console.info for information level log events', async () => {
    consoleSink.emit([createLogEvent('info')]);
    await consoleSink.flush();
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      '>>%c[Information]%c Testmessage',
      'color:#0088ff',
      ''
    );
  });

  it('should call console.warning for warning level log events', async () => {
    consoleSink.emit([createLogEvent('warn')]);
    await consoleSink.flush();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '>>%c[Warning]%c Testmessage',
      'color:#ff8800;font-weight:bold',
      ''
    );
  });

  it('should call console.error for error level log events', async () => {
    consoleSink.emit([createLogEvent('error')]);
    await consoleSink.flush();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '>>%c[Error]%c Testmessage',
      'color:#ff0000;font-weight:bold',
      ''
    );
  });

  it('should call console.error for fatal level log events', async () => {
    consoleSink.emit([createLogEvent('fatal')]);
    await consoleSink.flush();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '>>%c[Fatal]%c Testmessage',
      'background:#8b0000;color:white;font-weight:bold;padding:2px 6px;border-radius:3px',
      ''
    );
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
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '>>%c[Error]%c Testmessage',
      'color:#ff0000;font-weight:bold',
      '',
      expect.any(Error)
    );
  });

  it('should not emit log events below the restrictedToMinimumLevel', async () => {
    const consoleSinkRestricted = new ConsoleSink({
      restrictedToMinimumLevel: LogEventLevel.error,
    });
    const parser = new MessageParser('Error message');
    const logEvent = new LogEvent(new Date().toISOString(), LogEventLevel.info, parser, {}, [], {});
    const errorLogEvent = new LogEvent(
      new Date().toISOString(),
      LogEventLevel.error,
      parser,
      {},
      [],
      {}
    );

    consoleSinkRestricted.emit([logEvent, errorLogEvent]); // logEvent should be ignored
    await consoleSinkRestricted.flush();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '>>%c[Error]%c Error message',
      'color:#ff0000;font-weight:bold',
      ''
    );
  });

  it('should handle circular references without crashing', async () => {
    const circular: any = { name: 'test', value: 42 };
    circular.self = circular;
    circular.nested = { parent: circular };

    const parser = new MessageParser('Circular test');
    const logEvent = new LogEvent(
      new Date().toISOString(),
      LogEventLevel.info,
      parser,
      { circular },
      [],
      {}
    );

    // Browser's console.log handles circular refs natively
    expect(() => consoleSink.emit([logEvent])).not.toThrow();
    expect(consoleInfoSpy).toHaveBeenCalled();
  });

  it('should handle DOM-like circular structures', async () => {
    // Simulate DOM-like structure with circular parent/child refs
    const parent: any = { type: 'parent', children: [] };
    const child: any = { type: 'child', parent };
    parent.children.push(child);

    const parser = new MessageParser('DOM structure test');
    const logEvent = new LogEvent(
      new Date().toISOString(),
      LogEventLevel.info,
      parser,
      { element: parent },
      [],
      {}
    );

    expect(() => consoleSink.emit([logEvent])).not.toThrow();
    expect(consoleInfoSpy).toHaveBeenCalled();
  });

  it('should prepend timestamp if includeTimestamps option is true', async () => {
    const consoleSinkWithTimestamp = new ConsoleSink({
      includeTimestamps: true,
      includeProperties: true,
    });
    const parser = new MessageParser('Testmessage {count}');
    const logEvent = new LogEvent(
      new Date().toISOString(),
      LogEventLevel.info,
      parser,
      { count: 1 },
      [],
      {}
    );
    consoleSinkWithTimestamp.emit([logEvent]);
    await consoleSinkWithTimestamp.flush();
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z >>%c\[Information\]%c Testmessage 1$/
      ),
      'color:#0088ff',
      '',
      { count: 1 }
    );
  });

  it('should use console.groupCollapsed when useGroups is enabled and values exist', async () => {
    const consoleSinkWithGroups = new ConsoleSink({ useGroups: true, includeProperties: true });
    const parser = new MessageParser('Grouped message');
    const logEvent = new LogEvent(
      new Date().toISOString(),
      LogEventLevel.info,
      parser,
      { userId: 123, action: 'login' },
      [],
      {}
    );
    consoleSinkWithGroups.emit([logEvent]);
    await consoleSinkWithGroups.flush();

    expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith(
      '>>%c[Information]%c Grouped message',
      'color:#0088ff',
      ''
    );
    expect(consoleInfoSpy).toHaveBeenCalledWith({ userId: 123, action: 'login' });
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });

  it('should not use groups when useGroups is enabled but no values exist', async () => {
    const consoleSinkWithGroups = new ConsoleSink({ useGroups: true });
    const parser = new MessageParser('Simple message');
    const logEvent = new LogEvent(new Date().toISOString(), LogEventLevel.info, parser, {}, [], {});
    consoleSinkWithGroups.emit([logEvent]);
    await consoleSinkWithGroups.flush();

    expect(consoleGroupCollapsedSpy).not.toHaveBeenCalled();
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      '>>%c[Information]%c Simple message',
      'color:#0088ff',
      ''
    );
  });

  it('should group error objects when useGroups is enabled', async () => {
    const consoleSinkWithGroups = new ConsoleSink({ useGroups: true });
    const error = new Error('Test error');
    const parser = new MessageParser('Error occurred');
    const logEvent = new LogEvent(
      new Date().toISOString(),
      LogEventLevel.error,
      parser,
      {},
      [],
      {},
      error
    );
    consoleSinkWithGroups.emit([logEvent]);
    await consoleSinkWithGroups.flush();

    expect(consoleGroupCollapsedSpy).toHaveBeenCalledWith(
      '>>%c[Error]%c Error occurred',
      'color:#ff0000;font-weight:bold',
      ''
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    expect(consoleGroupEndSpy).toHaveBeenCalled();
  });
});
