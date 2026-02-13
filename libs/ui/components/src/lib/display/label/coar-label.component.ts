import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input,
  ViewEncapsulation,
  booleanAttribute,
} from '@angular/core';

/**
 * Available sizes for the label component.
 * Matches the component size system used by buttons and inputs.
 */
export type CoarLabelSize = 'xs' | 's' | 'm' | 'l';

/**
 * Standalone label component for consistent form labeling across the design system.
 *
 * @example
 * ```html
 * <coar-label size="s" [required]="true">Email Address</coar-label>
 * <coar-text-input size="s" placeholder="your@email.com" />
 * ```
 */
@Component({
  selector: 'coar-label',
  standalone: true,
  template: `
    @if (text()) {
    {{ text() }}
    } @else {
    <ng-content></ng-content>
    } @if (required()) {
    <span class="coar-label-required" aria-hidden="true">*</span>
    }
  `,
  styleUrl: './coar-label.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'coar-label',
  },
})
export class CoarLabelComponent {
  /**
   * Size of the label. Should match the size of the associated input/form element.
   * @default 'm'
   */
  readonly size = input<CoarLabelSize>('m');

  /**
   * Whether to show a required indicator (*) after the label text.
   * @default false
   */
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });

  /**
   * The ID of the form element this label is associated with.
   * Sets the 'for' attribute for accessibility.
   */
  readonly for = input<string | undefined>(undefined);

  readonly text = input<string>('');

  @HostBinding('class.coar-label--xs')
  get isXs(): boolean {
    return this.size() === 'xs';
  }

  @HostBinding('class.coar-label--s')
  get isSm(): boolean {
    return this.size() === 's';
  }

  @HostBinding('class.coar-label--m')
  get isMd(): boolean {
    return this.size() === 'm';
  }

  @HostBinding('class.coar-label--l')
  get isLg(): boolean {
    return this.size() === 'l';
  }

  @HostBinding('attr.for')
  get forAttr(): string | null {
    return this.for() ?? null;
  }
}
