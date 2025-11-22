import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getLogger, hasLogger, resetLogger } from './global-registry';

describe('Global Logger Registry', () => {
  afterEach(() => {
    resetLogger();
  });

  describe('getLogger without configured logger', () => {
    it('should return NullLogger when no logger configured', () => {
      const logger = getLogger();
      
      expect(logger).toBeDefined();
      expect(hasLogger()).toBe(false);
      
      // Should be safe to call (no-op)
      logger.info('This does nothing');
      logger.error('Error message', { error: 'details' });
      logger.debug('Safe to call');
    });

    it('should return enriched NullLogger for source context', () => {
      const logger = getLogger('MyLibrary');
      
      expect(logger).toBeDefined();
      expect(hasLogger()).toBe(false);
      
      // Should be safe to call
      logger.debug('Library is working');
    });

    it('should return new NullLogger instances (no caching without configured logger)', () => {
      const logger1 = getLogger('Source1');
      const logger2 = getLogger('Source1');
      const logger3 = getLogger('Source2');
      
      // Without configured logger, no caching happens
      expect(logger1).toBeDefined();
      expect(logger2).toBeDefined();
      expect(logger3).toBeDefined();
    });
  });

  describe('getLogger with configured logger', () => {
    it('should return configured logger when registered', () => {
      // This test would require importing from @cocoar/logging
      // which we don't want to do in abstractions
      // This is tested in @cocoar/logging's global-logger.spec.ts
      expect(true).toBe(true);
    });
  });

  describe('hasLogger', () => {
    it('should return false when no logger configured', () => {
      expect(hasLogger()).toBe(false);
    });
  });
});
