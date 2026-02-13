import { ChangeDetectionStrategy, Component, input, output, booleanAttribute } from '@angular/core';

/**
 * Tag color variants - mirrors CardColor for visual consistency.
 * Tags are the "little brother" of Cards with the same color system.
 */
export type TagColor = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent';

/**
 * Tag size variants.
 * - s: Compact tags for dense UIs (10px font)
 * - m: Default size (12px font)
 * - l: Larger tags for emphasis (14px font)
 */
export type TagSize = 's' | 'm' | 'l';

/**
 * CoarTagComponent
 *
 * A compact label component for categorizing, labeling, or marking content.
 * Shares the same color system as CoarCard for visual consistency.
 *
 * Unlike badges (pill-shaped, for counts/notifications), tags use
 * slight rounding and support interactive features like closing.
 *
 * @example
 * ```html
 * <coar-tag>Default</coar-tag>
 * <coar-tag color="success">Published</coar-tag>
 * <coar-tag color="warning" closable (closed)="onRemove()">Draft</coar-tag>
 * ```
 */
@Component({
  selector: 'coar-tag',
  standalone: true,
  templateUrl: './coar-tag.component.html',
  styleUrl: './coar-tag.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'coar-tag',
    // Size
    '[class.coar-tag--s]': 'size() === "s"',
    '[class.coar-tag--m]': 'size() === "m"',
    '[class.coar-tag--l]': 'size() === "l"',
    // Elevated (box-shadow for depth)
    '[class.coar-tag--elevated]': 'elevated()',
    // Borderless (no border)
    '[class.coar-tag--borderless]': 'borderless()',
    // Colors
    '[class.coar-tag--neutral]': 'color() === "neutral"',
    '[class.coar-tag--success]': 'color() === "success"',
    '[class.coar-tag--warning]': 'color() === "warning"',
    '[class.coar-tag--error]': 'color() === "error"',
    '[class.coar-tag--info]': 'color() === "info"',
    '[class.coar-tag--accent]': 'color() === "accent"',
  },
})
export class CoarTagComponent {
  /**
   * Adds a box-shadow for elevation/depth.
   * Use as boolean attribute: `<coar-tag elevated>` or `[elevated]="true"`
   */
  elevated = input(false, { transform: booleanAttribute });

  /**
   * Removes the border from the tag, leaving only background color.
   * By default (false), tags have a visible border matching their color.
   * Use as boolean attribute: `<coar-tag borderless>` or `[borderless]="true"`
   */
  borderless = input(false, { transform: booleanAttribute });

  /** Tag color scheme - matches Card colors */
  color = input<TagColor>('neutral');

  /** Tag size */
  size = input<TagSize>('m');

  /** Whether the tag can be closed/removed */
  closable = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Emitted when the close button is clicked */
  closed = output<void>();

  /** Handle close button click */
  protected onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.closed.emit();
  }
}
