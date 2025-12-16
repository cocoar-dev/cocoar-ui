import { getLogEventLevel, getLogEventLevelNames, isEnabled } from './helper-functions';
import { WriteLogLevel } from './models/common-types';
import { LogEventLevel } from './models/log-event-level';

describe('LogEventLevel Utilities', () => {
  describe('getLogEventLevel', () => {
    it('should return numeric value for LogEventLevel enum input', () => {
      expect(getLogEventLevel(LogEventLevel.error)).toBe(LogEventLevel.error);
    });

    it('should return numeric value for string input', () => {
      expect(getLogEventLevel('error')).toBe(LogEventLevel.error);
    });

    it('should throw for invalid string input', () => {
      expect(() => getLogEventLevel('invalid' as WriteLogLevel)).toThrow(
        'no matching LogLevel found!'
      );
    });
  });

  describe('getLogEventLevelNames', () => {
    it('should return the name for a given LogEventLevel value', () => {
      expect(getLogEventLevelNames(LogEventLevel.error)).toBe('error');
    });

    it('should throw an error for a value without matching LogEventLevelName', () => {
      expect(() => getLogEventLevelNames(999)).toThrow(`no matching LogLevelName found!`);
    });
  });

  describe('isEnabled', () => {
    it('should return true if level is undefined', () => {
      expect(isEnabled(undefined, LogEventLevel.verbose)).toBeTruthy();
    });

    it('should return true if target level is enabled', () => {
      expect(isEnabled(LogEventLevel.verbose, LogEventLevel.debug)).toBeTruthy();
    });

    it('should return false if target level is not enabled', () => {
      expect(isEnabled(LogEventLevel.error, LogEventLevel.warn)).toBeFalsy();
    });
  });
});
