import { describe, it, expect } from 'vitest';
import { coarIsMissingTranslation } from './coar-is-missing-translation';

describe('coarIsMissingTranslation', () => {
  describe('null and undefined', () => {
    it('should return true for null result', () => {
      expect(coarIsMissingTranslation('coar.button.save', null)).toBe(true);
    });

    it('should return true for undefined result', () => {
      expect(coarIsMissingTranslation('coar.button.save', undefined)).toBe(true);
    });
  });

  describe('empty strings', () => {
    it('should return true for empty string', () => {
      expect(coarIsMissingTranslation('coar.button.save', '')).toBe(true);
    });

    it('should return true for whitespace-only string', () => {
      expect(coarIsMissingTranslation('coar.button.save', '   ')).toBe(true);
      expect(coarIsMissingTranslation('coar.button.save', '\t')).toBe(true);
      expect(coarIsMissingTranslation('coar.button.save', '\n')).toBe(true);
      expect(coarIsMissingTranslation('coar.button.save', ' \t\n ')).toBe(true);
    });
  });

  describe('key equality', () => {
    it('should return true when result equals the key', () => {
      expect(coarIsMissingTranslation('coar.button.save', 'coar.button.save')).toBe(true);
    });

    it('should return true when result equals the key after trimming', () => {
      expect(coarIsMissingTranslation('coar.button.save', '  coar.button.save  ')).toBe(true);
    });

    it('should return false when result differs from the key', () => {
      expect(coarIsMissingTranslation('coar.button.save', 'Save')).toBe(false);
    });
  });

  describe('valid translations', () => {
    it('should return false for valid translation', () => {
      expect(coarIsMissingTranslation('coar.button.save', 'Save')).toBe(false);
      expect(coarIsMissingTranslation('coar.button.cancel', 'Cancel')).toBe(false);
    });

    it('should return false for translation with whitespace', () => {
      expect(coarIsMissingTranslation('coar.message', '  Valid Message  ')).toBe(false);
    });

    it('should return false for single character translations', () => {
      expect(coarIsMissingTranslation('coar.letter', 'A')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty key', () => {
      expect(coarIsMissingTranslation('', '')).toBe(true);
      expect(coarIsMissingTranslation('', 'text')).toBe(false);
    });

    it('should handle special characters in result', () => {
      expect(coarIsMissingTranslation('coar.special', '!@#$%')).toBe(false);
      expect(coarIsMissingTranslation('coar.emoji', '🎉')).toBe(false);
    });

    it('should handle multiline strings', () => {
      expect(coarIsMissingTranslation('coar.multi', 'Line 1\nLine 2')).toBe(false);
      expect(coarIsMissingTranslation('coar.key', '\n\n')).toBe(true);
    });
  });
});
