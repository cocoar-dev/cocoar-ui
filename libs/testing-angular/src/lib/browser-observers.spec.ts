import { describe, expect, it } from 'vitest';

import { stubBrowserObservers } from './browser-observers';

describe('stubBrowserObservers', () => {
  it('defines ResizeObserver and IntersectionObserver when missing', () => {
    const globalAny = globalThis as unknown as Record<string, unknown>;

    delete globalAny['ResizeObserver'];
    delete globalAny['IntersectionObserver'];

    stubBrowserObservers();

    expect(typeof globalAny['ResizeObserver']).toBe('function');
    expect(typeof globalAny['IntersectionObserver']).toBe('function');
  });
});
