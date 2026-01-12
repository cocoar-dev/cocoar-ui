import { describe, it, expect, vi } from 'vitest';
import { coarTWithDefault } from './coar-t-with-default';
import { CoarI18n } from './coar-i18n';

describe('coarTWithDefault', () => {
  describe('with translations found', () => {
    it('should return translation when available', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Translated Text'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(mockI18n, 'coar.button.save', 'Save');
      expect(result).toBe('Translated Text');
      expect(mockI18n.tWithDefault).toHaveBeenCalledWith(
        'coar.button.save',
        'Save',
        undefined
      );
    });

    it('should pass params to i18n service', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Count: 5'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(
        mockI18n,
        'coar.items.count',
        'Items: {count}',
        { count: 5 }
      );
      expect(result).toBe('Count: 5');
      expect(mockI18n.tWithDefault).toHaveBeenCalledWith(
        'coar.items.count',
        'Items: {count}',
        { count: 5 }
      );
    });
  });

  describe('with translations missing', () => {
    it('should return fallback when result is null', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Fallback'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(mockI18n, 'coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should return fallback when result is undefined', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Fallback'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(mockI18n, 'coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should return fallback when result is empty string', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Fallback'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(mockI18n, 'coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should return fallback when result equals key', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Fallback'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(mockI18n, 'coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should return fallback when result is whitespace', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Fallback'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(mockI18n, 'coar.unknown', 'Fallback');
      expect(result).toBe('Fallback');
    });
  });

  describe('with params', () => {
    it('should work with params and valid translation', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Welcome, Alice'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(
        mockI18n,
        'coar.greeting',
        'Hello, {name}',
        { name: 'Alice' }
      );
      expect(result).toBe('Welcome, Alice');
    });

    it('should use fallback with params when translation missing', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Default: {value}'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(
        mockI18n,
        'coar.missing',
        'Default: {value}',
        { value: 42 }
      );
      expect(result).toBe('Default: {value}');
    });
  });

  describe('edge cases', () => {
    it('should handle empty key', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => 'Fallback'),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(mockI18n, '', 'Fallback');
      expect(result).toBe('Fallback');
    });

    it('should handle empty fallback', () => {
      const mockI18n = {
        tWithDefault: vi.fn(() => ''),
      } as unknown as CoarI18n;

      const result = coarTWithDefault(mockI18n, 'coar.key', '');
      expect(result).toBe('');
    });
  });
});
