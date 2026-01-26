/**
 * Configuration for a single markdown file in a tab
 */
export interface ShowcaseMarkdownConfig {
  /** Path to the markdown file */
  path: string;
  /** Display name shown as section header (e.g., "CoarSingleSelectComponent") */
  header: string;
  /** Whether the section starts collapsed. Default: false (expanded) */
  collapsed?: boolean;
  /** ID for deep linking (auto-generated from header if not provided) */
  anchorId?: string;
}

/**
 * Input type for ShowcaseMarkdownTabContentComponent.
 * Supports backwards compatibility with string paths.
 *
 * - `string` - Single markdown file (rendered without header)
 * - `ShowcaseMarkdownConfig` - Single config with header
 * - `ShowcaseMarkdownConfig[]` - Multiple configs with collapsible sections
 */
export type ShowcaseMarkdownInput = string | ShowcaseMarkdownConfig | ShowcaseMarkdownConfig[];
