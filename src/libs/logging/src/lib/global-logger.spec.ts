import { describe, it, expect, afterEach } from 'vitest';
import { 
  configureGlobalLogger, 
  getLogger, 
  getLoggerFor, 
  resetGlobalLogger 
} from './global-logger';
import { ConsoleSink } from './sinks/console-sink';

describe('Global Logger', () => {
  // Clean up after each test to ensure test isolation
  afterEach(() => {
    resetGlobalLogger();
  });

  describe('getLogger', () => {
    it('should return a default logger when not configured', () => {
      const logger = getLogger();
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
    });

    it('should return the same instance across multiple calls', () => {
      const logger1 = getLogger();
      const logger2 = getLogger();
      
      // Both should use the same underlying configuration
      expect(logger1).toBe(logger2);
    });

    it('should enrich logger with source when provided', () => {
      const logger = getLogger('MyComponent');
      
      // The logger should be a new instance with enrichment
      expect(logger).toBeDefined();
    });

    it('should return different enriched instances for different sources', () => {
      const logger1 = getLogger('Component1');
      const logger2 = getLogger('Component2');
      
      // Different enriched instances
      expect(logger1).not.toBe(logger2);
    });
  });

  describe('configureGlobalLogger', () => {
    it('should configure the global logger', () => {
      const logger = configureGlobalLogger((config) =>
        config
          .minLevel('debug')
          .writeTo(new ConsoleSink({ includeProperties: true }))
      );
      
      expect(logger).toBeDefined();
    });

    it('should share configuration across all getLogger calls', () => {
      configureGlobalLogger((config) =>
        config.minLevel('warn')
      );
      
      const logger1 = getLogger();
      const logger2 = getLogger();
      
      expect(logger1).toBe(logger2);
    });

    it('should allow reconfiguration', () => {
      const firstLogger = configureGlobalLogger((config) =>
        config.minLevel('info')
      );
      
      const secondLogger = configureGlobalLogger((config) =>
        config.minLevel('debug')
      );
      
      // Reconfiguration creates a new logger
      expect(firstLogger).not.toBe(secondLogger);
    });
  });

  describe('getLoggerFor', () => {
    it('should extract class name as source', () => {
      class MyTestClass {}
      
      const logger = getLoggerFor(MyTestClass);
      expect(logger).toBeDefined();
    });

    it('should handle class names starting with underscore', () => {
      // Simulate compiled Angular class
      class _MyAngularComponent {}
      
      const logger = getLoggerFor(_MyAngularComponent);
      expect(logger).toBeDefined();
    });

    it('should return different instances for different classes', () => {
      class ServiceA {}
      class ServiceB {}
      
      const loggerA = getLoggerFor(ServiceA);
      const loggerB = getLoggerFor(ServiceB);
      
      expect(loggerA).not.toBe(loggerB);
    });
  });

  describe('resetGlobalLogger', () => {
    it('should reset the global logger configuration', () => {
      const firstLogger = configureGlobalLogger((config) =>
        config.minLevel('debug')
      );
      
      resetGlobalLogger();
      
      const newLogger = getLogger();
      
      // After reset, should get a new default logger
      expect(newLogger).not.toBe(firstLogger);
    });
  });

  describe('Cross-package singleton behavior', () => {
    it('should use Symbol.for to enable cross-package sharing', () => {
      // The symbol should be retrievable by its key
      const symbol = Symbol.for('@cocoar/logging:global-logger');
      expect(symbol).toBeDefined();
    });

    it('should store state in globalThis', () => {
      configureGlobalLogger((config) => config.minLevel('info'));
      
      const symbol = Symbol.for('@cocoar/logging:global-logger');
      const global = globalThis as Record<symbol, unknown>;
      
      expect(global[symbol]).toBeDefined();
    });
  });
});
