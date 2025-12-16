import { Component, input, ChangeDetectionStrategy, booleanAttribute } from '@angular/core';

export type CoarTableVariant = 'default' | 'plain' | 'bordered';

/**
 * A simple table component that provides consistent styling.
 *
 * Default styling uses alternating row colors (zebra stripes) for readability.
 * Use 'plain' variant for no stripes, or 'bordered' for full cell borders.
 *
 * Usage:
 * ```html
 * <coar-table>
 *   <thead>
 *     <tr>
 *       <th>Property</th>
 *       <th>Type</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td><code>name</code></td>
 *       <td><code>string</code></td>
 *     </tr>
 *   </tbody>
 * </coar-table>
 * ```
 */
@Component({
  selector: 'coar-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="coar-table-wrapper">
      <table class="coar-table">
        <ng-content />
      </table>
    </div>
  `,
  styleUrl: './coar-table.component.css',
  host: {
    '[class.coar-table--plain]': 'variant() === "plain"',
    '[class.coar-table--bordered]': 'variant() === "bordered"',
    '[class.coar-table--compact]': 'compact()',
    '[class.coar-table--hover]': 'hover()',
  },
})
export class CoarTableComponent {
  /** Visual variant of the table: default (zebra stripes), plain (no stripes), bordered (cell borders) */
  variant = input<CoarTableVariant>('default');

  /** Whether to use compact padding */
  compact = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether rows should highlight on hover */
  hover = input<boolean, unknown>(true, { transform: booleanAttribute });
}
