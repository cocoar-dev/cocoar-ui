import { describe, it, expect } from 'vitest';
import { CoarGridColumnFactory } from './coar-grid-column-factory';
import { CoarGridColumnBuilder } from './coar-grid-column-builder';

interface TestRow {
  id: number;
  name: string;
  amount: number;
  date: string;
  status: 'active' | 'inactive';
  isEnabled: boolean;
}

describe('CoarGridColumnFactory', () => {
  describe('field', () => {
    it('should create a column builder for a field', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const builder = factory.field('name');

      expect(builder).toBeInstanceOf(CoarGridColumnBuilder);
    });

    it('should create a column with correct field', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.field('name').build();

      expect(colDef.field).toBe('name');
    });
  });

  describe('date', () => {
    it('should create a date column', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const builder = factory.date('date');

      expect(builder).toBeInstanceOf(CoarGridColumnBuilder);
    });

    it('should create a date column with formatter', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.date('date').build();

      expect(colDef.field).toBe('date');
      expect(colDef.valueFormatter).toBeDefined();
    });

    it('should format date value correctly', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.date('date').build();
      const formatter = colDef.valueFormatter as (params: { value: string }) => string;

      const result = formatter({ value: '2024-01-15' });
      // Result depends on locale, just check it's not empty
      expect(result).toBeTruthy();
    });

    it('should handle empty date value', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.date('date').build();
      const formatter = colDef.valueFormatter as (params: { value: string }) => string;

      const result = formatter({ value: '' });
      expect(result).toBe('');
    });
  });

  describe('number', () => {
    it('should create a number column', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const builder = factory.number('amount');

      expect(builder).toBeInstanceOf(CoarGridColumnBuilder);
    });

    it('should create a number column with formatter', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.number('amount').build();

      expect(colDef.field).toBe('amount');
      expect(colDef.valueFormatter).toBeDefined();
    });

    it('should format number value correctly', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.number('amount').build();
      const formatter = colDef.valueFormatter as (params: { value: number }) => string;

      const result = formatter({ value: 1234 });
      // Format depends on locale but should include digits
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should handle null/undefined number value', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.number('amount').build();
      const formatter = colDef.valueFormatter as (params: { value: number | null }) => string;

      expect(formatter({ value: null })).toBe('');
    });

    it('should right-align numbers', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.number('amount').build();

      expect(colDef.cellClass).toBe('text-right');
    });
  });

  describe('currency', () => {
    it('should create a currency column', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const builder = factory.currency('amount');

      expect(builder).toBeInstanceOf(CoarGridColumnBuilder);
    });

    it('should format currency value correctly', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.currency('amount', 'USD').build();
      const formatter = colDef.valueFormatter as (params: { value: number }) => string;

      const result = formatter({ value: 1234.56 });
      // Should contain dollar sign and value
      expect(result).toMatch(/\$|USD/);
    });

    it('should right-align currency', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.currency('amount').build();

      expect(colDef.cellClass).toBe('text-right');
    });
  });

  describe('boolean', () => {
    it('should create a boolean column', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const builder = factory.boolean('isEnabled');

      expect(builder).toBeInstanceOf(CoarGridColumnBuilder);
    });

    it('should format true as Yes by default', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.boolean('isEnabled').build();
      const formatter = colDef.valueFormatter as (params: { value: boolean }) => string;

      expect(formatter({ value: true })).toBe('Yes');
    });

    it('should format false as No by default', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.boolean('isEnabled').build();
      const formatter = colDef.valueFormatter as (params: { value: boolean }) => string;

      expect(formatter({ value: false })).toBe('No');
    });

    it('should support custom true/false values', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.boolean('isEnabled', { trueValue: 'Active', falseValue: 'Inactive' }).build();
      const formatter = colDef.valueFormatter as (params: { value: boolean }) => string;

      expect(formatter({ value: true })).toBe('Active');
      expect(formatter({ value: false })).toBe('Inactive');
    });
  });
});
