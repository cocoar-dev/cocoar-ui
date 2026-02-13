import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  input,
  model,
  output,
  booleanAttribute,
} from '@angular/core';

import {
  CoarControlValueAccessor,
  coarProvideValueAccessor,
} from '../_base/coar-control-value-accessor';
import { CoarRadioComponent } from './coar-radio.component';

export type RadioGroupOrientation = 'horizontal' | 'vertical';
export type RadioGroupSize = 's' | 'm' | 'l';

/**
 * Radio group component for single-choice selection.
 *
 * @example
 * ```html
 * <coar-radio-group [(ngModel)]="selectedValue" name="options">
 *   <coar-radio value="a">Option A</coar-radio>
 *   <coar-radio value="b">Option B</coar-radio>
 *   <coar-radio value="c" [disabled]="true">Option C (disabled)</coar-radio>
 * </coar-radio-group>
 * ```
 */
@Component({
  selector: 'coar-radio-group',
  standalone: true,
  imports: [],
  templateUrl: './coar-radio-group.component.html',
  styleUrl: './coar-radio-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarRadioGroupComponent)],
  host: {
    role: 'radiogroup',
    '[class.coar-radio-group--horizontal]': 'orientation() === "horizontal"',
    '[class.coar-radio-group--vertical]': 'orientation() === "vertical"',
    '[class.coar-radio-group--s]': 'size() === "s"',
    '[class.coar-radio-group--m]': 'size() === "m"',
    '[class.coar-radio-group--l]': 'size() === "l"',
    '[class.coar-radio-group--disabled]': 'isDisabled()',
    '[class.coar-radio-group--error]': 'hasError()',
    '[attr.aria-label]': 'label()',
    '[attr.aria-describedby]': 'hasMessage() ? messageId() : null',
  },
})
export class CoarRadioGroupComponent<T = unknown> extends CoarControlValueAccessor<T> {
  /** Currently selected value */
  value = model<T | undefined>(undefined);

  /** Group name for radio inputs */
  name = input.required<string>();

  /** Accessible label for the group */
  label = input<string>('');

  /** Layout orientation */
  orientation = input<RadioGroupOrientation>('vertical');

  /** Size of radio buttons */
  size = input<RadioGroupSize>('m');

  /** Disables all radio buttons in the group */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Marks the group as required */
  required = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Error message to display */
  error = input<string>('');

  /** Hint text displayed below the group */
  hint = input<string>('');

  /** Emits when selection changes */
  valueChange = output<T>();

  /** Query all child radio components */
  private readonly radios = contentChildren(forwardRef(() => CoarRadioComponent));

  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected hasError = computed(() => this.error().length > 0);
  protected displayMessage = computed(() => this.error() || this.hint());
  protected hasMessage = computed(() => this.displayMessage().length > 0);
  private readonly autoId = `coar-radio-group-${cryptoRandomId()}`;
  protected messageId = computed(() => `${this.autoId}-message`);

  /** Called by child radio when selected */
  selectValue(newValue: T): void {
    if (this.isDisabled()) return;

    this.value.set(newValue);
    this.valueChange.emit(newValue);
    this.cvaOnChange(newValue);
  }

  /** Check if a value is currently selected */
  isSelected(checkValue: T): boolean {
    return this.value() === checkValue;
  }

  /** Check if group is disabled (exposed for child components) */
  isGroupDisabled(): boolean {
    return this.isDisabled();
  }

  // CVA implementation
  override writeValue(value: T): void {
    this.value.set(value);
  }
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}
