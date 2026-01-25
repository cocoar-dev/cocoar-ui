import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  output,
  TemplateRef,
  viewChild,
  booleanAttribute,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import { Maskito } from '@maskito/core';
import { maskitoDateOptionsGenerator } from '@maskito/kit';

import { type Placement } from '@cocoar/ui-overlay';

import { CoarIconComponent } from '../../display/icon/coar-icon.component';
import { CoarScrollableCalendarComponent } from '../scrollable-calendar/coar-scrollable-calendar.component';
import { CoarScrollbarDirective } from '../../display/scrollbar/coar-scrollbar.directive';
import { coarProvideValueAccessor } from '../../forms/_base/coar-control-value-accessor';
import type { DateFormatConfig } from '../_shared/coar-date-format';
import type { CoarDateMarker } from '../_shared/coar-date-marker';
import {
  coarFormatPlainDate,
  coarParsePlainDateFromInput,
  coarTemporalPlainDateToDate,
} from '../_shared/coar-date-helpers';
import { CoarDatePickerBase, type CoarDatePickerSize } from '../_shared/coar-date-picker-base';

// Re-export size type for backward compatibility
export type CoarPlainDatePickerSize = CoarDatePickerSize;

/**
 * Date picker component with scrollable calendar.
 *
 * Returns strongly-typed `Temporal.PlainDate` values (timezone-independent, date only).
 *
 * Features:
 * - Two-column layout: scrollable calendar on left, month list on right
 * - No time selection (use `coar-plain-date-time-picker` if time is needed)
 * - CSS-based virtualization for smooth scrolling through months
 *
 * @example
 * ```html
 * <coar-plain-date-picker
 *   [(value)]="birthDate"
 *   label="Date of Birth"
 * />
 * ```
 */
@Component({
  selector: 'coar-plain-date-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarIconComponent,
    CoarScrollableCalendarComponent,
    CoarScrollbarDirective,
  ],
  templateUrl: './coar-plain-date-picker.component.html',
  styleUrl: './coar-plain-date-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarPlainDatePickerComponent)],
  host: {
    '[class.coar-plain-date-picker--xs]': 'size() === "xs"',
    '[class.coar-plain-date-picker--sm]': 'size() === "sm"',
    '[class.coar-plain-date-picker--md]': 'size() === "md"',
    '[class.coar-plain-date-picker--lg]': 'size() === "lg"',
    '[class.coar-plain-date-picker--disabled]': 'isDisabled()',
    '[class.coar-plain-date-picker--readonly]': 'readonly()',
    '[class.coar-plain-date-picker--error]': 'hasError()',
    '[class.coar-plain-date-picker--open]': 'isOpen()',
  },
})
export class CoarPlainDatePickerComponent extends CoarDatePickerBase<Temporal.PlainDate> {
  /** Maskito instance for input masking */
  private maskitoInstance?: Maskito;

  // ============================================================
  // Date Picker Specific Inputs
  // ============================================================

  /** Minimum selectable date */
  min = input<Temporal.PlainDate | null>(null);

  /** Maximum selectable date */
  max = input<Temporal.PlainDate | null>(null);

  /** Whether to close the panel after selecting a date (default: false to allow viewing events) */
  closeOnSelect = input<boolean, unknown>(false, { transform: booleanAttribute });

  // ============================================================
  // Model & Outputs
  // ============================================================

  /** Current selected value (two-way bindable with [(value)]) */
  value = model<Temporal.PlainDate | null>(null);

  /** Emitted when the selected value changes */
  valueChange = output<Temporal.PlainDate | null>();

  // ============================================================
  // Internal State
  // ============================================================

  /** Unique ID counter for component instances */
  private static nextId = 0;

  /** Unique ID for this component instance */
  private readonly uid = `coar-plain-date-picker-${CoarPlainDatePickerComponent.nextId++}`;

  /** ID for the label element */
  protected labelId = computed(() => `${this.uid}-label`);

  /** ID for the input element */
  protected inputId = computed(() => `${this.uid}-input`);

  /** ID for the panel */
  protected panelId = computed(() => `${this.uid}-panel`);

  /** ID for the message element */
  protected messageId = computed(() => `${this.uid}-message`);

  /** Reference to the input element */
  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('dateInput');

  /** Reference to the trigger element */
  protected triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');

  /** Reference to the panel template */
  protected panelTemplateRef = viewChild<TemplateRef<unknown>>('panelTemplate');

  // ============================================================
  // Computed Values (Date Picker Specific)
  // ============================================================

  /** Get placeholder text based on date format */
  protected inputPlaceholder = computed(() => {
    return this.dateFormat().toUpperCase();
  });

  /** Resolved active month (uses value's month or today) */
  protected override resolvedActiveMonth = computed((): Temporal.PlainYearMonth => {
    const explicit = this.activeMonth();
    if (explicit) return explicit;
    const val = this.value();
    if (val) return val.toPlainYearMonth();
    return this.today().toPlainYearMonth();
  });

  /**
   * Markers for the currently selected date.
   */
  protected selectedDateMarkers = computed((): CoarDateMarker[] => {
    const date = this.value();
    if (!date) return [];

    return this.markers().filter((marker) => {
      const afterStart = Temporal.PlainDate.compare(date, marker.startDate) >= 0;
      const beforeEnd = marker.endDate
        ? Temporal.PlainDate.compare(date, marker.endDate) <= 0
        : Temporal.PlainDate.compare(date, marker.startDate) === 0;
      return afterStart && beforeEnd;
    });
  });

  // ============================================================
  // Abstract Method Implementations
  // ============================================================

  protected override getValue(): Temporal.PlainDate | null {
    return this.value();
  }

  // ============================================================
  // Constructor & Lifecycle
  // ============================================================

  constructor() {
    super();

    // Sync display value with selected value
    effect(() => {
      const val = this.value();
      if (val) {
        this.displayValue.set(coarFormatPlainDate(val, this.dateFormat()));
      } else {
        this.displayValue.set('');
      }
    });

    // Keep Maskito config in sync
    effect(() => {
      const inputElement = this.inputRef()?.nativeElement;
      if (!inputElement) return;

      this.maskitoInstance?.destroy();
      this.initializeMaskito(inputElement);
    });

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.maskitoInstance?.destroy();
      this.overlayRef?.close();
      this.overlayRef = null;
    });
  }

  // ============================================================
  // Public Methods
  // ============================================================

  /** Open the picker panel */
  override openPanel(): void {
    if (this.isDisabled() || this.readonly()) return;
    if (this.overlayRef) return;

    const trigger = this.triggerRef()?.nativeElement;
    const template = this.panelTemplateRef();
    if (!trigger || !template) return;

    const verticalPlacement = this.resolvePlacement(trigger, this.estimatePanelHeight());
    this.panelPosition.set(verticalPlacement === 'top' ? 'top' : 'bottom');

    const triggerWidth = trigger.getBoundingClientRect().width;
    const panelMinWidth = this.showWeekNumbers() ? 528 : 480;

    const horizontalAlignment = triggerWidth >= panelMinWidth ? '-end' : '';
    const placement = `${verticalPlacement}${horizontalAlignment}` as Placement;

    const ref = this.overlayBuilder
      .anchor({ kind: 'element', element: trigger })
      .position({
        placement,
        offset: 4,
        flip: false,
        shift: true,
      })
      .scroll({ strategy: 'reposition' })
      .dismiss({ outsideClick: true, escapeKey: true })
      .size({ mode: 'content' })
      .fromTemplate(template)
      .open({});

    this.overlayRef = ref;
    this.isOpen.set(true);
    this.opened.emit();

    ref.afterClosed$.subscribe(() => {
      if (this.overlayRef !== ref) return;
      this.overlayRef = null;
      this.isOpen.set(false);
      this.closed.emit();
    });
  }

  /** Clear the selected value */
  clearValue(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.valueChange.emit(null);
    this.cvaOnChange(null);
  }

  // ============================================================
  // Calendar Event Handlers
  // ============================================================

  /** Handle date selection from calendar */
  protected onDateSelected(date: Temporal.PlainDate): void {
    this.value.set(date);
    this.valueChange.emit(date);
    this.cvaOnChange(date);

    if (this.closeOnSelect()) {
      this.closePanel();
    }
  }

  // ============================================================
  // CVA Methods
  // ============================================================

  writeValue(value: Temporal.PlainDate | string | null): void {
    if (value === null || value === undefined) {
      this.value.set(null);
    } else if (typeof value === 'string') {
      try {
        this.value.set(Temporal.PlainDate.from(value));
      } catch {
        this.value.set(null);
      }
    } else {
      this.value.set(value);
    }
  }

  // ============================================================
  // Event Handlers
  // ============================================================

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const text = input.value;
    this.displayValue.set(text);

    const parsed = coarParsePlainDateFromInput(text, this.dateFormat(), {
      min: this.min(),
      max: this.max(),
    });
    if (parsed) {
      this.value.set(parsed);
      this.cvaOnTouched();
      this.valueChange.emit(parsed);
    }
  }

  protected onInputBlur(): void {
    this.cvaOnTouched();

    const currentText = this.displayValue();
    const parsed = coarParsePlainDateFromInput(currentText, this.dateFormat(), {
      min: this.min(),
      max: this.max(),
    });

    if (!parsed && currentText.length > 0) {
      const val = this.value();
      if (val) {
        this.displayValue.set(coarFormatPlainDate(val, this.dateFormat()));
      } else {
        this.displayValue.set('');
      }
    }
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  private estimatePanelHeight(): number {
    return 340;
  }

  private initializeMaskito(inputElement: HTMLInputElement): void {
    const format = this.dateFormat();
    const separator = this.separator();

    const modeMap: Record<DateFormatConfig['pattern'], 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy/mm/dd'> =
      {
        'dd.mm.yyyy': 'dd/mm/yyyy',
        'dd/mm/yyyy': 'dd/mm/yyyy',
        'mm/dd/yyyy': 'mm/dd/yyyy',
        'yyyy-mm-dd': 'yyyy/mm/dd',
      };

    const minDate = this.min();
    const maxDate = this.max();

    const options = maskitoDateOptionsGenerator({
      mode: modeMap[format],
      separator,
      min: minDate ? coarTemporalPlainDateToDate(minDate) : undefined,
      max: maxDate ? coarTemporalPlainDateToDate(maxDate) : undefined,
    });

    this.maskitoInstance = new Maskito(inputElement, options);
  }
}
