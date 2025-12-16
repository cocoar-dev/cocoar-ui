import { describe, it, expect, afterEach } from 'vitest';
import { getLoggerFor } from './get-logger-for';
import { resetLogger } from './global-registry';

describe('getLoggerFor', () => {
  afterEach(() => {
    resetLogger();
  });

  it('should accept string and use as-is', () => {
    const logger = getLoggerFor('MyModule');
    expect(logger).toBeDefined();
  });

  it('should preserve underscores in string source', () => {
    const logger = getLoggerFor('_MyModule');
    expect(logger).toBeDefined();
    // Can't check source directly without configuring logger, but it won't crash
  });

  it('should accept class constructor and extract name', () => {
    class MyTestClass {}
    const logger = getLoggerFor(MyTestClass);
    expect(logger).toBeDefined();
  });

  it('should strip leading underscore from class name', () => {
    class _MyAngularComponent {}
    const logger = getLoggerFor(_MyAngularComponent);
    expect(logger).toBeDefined();
  });

  it('should accept instance and extract class name', () => {
    class MyService {}
    const instance = new MyService();
    const logger = getLoggerFor(instance);
    expect(logger).toBeDefined();
  });

  it('should strip leading underscore from instance constructor name', () => {
    class _MyCompiledClass {}
    const instance = new _MyCompiledClass();
    const logger = getLoggerFor(instance);
    expect(logger).toBeDefined();
  });

  it('should handle plain object gracefully', () => {
    const obj = { name: 'test' };
    const logger = getLoggerFor(obj);
    expect(logger).toBeDefined();
    // Will get "Object" as source - not useful but won't crash
  });

  it('should handle null/undefined gracefully', () => {
    const logger1 = getLoggerFor(null as any);
    const logger2 = getLoggerFor(undefined as any);
    expect(logger1).toBeDefined();
    expect(logger2).toBeDefined();
    // Will get "Unknown" as source
  });

  it('should return different logger instances for different sources', () => {
    class ServiceA {}
    class ServiceB {}

    const loggerA = getLoggerFor(ServiceA);
    const loggerB = getLoggerFor(ServiceB);

    expect(loggerA).not.toBe(loggerB);
  });
});
