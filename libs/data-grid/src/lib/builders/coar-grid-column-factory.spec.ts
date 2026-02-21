import { describe, it, expect } from 'vitest';
import { CoarGridColumnFactory } from './coar-grid-column-factory';
import { CoarGridColumnBuilder } from './coar-grid-column-builder';
import { CoarTagCellRendererComponent } from '../cell-renderers/tag-cell-renderer.component';
import { CoarIconCellRendererComponent } from '../cell-renderers/icon-cell-renderer.component';
import { CoarDateCellRendererComponent } from '../cell-renderers/date-cell-renderer.component';

interface TestRow {
  id: number;
  name: string;
  amount: number;
  date: string;
  status: 'active' | 'inactive';
  tags: string;
  icon: string;
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

    it('should disable cell data type inference to avoid checkbox rendering', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.boolean('isEnabled').build();

      expect(colDef.cellDataType).toBe(false);
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
      const colDef = factory
        .boolean('isEnabled', { trueValue: 'Active', falseValue: 'Inactive' })
        .build();
      const formatter = colDef.valueFormatter as (params: { value: boolean }) => string;

      expect(formatter({ value: true })).toBe('Active');
      expect(formatter({ value: false })).toBe('Inactive');
    });
  });

  describe('tag', () => {
    it('should create a tag column builder', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const builder = factory.tag('tags');

      expect(builder).toBeInstanceOf(CoarGridColumnBuilder);
    });

    it('should set the correct field', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.tag('tags').build();

      expect(colDef.field).toBe('tags');
    });

    it('should configure the tag cell renderer component', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.tag('tags').build();

      expect(colDef.cellRenderer).toBe(CoarTagCellRendererComponent);
    });

    it('should pass config via cellRendererParams', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const config = { variantMap: { active: 'success' as const }, size: 's' as const };
      const colDef = factory.tag('tags', config).build();

      expect(colDef.cellRendererParams?.['config']).toEqual(config);
    });

    it('should enable sorting by default', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.tag('tags').build();

      expect(colDef.sortable).toBe(true);
    });

    it('should set a comparator for tag sorting', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.tag('tags').build();

      expect(colDef.comparator).toBeDefined();
    });

    it('should sort string tag values alphabetically', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.tag('tags').build();
      const comparator = colDef.comparator as (a: unknown, b: unknown) => number;

      expect(comparator('b,a', 'a,b')).toBe(0); // same tags, different order
      expect(comparator('alpha', 'beta')).toBeLessThan(0);
      expect(comparator('beta', 'alpha')).toBeGreaterThan(0);
    });

    it('should sort array tag values alphabetically', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.tag('tags').build();
      const comparator = colDef.comparator as (a: unknown, b: unknown) => number;

      expect(comparator(['b', 'a'], ['a', 'b'])).toBe(0);
      expect(comparator(['alpha'], ['beta'])).toBeLessThan(0);
    });
  });

  describe('icon', () => {
    it('should create an icon column builder', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const builder = factory.icon('icon');

      expect(builder).toBeInstanceOf(CoarGridColumnBuilder);
    });

    it('should set the correct field', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.icon('icon').build();

      expect(colDef.field).toBe('icon');
    });

    it('should configure the icon cell renderer component', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.icon('icon').build();

      expect(colDef.cellRenderer).toBe(CoarIconCellRendererComponent);
    });

    it('should pass config via cellRendererParams', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const config = { size: 's' as const, color: 'red' };
      const colDef = factory.icon('icon', config).build();

      expect(colDef.cellRendererParams?.['config']).toEqual(config);
    });

    it('should use empty config when none provided', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.icon('icon').build();

      expect(colDef.cellRendererParams?.['config']).toEqual({});
    });
  });

  describe('localDate', () => {
    it('should create a localDate column builder', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const builder = factory.localDate('date');

      expect(builder).toBeInstanceOf(CoarGridColumnBuilder);
    });

    it('should set the correct field', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.localDate('date').build();

      expect(colDef.field).toBe('date');
    });

    it('should configure the date cell renderer component', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.localDate('date').build();

      expect(colDef.cellRenderer).toBe(CoarDateCellRendererComponent);
    });

    it('should enable sorting by default', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const colDef = factory.localDate('date').build();

      expect(colDef.sortable).toBe(true);
    });

    it('should pass config via cellRendererParams', () => {
      const factory = new CoarGridColumnFactory<TestRow>();
      const config = { showSeconds: true };
      const colDef = factory.localDate('date', config).build();

      expect(colDef.cellRendererParams?.['config']).toEqual(config);
    });
  });
});
