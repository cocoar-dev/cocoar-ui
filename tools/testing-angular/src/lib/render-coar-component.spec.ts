import { Component } from '@angular/core';
import { describe, expect, it } from 'vitest';

import { renderCoarComponent } from './render-coar-component';
import { queryRequired } from './dom';

@Component({
  standalone: true,
  template: '<button type="button">{{label}}</button>',
})
class TestStandaloneComponent {
  label = 'Hello';
}

describe('renderCoarComponent', () => {
  it('renders a standalone component', async () => {
    const fixture = await renderCoarComponent(TestStandaloneComponent);

    const button = queryRequired<HTMLButtonElement>(fixture.nativeElement, 'button');
    expect(button.textContent?.trim()).toBe('Hello');
  });

  it('applies inputs before initial detectChanges', async () => {
    const fixture = await renderCoarComponent(TestStandaloneComponent, {
      inputs: { label: 'Updated' },
    });

    const button = queryRequired<HTMLButtonElement>(fixture.nativeElement, 'button');
    expect(button.textContent?.trim()).toBe('Updated');
  });
});
