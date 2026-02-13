import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Content alignment options for the divider.
 * - 'center': Content is centered with lines on both sides (default)
 * - 'left': Content is aligned left with line on the right
 * - 'right': Content is aligned right with line on the left
 */
export type DividerAlign = 'left' | 'center' | 'right';

/**
 * Visual style variants for the divider line.
 * - 'subtle': Light, unobtrusive divider (default)
 * - 'strong': More prominent divider
 */
export type DividerVariant = 'subtle' | 'strong';

/**
 * A flexible divider component for visually separating content sections.
 *
 * Supports optional content (text, icons, etc.) via ng-content that can be
 * aligned left, center, or right. When content is present, the divider line
 * splits around it.
 *
 * @example
 * <!-- Simple divider -->
 * <coar-divider />
 *
 * @example
 * <!-- Divider with centered text -->
 * <coar-divider>OR</coar-divider>
 *
 * @example
 * <!-- Divider with left-aligned content -->
 * <coar-divider align="left">Section Title</coar-divider>
 */
@Component({
  selector: 'coar-divider',
  standalone: true,
  templateUrl: './coar-divider.component.html',
  styleUrl: './coar-divider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'separator',
    '[attr.aria-orientation]': '"horizontal"',
    '[class.coar-divider]': 'true',
    '[class.coar-divider--subtle]': 'variant() === "subtle"',
    '[class.coar-divider--strong]': 'variant() === "strong"',
    '[class.coar-divider--left]': 'align() === "left"',
    '[class.coar-divider--center]': 'align() === "center"',
    '[class.coar-divider--right]': 'align() === "right"',
  },
})
export class CoarDividerComponent {
  /** Content alignment when ng-content is provided */
  align = input<DividerAlign>('center');

  /** Visual style variant */
  variant = input<DividerVariant>('subtle');

  /** Width of the divider as a percentage (0-100) */
  width = input<number>(90);

  /** Spacing above the divider in pixels */
  spacingTop = input<number>(0);

  /** Spacing below the divider in pixels */
  spacingBottom = input<number>(0);
}
