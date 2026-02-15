import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';


export type CardVariant = 'neutral' | 'outlined' | 'success' | 'warning' | 'error' | 'info' | 'accent';
export type CardPadding = 'none' | 's' | 'm' | 'l';

@Component({
  selector: 'coar-card',
  standalone: true,
  imports: [],
  templateUrl: './coar-card.component.html',
  styleUrls: ['./coar-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.coar-card]': 'true',
    // Elevated (box-shadow for depth)
    '[class.coar-card--elevated]': 'elevated()',
    // Borderless (no border) - default is false, so cards have borders by default
    '[class.coar-card--borderless]': 'borderless()',
    // Variants
    '[class.coar-card--neutral]': 'variant() === "neutral"',
    '[class.coar-card--outlined]': 'variant() === "outlined"',
    '[class.coar-card--success]': 'variant() === "success"',
    '[class.coar-card--warning]': 'variant() === "warning"',
    '[class.coar-card--error]': 'variant() === "error"',
    '[class.coar-card--info]': 'variant() === "info"',
    '[class.coar-card--accent]': 'variant() === "accent"',
    // Padding
    '[class.coar-card--padding-none]': 'padding() === "none"',
    '[class.coar-card--padding-s]': 'padding() === "s"',
    '[class.coar-card--padding-m]': 'padding() === "m"',
    '[class.coar-card--padding-l]': 'padding() === "l"',
  },
})
export class CoarCardComponent {
  /**
   * Adds a box-shadow for elevation/depth.
   * Use as boolean attribute: `<coar-card elevated>` or `[elevated]="true"`
   */
  elevated = input(false, { transform: booleanAttribute });

  /**
   * Removes the border from the card, leaving only background color.
   * By default (false), cards have a visible border matching their variant.
   * Use as boolean attribute: `<coar-card borderless>` or `[borderless]="true"`
   */
  borderless = input(false, { transform: booleanAttribute });

  /** Card semantic variant */
  variant = input<CardVariant>('neutral');

  /** Card padding size */
  padding = input<CardPadding>('m');
}
