import { describe, it, expect } from 'vitest';
import { CoarGridColumnBuilder } from './coar-grid-column-builder';

interface TestRow {
  id: number;
  name: string;
  amount: number;
  status: 'active' | 'inactive';
}

describe('CoarGridColumnBuilder', () => {
  describe('constructor', () => {
    it('should create a column with field name', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name').build();

      expect(colDef.field).toBe('name');
      expect(colDef.headerName).toBe('name');
      expect(colDef.resizable).toBe(true);
      expect(colDef.sortable).toBe(false);
    });

    it('should create a column without field name', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>().build();

      expect(colDef.field).toBeUndefined();
    });
  });

  describe('header', () => {
    it('should set header name', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .header('Full Name')
        .build();

      expect(colDef.headerName).toBe('Full Name');
    });
  });

  describe('width and sizing', () => {
    it('should set fixed width', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .width(150)
        .build();

      expect(colDef.width).toBe(150);
    });

    it('should set min width', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .minWidth(100)
        .build();

      expect(colDef.minWidth).toBe(100);
    });

    it('should set max width', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .maxWidth(300)
        .build();

      expect(colDef.maxWidth).toBe(300);
    });

    it('should set flex', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .flex(2)
        .build();

      expect(colDef.flex).toBe(2);
    });

    it('should set fixed width with min/max', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .fixedWidth(150)
        .build();

      expect(colDef.width).toBe(150);
      expect(colDef.minWidth).toBe(150);
      expect(colDef.maxWidth).toBe(150);
    });
  });

  describe('sorting', () => {
    it('should enable sorting', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .sortable()
        .build();

      expect(colDef.sortable).toBe(true);
    });

    it('should disable sorting explicitly', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .sortable(false)
        .build();

      expect(colDef.sortable).toBe(false);
    });
  });

  describe('pinning', () => {
    it('should pin column to left', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .pinned('left')
        .build();

      expect(colDef.pinned).toBe('left');
    });

    it('should pin column to right', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .pinned('right')
        .build();

      expect(colDef.pinned).toBe('right');
    });
  });

  describe('valueFormatter', () => {
    it('should set value formatter function', () => {
      const formatter = (params: { value: string }) => params.value.toUpperCase();
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .valueFormatter(formatter)
        .build();

      expect(colDef.valueFormatter).toBe(formatter);
    });
  });

  describe('cellClass', () => {
    it('should set static cell class', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('status')
        .cellClass('status-cell')
        .build();

      expect(colDef.cellClass).toBe('status-cell');
    });

    it('should set dynamic cell class function', () => {
      const classFn = (params: { value: string }) =>
        params.value === 'active' ? 'status-active' : 'status-inactive';

      const colDef = new CoarGridColumnBuilder<TestRow>('status')
        .cellClass(classFn)
        .build();

      expect(colDef.cellClass).toBe(classFn);
    });
  });

  describe('hidden', () => {
    it('should hide column', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('id')
        .hidden()
        .build();

      expect(colDef.hide).toBe(true);
    });

    it('should conditionally hide column', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('id')
        .hidden(false)
        .build();

      expect(colDef.hide).toBe(false);
    });
  });

  describe('resizable', () => {
    it('should make column resizable', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .resizable()
        .build();

      expect(colDef.resizable).toBe(true);
    });

    it('should disable column resizing', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .resizable(false)
        .build();

      expect(colDef.resizable).toBe(false);
    });
  });

  describe('fluent chaining', () => {
    it('should support method chaining', () => {
      const colDef = new CoarGridColumnBuilder<TestRow>('name')
        .header('Full Name')
        .width(200)
        .minWidth(100)
        .maxWidth(400)
        .sortable()
        .pinned('left')
        .build();

      expect(colDef.field).toBe('name');
      expect(colDef.headerName).toBe('Full Name');
      expect(colDef.width).toBe(200);
      expect(colDef.minWidth).toBe(100);
      expect(colDef.maxWidth).toBe(400);
      expect(colDef.sortable).toBe(true);
      expect(colDef.pinned).toBe('left');
    });
  });
});
