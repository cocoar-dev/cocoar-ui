export type OverlaySpecResolverLike = (spec: Record<string, unknown>) => Record<string, unknown>;

export interface CreateCoarOverlayAttachmentResolverOptions {
  /**
   * If true, override explicit attachment config. Default is false.
   * In most tests you want to only provide a default when the spec omits attachment.
   */
  force?: boolean;
}

export function createCoarOverlayAttachmentResolver(
  container: HTMLElement,
  options: CreateCoarOverlayAttachmentResolverOptions = {}
): OverlaySpecResolverLike {
  return (spec) => {
    if (options.force) {
      return {
        ...spec,
        attachment: { strategy: 'parent', container },
      };
    }

    if (spec['attachment'] != null) return spec;

    return {
      ...spec,
      attachment: { strategy: 'parent', container },
    };
  };
}

export function cleanupCoarOverlays(root: ParentNode = document.body): void {
  if (!root) return;

  for (const el of Array.from(
    root.querySelectorAll('.coar-overlay-host, .coar-overlay-backdrop')
  )) {
    el.remove();
  }
}

export function createCoarOverlayTestContainer(): {
  container: HTMLElement;
  cleanup: () => void;
} {
  const container = document.createElement('div');
  container.className = 'coar-overlay-test-container';
  document.body.appendChild(container);

  return {
    container,
    cleanup: () => {
      cleanupCoarOverlays(container);
      container.remove();
    },
  };
}
