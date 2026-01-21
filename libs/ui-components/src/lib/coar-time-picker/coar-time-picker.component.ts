import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  booleanAttribute,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { CoarLocalizationService } from '@cocoar/localization';
import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import {
  CoarControlValueAccessor,
  coarProvideValueAccessor,
} from '../forms/coar-control-value-accessor';
import {
  type CoarTimePeriod,
  type CoarTimeValue,
  coarDetect12HourFormat,
  coarConvertTo12Hour,
  coarConvertTo24Hour,
  coarIncrementHours,
  coarIncrementMinutes,
  coarRoundMinutesToStep,
} from '../date/coar-time-helpers';

export type CoarTimePickerSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Time picker component with hours, minutes, and optional AM/PM selection.
 *
 * Supports both 12-hour and 24-hour formats, with locale-aware auto-detection.
 * Values wrap around at boundaries (23→00, 59→00 with hour increment).
 *
 * @example
 * ```html
 * <!-- Basic usage with auto 12h/24h detection -->
 * <coar-time-picker [(value)]="selectedTime" />
 *
 * <!-- Force 24-hour format with 15-minute steps -->
 * <coar-time-picker
 *   [(value)]="selectedTime"
 *   [use24Hour]="true"
 *   [minuteStep]="15"
 * />
 * ```
 */
@Component({
  selector: 'coar-time-picker',
  standalone: true,
  imports: [CoarIconComponent],
  templateUrl: './coar-time-picker.component.html',
  styleUrl: './coar-time-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarTimePickerComponent)],
  host: {
    '[class.coar-time-picker--xs]': 'size() === "xs"',
    '[class.coar-time-picker--sm]': 'size() === "sm"',
    '[class.coar-time-picker--md]': 'size() === "md"',
    '[class.coar-time-picker--lg]': 'size() === "lg"',
    '[class.coar-time-picker--disabled]': 'isDisabled()',
    '[class.coar-time-picker--readonly]': 'readonly()',
  },
})
export class CoarTimePickerComponent extends CoarControlValueAccessor<CoarTimeValue | null> {
  private readonly localizationService = inject(CoarLocalizationService, { optional: true });

  /** Current language from localization service (reactive) */
  private readonly currentLanguage = toSignal(
    this.localizationService?.languageState.value$ ?? of(''),
    {
      initialValue: this.localizationService?.languageState.value ?? '',
    }
  );

  // ============================================================
  // Inputs
  // ============================================================

  /** Size variant */
  size = input<CoarTimePickerSize>('md');

  /** Whether the picker is readonly */
  readonly = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether the picker is disabled */
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  /**
   * Whether to use 24-hour format.
   * - true: Always use 24h format (00-23)
   * - false: Always use 12h format with AM/PM
   * - 'auto': Detect from locale (default)
   */
  use24Hour = input<boolean | 'auto'>('auto');

  /**
   * Step interval for minute selection.
   * Minutes will snap to multiples of this value.
   */
  minuteStep = input<1 | 5 | 10 | 15>(5);

  /**
   * Locale identifier for 12h/24h format detection.
   * Uses global locale service default if not specified.
   */
  locale = input<string>();

  /**
   * Label for screen readers (visually hidden).
   */
  ariaLabel = input<string>('Time');

  // ============================================================
  // Model & Outputs
  // ============================================================

  /** Current time value (two-way bindable with [(value)]) */
  value = model<CoarTimeValue | null>(null);

  /** Emitted when the time value changes */
  valueChange = output<CoarTimeValue | null>();

  // ============================================================
  // Internal State
  // ============================================================

  /** Internal hours value (0-23) */
  protected hours = signal<number>(9);

  /** Internal minutes value (0-59) */
  protected minutes = signal<number>(0);

  /** AM/PM period for 12-hour mode */
  protected period = signal<CoarTimePeriod>('AM');

  // ============================================================
  // Computed Values
  // ============================================================

  /** Effective locale for 12h/24h detection */
  protected effectiveLocale = computed(() => {
    return this.locale() ?? this.currentLanguage() ?? navigator.language;
  });

  /** Whether to display in 12-hour format */
  protected is12HourFormat = computed(() => {
    const setting = this.use24Hour();
    if (setting === true) return false;
    if (setting === false) return true;
    // 'auto' - detect from locale
    return coarDetect12HourFormat(this.effectiveLocale());
  });

  /** Display hours value (1-12 for 12h mode, 0-23 for 24h mode) */
  protected displayHours = computed(() => {
    const h = this.hours();
    if (this.is12HourFormat()) {
      const { hours } = coarConvertTo12Hour(h);
      return hours;
    }
    return h;
  });

  /** Display minutes (always 0-59, padded) */
  protected displayMinutes = computed(() => {
    return this.minutes();
  });

  /** Minimum hours value for display */
  protected minHours = computed(() => (this.is12HourFormat() ? 1 : 0));

  /** Maximum hours value for display */
  protected maxHours = computed(() => (this.is12HourFormat() ? 12 : 23));

  /** Whether the picker is disabled (input or CVA) */
  protected isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  // ============================================================
  // Constructor & Effects
  // ============================================================

  constructor() {
    super();

    // Sync external value to internal state
    effect(() => {
      const val = this.value();
      if (val) {
        this.hours.set(val.hours);
        this.minutes.set(coarRoundMinutesToStep(val.minutes, this.minuteStep()));
        // Update period based on hours
        this.period.set(val.hours >= 12 ? 'PM' : 'AM');
      }
    });
  }

  // ============================================================
  // Public Methods
  // ============================================================

  /** Increment hours by 1 */
  incrementHours(): void {
    if (this.isDisabled() || this.readonly()) return;

    if (this.is12HourFormat()) {
      // In 12h mode, increment display hours (1-12) and handle period switch
      const currentDisplay = this.displayHours();
      let newDisplay = currentDisplay + 1;

      if (newDisplay > 12) {
        newDisplay = 1;
      }

      // Convert back to 24h
      const new24h = coarConvertTo24Hour(newDisplay, this.period());
      this.hours.set(new24h);

      // Toggle AM/PM when going from 11→12
      if (currentDisplay === 11) {
        this.togglePeriod();
        return; // togglePeriod will emit the value
      }
    } else {
      const newHours = coarIncrementHours(this.hours(), 1);
      this.hours.set(newHours);
    }

    this.emitValue();
  }

  /** Decrement hours by 1 */
  decrementHours(): void {
    if (this.isDisabled() || this.readonly()) return;

    if (this.is12HourFormat()) {
      const currentDisplay = this.displayHours();
      let newDisplay = currentDisplay - 1;

      if (newDisplay < 1) {
        newDisplay = 12;
      }

      // Convert back to 24h
      const new24h = coarConvertTo24Hour(newDisplay, this.period());
      this.hours.set(new24h);

      // Toggle AM/PM when going from 12→11
      if (currentDisplay === 12) {
        this.togglePeriod();
        return; // togglePeriod will emit the value
      }
    } else {
      const newHours = coarIncrementHours(this.hours(), -1);
      this.hours.set(newHours);
    }

    this.emitValue();
  }

  /** Increment minutes by step */
  incrementMinutes(): void {
    if (this.isDisabled() || this.readonly()) return;

    const step = this.minuteStep();
    const { minutes: newMinutes, hourDelta } = coarIncrementMinutes(this.minutes(), 1, step);

    this.minutes.set(newMinutes);

    if (hourDelta !== 0) {
      // Carry over to hours
      const newHours = coarIncrementHours(this.hours(), hourDelta);
      this.hours.set(newHours);
      // Update period if needed
      this.period.set(newHours >= 12 ? 'PM' : 'AM');
    }

    this.emitValue();
  }

  /** Decrement minutes by step */
  decrementMinutes(): void {
    if (this.isDisabled() || this.readonly()) return;

    const step = this.minuteStep();
    const { minutes: newMinutes, hourDelta } = coarIncrementMinutes(this.minutes(), -1, step);

    this.minutes.set(newMinutes);

    if (hourDelta !== 0) {
      // Carry over to hours
      const newHours = coarIncrementHours(this.hours(), hourDelta);
      this.hours.set(newHours);
      // Update period if needed
      this.period.set(newHours >= 12 ? 'PM' : 'AM');
    }

    this.emitValue();
  }

  /** Toggle between AM and PM */
  togglePeriod(): void {
    if (this.isDisabled() || this.readonly()) return;
    if (!this.is12HourFormat()) return;

    const newPeriod: CoarTimePeriod = this.period() === 'AM' ? 'PM' : 'AM';
    this.period.set(newPeriod);

    // Update 24h hours based on new period
    const displayH = this.displayHours();
    const new24h = coarConvertTo24Hour(displayH, newPeriod);
    this.hours.set(new24h);

    this.emitValue();
  }

  /** Set specific period (AM or PM) */
  setPeriod(period: CoarTimePeriod): void {
    if (this.isDisabled() || this.readonly()) return;
    if (!this.is12HourFormat()) return;
    if (this.period() === period) return;

    this.period.set(period);

    // Update 24h hours based on new period
    const displayH = this.displayHours();
    const new24h = coarConvertTo24Hour(displayH, period);
    this.hours.set(new24h);

    this.emitValue();
  }

  // ============================================================
  // Keyboard Handlers
  // ============================================================

  /** Handle keyboard events on hours spinner */
  onHoursKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.incrementHours();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.decrementHours();
        break;
    }
  }

  /** Handle keyboard events on minutes spinner */
  onMinutesKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.incrementMinutes();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.decrementMinutes();
        break;
    }
  }

  /** Handle keyboard events on period selector */
  onPeriodKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        this.togglePeriod();
        break;
    }
  }

  // ============================================================
  // CVA Methods
  // ============================================================

  writeValue(value: CoarTimeValue | null): void {
    if (value) {
      this.hours.set(value.hours);
      this.minutes.set(coarRoundMinutesToStep(value.minutes, this.minuteStep()));
      this.period.set(value.hours >= 12 ? 'PM' : 'AM');
    } else {
      // Reset to default
      this.hours.set(9);
      this.minutes.set(0);
      this.period.set('AM');
    }
  }

  // ============================================================
  // Private Methods
  // ============================================================

  /** Emit the current value */
  private emitValue(): void {
    const newValue: CoarTimeValue = {
      hours: this.hours(),
      minutes: this.minutes(),
    };
    this.value.set(newValue);
    this.valueChange.emit(newValue);
    this.cvaOnTouched();
  }
}
