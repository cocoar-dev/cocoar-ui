import { describe, it, expect } from 'vitest';
import { coarInterpolate } from './coar-interpolate';

describe('coarInterpolate', () => {
  it('should return template unchanged when no params provided', () => {
    const result = coarInterpolate('Hello World');
    expect(result).toBe('Hello World');
  });

  it('should interpolate single placeholder', () => {
    const result = coarInterpolate('Hello {name}', { name: 'Alice' });
    expect(result).toBe('Hello Alice');
  });

  it('should interpolate multiple placeholders', () => {
    const result = coarInterpolate('Hello {name}, you have {count} items.', {
      name: 'Alice',
      count: 3,
    });
    expect(result).toBe('Hello Alice, you have 3 items.');
  });

  it('should handle missing values by replacing with empty string', () => {
    const result = coarInterpolate('Hello {name}', {});
    expect(result).toBe('Hello ');
  });

  it('should convert non-string values to strings', () => {
    const result = coarInterpolate('Count: {count}, Active: {active}', {
      count: 42,
      active: true,
    });
    expect(result).toBe('Count: 42, Active: true');
  });

  it('should handle null and undefined values', () => {
    const result = coarInterpolate('Values: {a}, {b}', {
      a: null,
      b: undefined,
    });
    expect(result).toBe('Values: , ');
  });

  it('should not replace non-matching placeholders', () => {
    const result = coarInterpolate('Hello {name}', { other: 'value' });
    expect(result).toBe('Hello ');
  });

  it('should handle templates with no placeholders', () => {
    const result = coarInterpolate('No placeholders here', {
      name: 'Alice',
    });
    expect(result).toBe('No placeholders here');
  });

  it('should handle empty template', () => {
    const result = coarInterpolate('', { name: 'Alice' });
    expect(result).toBe('');
  });

  it('should handle objects and arrays by converting to string', () => {
    const result = coarInterpolate('Data: {obj}, {arr}', {
      obj: { key: 'value' },
      arr: [1, 2, 3],
    });
    expect(result).toBe('Data: [object Object], 1,2,3');
  });
});
