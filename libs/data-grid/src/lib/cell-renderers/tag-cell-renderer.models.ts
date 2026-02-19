import type { TagVariant, TagSize } from '@cocoar/ui/components';

export interface TagCellRendererConfig {
  /** Delimiter to split a string value into multiple tags (default: ',') */
  separator?: string;
  /** Default variant applied to all tags */
  variant?: TagVariant;
  /** Map a tag value to a specific variant */
  variantMap?: Record<string, TagVariant>;
  /** Tag size (default: 's') */
  size?: TagSize;
  /** Prefix for i18n translation keys (optional). When set, translates via `i18n.t(prefix + value)` */
  i18nPrefix?: string;
  /** Property name to read the label from when values are objects */
  labelProperty?: string;
}
