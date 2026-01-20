import { describe, it, expect, vi } from 'vitest';
import { CoarGridBuilder } from './coar-grid-builder';

interface TestRow {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

describe('CoarGridBuilder', () => {
  describe('create', () => {
    it('should create a builder instance', () => {
      const builder = CoarGridBuilder.create<TestRow>();
      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });
  });

  describe('columns', () => {
    it('should set column definitions using factory functions', () => {
      const builder = CoarGridBuilder.create<TestRow>()
        .columns([
          col => col.field('name').header('Name'),
          col => col.field('status').header('Status'),
        ]);

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });
  });

  describe('rowData', () => {
    it('should set row data', () => {
      const data: TestRow[] = [
        { id: 1, name: 'Test', status: 'active' },
      ];
      const builder = CoarGridBuilder.create<TestRow>()
        .rowData(data);

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });
  });

  describe('rowSelection', () => {
    it('should configure single row selection', () => {
      const builder = CoarGridBuilder.create<TestRow>()
        .rowSelection('single');

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });

    it('should configure multiple row selection', () => {
      const builder = CoarGridBuilder.create<TestRow>()
        .rowSelection('multiple');

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });
  });

  describe('rowClassRules', () => {
    it('should set row class rules', () => {
      const rules = {
        'row-active': (params: { data?: TestRow }) => params.data?.status === 'active',
      };
      const builder = CoarGridBuilder.create<TestRow>()
        .rowClassRules(rules);

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });
  });

  describe('event handlers', () => {
    it('should set onRowClicked handler', () => {
      const handler = vi.fn();
      const builder = CoarGridBuilder.create<TestRow>()
        .onRowClicked(handler);

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });

    it('should set onRowDoubleClicked handler', () => {
      const handler = vi.fn();
      const builder = CoarGridBuilder.create<TestRow>()
        .onRowDoubleClicked(handler);

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });

    it('should set onCellClicked handler', () => {
      const handler = vi.fn();
      const builder = CoarGridBuilder.create<TestRow>()
        .onCellClicked(handler);

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });
  });

  describe('animateRows', () => {
    it('should enable row animation', () => {
      const builder = CoarGridBuilder.create<TestRow>()
        .animateRows(true);

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });

    it('should disable row animation', () => {
      const builder = CoarGridBuilder.create<TestRow>()
        .animateRows(false);

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });
  });

  describe('fluent chaining', () => {
    it('should support method chaining', () => {
      const data: TestRow[] = [{ id: 1, name: 'Test', status: 'active' }];
      const handler = vi.fn();

      const builder = CoarGridBuilder.create<TestRow>()
        .rowData(data)
        .columns([col => col.field('name')])
        .rowSelection('single')
        .animateRows(true)
        .onRowClicked(handler);

      expect(builder).toBeInstanceOf(CoarGridBuilder);
    });
  });
});
