import { describe, expect, it } from 'vitest';
import { renderCoarComponent } from '@cocoar/testing-angular';

import { CoarTagCellRendererComponent } from './tag-cell-renderer.component';

describe('CoarTagCellRendererComponent', () => {
  it('prefers valueFormatted over the raw value for primitives', async () => {
    const fixture = await renderCoarComponent(CoarTagCellRendererComponent);
    const component = fixture.componentInstance;

    component.agInit({
      value: false,
      valueFormatted: 'Inactive',
    } as any);

    expect(component.tags.map((t) => t.label)).toEqual(['Inactive']);
  });

  it('preserves structured values (arrays) even when valueFormatted is present', async () => {
    const fixture = await renderCoarComponent(CoarTagCellRendererComponent);
    const component = fixture.componentInstance;

    component.agInit({
      value: ['Active', 'Locked'],
      valueFormatted: 'Active, Locked',
    } as any);

    expect(component.tags.map((t) => t.label)).toEqual(['Active', 'Locked']);
  });
});
