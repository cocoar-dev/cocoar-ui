import { describe, expect, it } from 'vitest';

import {
  cleanupCoarOverlays,
  createCoarOverlayAttachmentResolver,
  createCoarOverlayTestContainer,
} from './overlay-testing';

describe('overlay-testing', () => {
  it('creates and cleans up a container', () => {
    const { container, cleanup } = createCoarOverlayTestContainer();

    expect(document.body.contains(container)).toBe(true);

    cleanup();
    expect(document.body.contains(container)).toBe(false);
  });

  it('attachment resolver only sets attachment when missing by default', () => {
    const { container, cleanup } = createCoarOverlayTestContainer();
    const resolver = createCoarOverlayAttachmentResolver(container);

    const unchanged = resolver({ attachment: { strategy: 'body' } });
    expect(unchanged).toEqual({ attachment: { strategy: 'body' } });

    const changed = resolver({});
    expect(changed).toMatchObject({ attachment: { strategy: 'parent', container } });

    cleanup();
  });

  it('cleanupCoarOverlays removes known overlay nodes', () => {
    const host = document.createElement('div');
    host.className = 'coar-overlay-host';
    document.body.appendChild(host);

    const backdrop = document.createElement('div');
    backdrop.className = 'coar-overlay-backdrop';
    document.body.appendChild(backdrop);

    cleanupCoarOverlays();

    expect(document.body.querySelector('.coar-overlay-host')).toBeNull();
    expect(document.body.querySelector('.coar-overlay-backdrop')).toBeNull();
  });
});
