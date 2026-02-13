import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';


export type CardColor = 'neutral' | 'outlined' | 'success' | 'warning' | 'error' | 'info' | 'accent';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

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
    // Colors
    '[class.coar-card--neutral]': 'color() === "neutral"',
    '[class.coar-card--outlined]': 'color() === "outlined"',
    '[class.coar-card--success]': 'color() === "success"',
    '[class.coar-card--warning]': 'color() === "warning"',
    '[class.coar-card--error]': 'color() === "error"',
    '[class.coar-card--info]': 'color() === "info"',
    '[class.coar-card--accent]': 'color() === "accent"',
    // Padding
    '[class.coar-card--padding-none]': 'padding() === "none"',
    '[class.coar-card--padding-sm]': 'padding() === "sm"',
    '[class.coar-card--padding-md]': 'padding() === "md"',
    '[class.coar-card--padding-lg]': 'padding() === "lg"',
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
   * By default (false), cards have a visible border matching their color.
   * Use as boolean attribute: `<coar-card borderless>` or `[borderless]="true"`
   */
  borderless = input(false, { transform: booleanAttribute });

  /** Card color scheme */
  color = input<CardColor>('neutral');

  /** Card padding size */
  padding = input<CardPadding>('md');
}
