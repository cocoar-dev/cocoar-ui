import { describe, expect, it } from 'vitest';

import { provideCoarNoopAnimations } from './animations';

describe('provideCoarNoopAnimations', () => {
  it('returns providers', () => {
    const providers = provideCoarNoopAnimations();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });
});
