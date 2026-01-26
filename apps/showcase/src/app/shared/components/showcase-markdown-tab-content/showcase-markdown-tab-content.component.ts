import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  inject,
  computed,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CoarIconComponent, CoarNoteComponent } from '@cocoar/ui-components';
import { CoarMarkdownComponent } from '@cocoar/markdown-viewer';
import { combineLatest, map, of, switchMap } from 'rxjs';

import {
  ShowcaseMarkdownDocsService,
  type ShowcaseMarkdownDocState,
} from '../../services/showcase-markdown-docs.service';
import type { ShowcaseMarkdownInput } from './showcase-markdown-config';

/** Internal config with all fields resolved */
interface NormalizedConfig {
  path: string;
  header: string;
  anchorId: string;
  initiallyCollapsed: boolean;
}

/**
 * Generate a URL-safe anchor ID from a header string.
 * Example: "CoarSingleSelectComponent" -> "coar-single-select-component"
 */
function generateAnchorId(header: string): string {
  return header
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Normalize input to an array of configs with all fields resolved.
 */
function normalizeInput(source: ShowcaseMarkdownInput): NormalizedConfig[] {
  if (typeof source === 'string') {
    // Single path string - render without header (legacy mode)
    return [
      {
        path: source,
        header: '',
        anchorId: '',
        initiallyCollapsed: false,
      },
    ];
  }

  if (Array.isArray(source)) {
    return source.map((config) => ({
      path: config.path,
      header: config.header,
      anchorId: config.anchorId || generateAnchorId(config.header),
      initiallyCollapsed: config.collapsed ?? false,
    }));
  }

  // Single config object
  return [
    {
      path: source.path,
      header: source.header,
      anchorId: source.anchorId || generateAnchorId(source.header),
      initiallyCollapsed: source.collapsed ?? false,
    },
  ];
}

@Component({
  selector: 'app-showcase-markdown-tab-content',
  standalone: true,
  imports: [CommonModule, CoarMarkdownComponent, CoarIconComponent, CoarNoteComponent],
  templateUrl: './showcase-markdown-tab-content.component.html',
  styleUrl: './showcase-markdown-tab-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseMarkdownTabContentComponent {
  private readonly markdownDocs = inject(ShowcaseMarkdownDocsService);

  /**
   * Input: string path, single config, or array of configs.
   * For backwards compatibility, this is named `path` to match existing templates.
   */
  path = input.required<ShowcaseMarkdownInput>();

  /** Normalized configs with all fields resolved */
  protected readonly normalizedConfigs = computed(() => normalizeInput(this.path()));

  /** Whether to render in single mode (no header) or multi mode (collapsible sections) */
  protected readonly isSingleMode = computed(() => {
    const configs = this.normalizedConfigs();
    // Single mode if there's exactly one config with no header
    return configs.length === 1 && !configs[0].header;
  });

  /** Track collapsed state for each section */
  protected readonly collapsedStates = signal<boolean[]>([]);

  /** Load states for all markdown configs */
  protected readonly states = toSignal(
    toObservable(this.normalizedConfigs).pipe(
      switchMap((configs) => {
        if (configs.length === 0) {
          return of([]);
        }

        // Initialize collapsed states based on config
        this.collapsedStates.set(configs.map((c) => c.initiallyCollapsed));

        // Load all markdown files
        const loads$ = configs.map((config) => this.markdownDocs.load(config.path));
        return combineLatest(loads$);
      }),
      map((states) => states as ShowcaseMarkdownDocState[])
    ),
    { initialValue: [] }
  );

  /** Toggle collapsed state for a section */
  protected toggleSection(index: number): void {
    this.collapsedStates.update((states) => {
      const newStates = [...states];
      newStates[index] = !newStates[index];
      return newStates;
    });
  }
}
