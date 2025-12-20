export interface CoarObserverStub {
  disconnect: () => void;
  observe: (...args: unknown[]) => void;
  unobserve: (...args: unknown[]) => void;
  takeRecords?: () => unknown[];
}

export function stubResizeObserver(): void {
  const globalAny = globalThis as unknown as Record<string, unknown>;
  if (typeof globalAny['ResizeObserver'] === 'function') return;

  class ResizeObserverStub implements CoarObserverStub {
    constructor(_callback: unknown) {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  globalAny['ResizeObserver'] = ResizeObserverStub;
}

export function stubIntersectionObserver(): void {
  const globalAny = globalThis as unknown as Record<string, unknown>;
  if (typeof globalAny['IntersectionObserver'] === 'function') return;

  class IntersectionObserverStub implements CoarObserverStub {
    constructor(_callback: unknown, _options?: unknown) {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  }

  globalAny['IntersectionObserver'] = IntersectionObserverStub;
}

export function stubBrowserObservers(): void {
  stubResizeObserver();
  stubIntersectionObserver();
}
