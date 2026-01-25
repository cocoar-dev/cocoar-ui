import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import { Maskito } from '@maskito/core';
import { maskitoDateTimeOptionsGenerator } from '@maskito/kit';

import { type Placement } from '@cocoar/ui-overlay';

import { CoarIconComponent } from '../../display/icon/coar-icon.component';
import { CoarScrollableCalendarComponent } from '../scrollable-calendar/coar-scrollable-calendar.component';
import { CoarScrollbarDirective } from '../../display/scrollbar/coar-scrollbar.directive';
import { CoarTimePickerComponent } from '../time-picker/coar-time-picker.component';
import { coarProvideValueAccessor } from '../../forms/_base/coar-control-value-accessor';
import type { DateFormatConfig } from '../_shared/coar-date-format';
import type { CoarDateMarker } from '../_shared/coar-date-marker';
import {
  coarFormatPlainDate,
  coarParsePlainDateFromInput,
  coarTemporalPlainDateToDate,
} from '../_shared/coar-date-helpers';
import {
  type CoarTimeValue,
  coarDetect12HourFormat,
  coarFormatTime,
  coarRoundMinutesToStep,
} from '../_shared/coar-time-helpers';
import { CoarDatePickerBase, type CoarDatePickerSize } from '../_shared/coar-date-picker-base';

// Re-export size type for backward compatibility
export type CoarPlainDateTimePickerSize = CoarDatePickerSize;

/**
 * Date-time picker component with scrollable calendar and time selection.
 *
 * Returns strongly-typed `Temporal.PlainDateTime` values (timezone-independent).
 *
 * Features:
 * - Two-column layout: scrollable calendar on left, month list + time picker on right
 * - Locale-aware time format (12h/24h auto-detection)
 * - CSS-based virtualization for smooth scrolling through months
 * - Min/max datetime constraints with time clamping
 *
 * @example
 * ```html
 * <coar-plain-date-time-picker
 *   [(value)]="appointmentDateTime"
 *   label="Appointment"
 *   [minuteStep]="15"
 * />
 * ```
 */
@Component({
  selector: 'coar-plain-date-time-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarIconComponent,
    CoarScrollableCalendarComponent,
    CoarScrollbarDirective,
    CoarTimePickerComponent,
  ],
  templateUrl: './coar-plain-date-time-picker.component.html',
  styleUrl: './coar-plain-date-time-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarPlainDateTimePickerComponent)],
  host: {
    '[class.coar-plain-date-time-picker--xs]': 'size() === "xs"',
    '[class.coar-plain-date-time-picker--sm]': 'size() === "sm"',
    '[class.coar-plain-date-time-picker--md]': 'size() === "md"',
    '[class.coar-plain-date-time-picker--lg]': 'size() === "lg"',
    '[class.coar-plain-date-time-picker--disabled]': 'isDisabled()',
    '[class.coar-plain-date-time-picker--readonly]': 'readonly()',
    '[class.coar-plain-date-time-picker--error]': 'hasError()',
    '[class.coar-plain-date-time-picker--open]': 'isOpen()',
  },
})
export class CoarPlainDateTimePickerComponent extends CoarDatePickerBase<Temporal.PlainDateTime> {
  /** Maskito instance for input masking */
  private maskitoInstance?: Maskito;

  // ============================================================
  // Date-Time Picker Specific Inputs
  // ============================================================

  /** Minimum selectable datetime */
  min = input<Temporal.PlainDateTime | null>(null);

  /** Maximum selectable datetime */
  max = input<Temporal.PlainDateTime | null>(null);

  /**
   * Whether to use 24-hour time format.
   * - true: Always use 24h format
   * - false: Always use 12h format with AM/PM
   * - 'auto': Detect from locale (default)
   */
  use24Hour = input<boolean | 'auto'>('auto');

  /** Step interval for minute selection (1, 5, 10, or 15) */
  minuteStep = input<1 | 5 | 10 | 15>(5);

  /**
   * Default time to use when selecting a date without existing time.
   */
  defaultTime = input<CoarTimeValue>({ hours: 9, minutes: 0 });

  // ============================================================
  // Model & Outputs
  // ============================================================

  /** Current selected value (two-way bindable with [(value)]) */
  value = model<Temporal.PlainDateTime | null>(null);

  /** Emitted when the selected value changes */
  valueChange = output<Temporal.PlainDateTime | null>();

  // ============================================================
  // Internal State
  // ============================================================

  /** Unique ID counter for component instances */
  private static nextId = 0;

  /** Unique ID for this component instance */
  private readonly uid = `coar-plain-date-time-picker-${CoarPlainDateTimePickerComponent.nextId++}`;

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

  /** Pending time value (stored until a date is selected) */
  protected pendingTime = signal<CoarTimeValue | null>(null);

  // ============================================================
  // Computed Values (Date-Time Picker Specific)
  // ============================================================

  /** Get placeholder text based on date and time format */
  protected inputPlaceholder = computed(() => {
    const datePart = this.dateFormat().toUpperCase();
    const use24h = this.effectiveUse24Hour();
    return use24h ? `${datePart} HH:MM` : `${datePart} HH:MM AM/PM`;
  });

  /** Whether to use 24-hour time format */
  protected effectiveUse24Hour = computed(() => {
    const setting = this.use24Hour();
    if (setting === true) return true;
    if (setting === false) return false;
    return !coarDetect12HourFormat(this.effectiveLocale());
  });

  /** Extract date portion from value */
  protected selectedDate = computed((): Temporal.PlainDate | null => {
    const val = this.value();
    return val ? val.toPlainDate() : null;
  });

  /** Extract time portion from value */
  protected selectedTime = computed((): CoarTimeValue | null => {
    const val = this.value();
    if (!val) return this.pendingTime();
    return { hours: val.hour, minutes: val.minute };
  });

  /** Min date for calendar constraints */
  protected minDate = computed((): Temporal.PlainDate | null => {
    const val = this.min();
    return val ? val.toPlainDate() : null;
  });

  /** Max date for calendar constraints */
  protected maxDate = computed((): Temporal.PlainDate | null => {
    const val = this.max();
    return val ? val.toPlainDate() : null;
  });

  /**
   * Effective minimum time constraint for the time picker.
   * Only applies when the selected date equals the minimum date boundary.
   */
  protected effectiveMinTime = computed((): CoarTimeValue | null => {
    const minDateTime = this.min();
    const selected = this.selectedDate();
    if (!minDateTime || !selected) return null;

    const minDatePart = minDateTime.toPlainDate();
    // Only constrain time if selected date is exactly on the min boundary
    if (Temporal.PlainDate.compare(selected, minDatePart) === 0) {
      return { hours: minDateTime.hour, minutes: minDateTime.minute };
    }
    return null;
  });

  /**
   * Effective maximum time constraint for the time picker.
   * Only applies when the selected date equals the maximum date boundary.
   */
  protected effectiveMaxTime = computed((): CoarTimeValue | null => {
    const maxDateTime = this.max();
    const selected = this.selectedDate();
    if (!maxDateTime || !selected) return null;

    const maxDatePart = maxDateTime.toPlainDate();
    // Only constrain time if selected date is exactly on the max boundary
    if (Temporal.PlainDate.compare(selected, maxDatePart) === 0) {
      return { hours: maxDateTime.hour, minutes: maxDateTime.minute };
    }
    return null;
  });

  /** Resolved active month (uses value's month or today) */
  protected override resolvedActiveMonth = computed((): Temporal.PlainYearMonth => {
    const explicit = this.activeMonth();
    if (explicit) return explicit;
    const val = this.value();
    if (val) return val.toPlainDate().toPlainYearMonth();
    return this.today().toPlainYearMonth();
  });

  /**
   * Markers for the currently selected date.
   */
  protected selectedDateMarkers = computed((): CoarDateMarker[] => {
    const date = this.selectedDate();
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

  protected override getValue(): Temporal.PlainDateTime | null {
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
        this.displayValue.set(this.formatValue(val));
      } else {
        this.displayValue.set('');
      }
    });

    // Keep Maskito config in sync
    effect(() => {
      // Track format dependencies
      this.dateFormat();
      this.separator();
      this.minDate();
      this.maxDate();

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
    this.pendingTime.set(null);
    this.valueChange.emit(null);
    this.cvaOnChange(null);
  }

  // ============================================================
  // Calendar Event Handlers
  // ============================================================

  /** Handle date selection from calendar */
  protected onDateSelected(date: Temporal.PlainDate): void {
    const time = this.selectedTime() ?? this.defaultTime();
    let dateTime = date.toPlainDateTime({
      hour: time.hours,
      minute: coarRoundMinutesToStep(time.minutes, this.minuteStep()),
    });

    // Clamp datetime to min/max bounds when selecting a boundary date
    dateTime = this.clampDateTimeToRange(dateTime);

    this.value.set(dateTime);
    this.valueChange.emit(dateTime);
    this.cvaOnChange(dateTime);
  }

  /** Handle time changes from time picker */
  protected onTimeChanged(time: CoarTimeValue | null): void {
    if (!time) return;

    const currentDate = this.selectedDate();
    if (currentDate) {
      let dateTime = currentDate.toPlainDateTime({
        hour: time.hours,
        minute: time.minutes,
      });

      // Clamp datetime to min/max bounds
      dateTime = this.clampDateTimeToRange(dateTime);

      this.value.set(dateTime);
      this.valueChange.emit(dateTime);
      this.cvaOnChange(dateTime);
    } else {
      this.pendingTime.set(time);
    }
  }

  /**
   * Clamps a PlainDateTime to be within the min/max range.
   * Returns the original value if it's within range, otherwise returns the nearest boundary.
   */
  private clampDateTimeToRange(dateTime: Temporal.PlainDateTime): Temporal.PlainDateTime {
    const minDateTime = this.min();
    const maxDateTime = this.max();

    if (minDateTime && Temporal.PlainDateTime.compare(dateTime, minDateTime) < 0) {
      return minDateTime;
    }
    if (maxDateTime && Temporal.PlainDateTime.compare(dateTime, maxDateTime) > 0) {
      return maxDateTime;
    }
    return dateTime;
  }

  // ============================================================
  // CVA Methods
  // ============================================================

  writeValue(value: Temporal.PlainDateTime | string | null): void {
    if (value === null || value === undefined) {
      this.value.set(null);
      this.pendingTime.set(null);
    } else if (typeof value === 'string') {
      try {
        this.value.set(Temporal.PlainDateTime.from(value));
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

    const parsed = this.parseValueFromInput(text);
    if (parsed) {
      this.value.set(parsed);
      this.cvaOnTouched();
      this.valueChange.emit(parsed);
    }
  }

  protected onInputBlur(): void {
    this.cvaOnTouched();

    const currentText = this.displayValue();
    const parsed = this.parseValueFromInput(currentText);

    if (!parsed && currentText.length > 0) {
      const val = this.value();
      if (val) {
        this.displayValue.set(this.formatValue(val));
      } else {
        this.displayValue.set('');
      }
    }
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  private estimatePanelHeight(): number {
    return 400;
  }

  private formatValue(val: Temporal.PlainDateTime): string {
    const datePart = coarFormatPlainDate(val.toPlainDate(), this.dateFormat());
    const timePart = coarFormatTime(val.hour, val.minute, this.effectiveUse24Hour());
    return `${datePart} ${timePart}`;
  }

  private parseValueFromInput(text: string): Temporal.PlainDateTime | null {
    if (!text) return null;

    // DateTime: try to parse date and time
    // Format: "DD.MM.YYYY HH:MM" or "DD.MM.YYYY HH:MM AM/PM"
    const parts = text.split(' ');
    if (parts.length < 2) return null;

    const datePart = parts[0];
    const date = coarParsePlainDateFromInput(datePart, this.dateFormat(), {
      min: this.minDate(),
      max: this.maxDate(),
    });

    if (!date) return null;

    // Parse time part
    const timePart = parts.slice(1).join(' ');
    const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3]?.toUpperCase();

    if (period) {
      if (hours < 1 || hours > 12) return null;
      if (period === 'AM') {
        hours = hours === 12 ? 0 : hours;
      } else {
        hours = hours === 12 ? 12 : hours + 12;
      }
    } else {
      if (hours < 0 || hours > 23) return null;
    }

    if (minutes < 0 || minutes > 59) return null;

    return date.toPlainDateTime({ hour: hours, minute: minutes });
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

    const minDate = this.minDate();
    const maxDate = this.maxDate();

    // Use datetime mask for full datetime input
    const options = maskitoDateTimeOptionsGenerator({
      dateMode: modeMap[format],
      timeMode: 'HH:MM',
      dateSeparator: separator,
      min: minDate ? coarTemporalPlainDateToDate(minDate) : undefined,
      max: maxDate ? coarTemporalPlainDateToDate(maxDate) : undefined,
    });

    this.maskitoInstance = new Maskito(inputElement, options);
  }
}
