import { ChangeDetectionStrategy, Component, input, output, booleanAttribute } from '@angular/core';

/**
 * Tag semantic variants - mirrors CardVariant for visual consistency.
 * Tags are the "little brother" of Cards with the same variant system.
 */
export type TagVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent';

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
 * Shares the same variant system as CoarCard for visual consistency.
 *
 * Unlike badges (pill-shaped, for counts/notifications), tags use
 * slight rounding and support interactive features like closing.
 *
 * @example
 * ```html
 * <coar-tag>Default</coar-tag>
 * <coar-tag variant="success">Published</coar-tag>
 * <coar-tag variant="warning" closable (closed)="onRemove()">Draft</coar-tag>
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
    // Variants
    '[class.coar-tag--neutral]': 'variant() === "neutral"',
    '[class.coar-tag--success]': 'variant() === "success"',
    '[class.coar-tag--warning]': 'variant() === "warning"',
    '[class.coar-tag--error]': 'variant() === "error"',
    '[class.coar-tag--info]': 'variant() === "info"',
    '[class.coar-tag--accent]': 'variant() === "accent"',
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
   * By default (false), tags have a visible border matching their variant.
   * Use as boolean attribute: `<coar-tag borderless>` or `[borderless]="true"`
   */
  borderless = input(false, { transform: booleanAttribute });

  /** Tag semantic variant - matches Card variants */
  variant = input<TagVariant>('neutral');

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
