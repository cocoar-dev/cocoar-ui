import { describe, it, expect } from 'vitest';
import { CoarDefaultI18n } from './coar-default-i18n';

describe('CoarDefaultI18n', () => {
  describe('t() method', () => {
    it('should return the key unchanged for unknown keys', () => {
      const provider = new CoarDefaultI18n();
      expect(provider.t('coar.datePicker.today')).toBe('coar.datePicker.today');
      expect(provider.t('unknown.key')).toBe('unknown.key');
    });

    it('should apply interpolation to the key when params are provided', () => {
      const provider = new CoarDefaultI18n();
      const result = provider.t('coar.items.count.{count}', { count: 5 });
      expect(result).toBe('coar.items.count.5');
    });

    it('should handle keys with placeholders', () => {
      const provider = new CoarDefaultI18n();
      const result = provider.t('Hello {name}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should return key as-is when no params provided', () => {
      const provider = new CoarDefaultI18n();
      expect(provider.t('some.translation.key')).toBe('some.translation.key');
    });
  });
});
