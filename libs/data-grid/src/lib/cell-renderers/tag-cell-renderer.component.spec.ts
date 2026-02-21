import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import type { ICellRendererParams } from 'ag-grid-community';

import { CoarTagCellRendererComponent } from './tag-cell-renderer.component';

describe('CoarTagCellRendererComponent', () => {
  it('prefers valueFormatted over the raw value for primitives', async () => {
    await TestBed.configureTestingModule({
      imports: [CoarTagCellRendererComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CoarTagCellRendererComponent);
    const component = fixture.componentInstance;

    component.agInit({
      value: false,
      valueFormatted: 'Inactive',
    } as unknown as ICellRendererParams);

    expect(component.tags.map((t) => t.label)).toEqual(['Inactive']);
  });

  it('preserves structured values (arrays) even when valueFormatted is present', async () => {
    await TestBed.configureTestingModule({
      imports: [CoarTagCellRendererComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CoarTagCellRendererComponent);
    const component = fixture.componentInstance;

    component.agInit({
      value: ['Active', 'Locked'],
      valueFormatted: 'Active, Locked',
    } as unknown as ICellRendererParams);

    expect(component.tags.map((t) => t.label)).toEqual(['Active', 'Locked']);
  });
});
