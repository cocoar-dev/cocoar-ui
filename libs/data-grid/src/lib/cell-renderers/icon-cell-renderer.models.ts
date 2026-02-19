import type { CoarIconSize } from '@cocoar/ui/components';
import type { ICellRendererParams } from 'ag-grid-community';

export interface IconCellRendererConfig {
  /** Icon size (default: 's') */
  size?: CoarIconSize;
  /** Icon source registry key */
  source?: string;
  /** CSS color value for the icon */
  color?: string;
  /** Click handler — when set, the icon becomes clickable */
  onClick?: (params: ICellRendererParams) => void;
}
