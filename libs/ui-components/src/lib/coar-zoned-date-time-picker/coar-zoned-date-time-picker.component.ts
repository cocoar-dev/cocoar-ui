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
  booleanAttribute,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Temporal } from '@js-temporal/polyfill';
import { Maskito } from '@maskito/core';
import { maskitoDateTimeOptionsGenerator } from '@maskito/kit';

import { type Placement } from '@cocoar/ui-overlay';

import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoarScrollableCalendarComponent } from '../coar-scrollable-calendar/coar-scrollable-calendar.component';
import { CoarScrollbarDirective } from '../coar-scrollbar/coar-scrollbar.directive';
import { CoarTimePickerComponent } from '../coar-time-picker/coar-time-picker.component';
import { CoarSingleSelectComponent } from '../coar-select/coar-single-select.component';
import { CoarSelectOption } from '../coar-select/coar-select-option.interface';
import { coarProvideValueAccessor } from '../forms/coar-control-value-accessor';
import type { DateFormatConfig } from '../date/coar-date-format';
import type { CoarDateMarker } from '../date/coar-date-marker';
import {
  coarFormatPlainDate,
  coarParsePlainDateFromInput,
  coarTemporalPlainDateToDate,
} from '../date/coar-date-helpers';
import {
  type CoarTimeValue,
  coarDetect12HourFormat,
  coarFormatTime,
  coarRoundMinutesToStep,
} from '../date/coar-time-helpers';
import { CoarDatePickerBase, type CoarDatePickerSize } from '../date/coar-date-picker-base';

// Re-export size type for convenience
export type CoarZonedDateTimePickerSize = CoarDatePickerSize;

/**
 * Zoned date-time picker component with full timezone support.
 *
 * Returns strongly-typed `Temporal.ZonedDateTime` values that include:
 * - The local date and time (user's intent)
 * - The IANA timezone (context)
 * - The instant (derived UTC moment)
 *
 * Key concepts:
 * - **Value timezone**: Where the event "lives" - persisted with the value
 * - **Display timezone**: User's viewing lens (from CoarTimeZoneService)
 *
 * This picker captures complete user intent, allowing you to:
 * - Store the local time + timezone as source of truth
 * - Derive the UTC instant for queries and ordering
 * - Recalculate instants if DST rules change
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <coar-zoned-date-time-picker
 *   [(value)]="meetingDateTime"
 *   label="Meeting Time"
 * />
 *
 * <!-- With explicit timezone -->
 * <coar-zoned-date-time-picker
 *   [(value)]="meetingDateTime"
 *   [timeZone]="'Europe/Vienna'"
 *   label="Meeting Time"
 * />
 *
 * <!-- Listen for instant changes -->
 * <coar-zoned-date-time-picker
 *   [(value)]="meetingDateTime"
 *   (instantChange)="onInstantChanged($event)"
 *   label="Meeting Time"
 * />
 * ```
 */
@Component({
  selector: 'coar-zoned-date-time-picker',
  standalone: true,
  imports: [
    FormsModule,
    CoarIconComponent,
    CoarScrollableCalendarComponent,
    CoarScrollbarDirective,
    CoarTimePickerComponent,
    CoarSingleSelectComponent,
  ],
  templateUrl: './coar-zoned-date-time-picker.component.html',
  styleUrl: './coar-zoned-date-time-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [coarProvideValueAccessor(() => CoarZonedDateTimePickerComponent)],
  host: {
    '[class.coar-zoned-date-time-picker--xs]': 'size() === "xs"',
    '[class.coar-zoned-date-time-picker--sm]': 'size() === "sm"',
    '[class.coar-zoned-date-time-picker--md]': 'size() === "md"',
    '[class.coar-zoned-date-time-picker--lg]': 'size() === "lg"',
    '[class.coar-zoned-date-time-picker--disabled]': 'isDisabled()',
    '[class.coar-zoned-date-time-picker--readonly]': 'readonly()',
    '[class.coar-zoned-date-time-picker--error]': 'hasError()',
    '[class.coar-zoned-date-time-picker--open]': 'isOpen()',
  },
})
export class CoarZonedDateTimePickerComponent extends CoarDatePickerBase<Temporal.ZonedDateTime> {
  /** Maskito instance for input masking */
  private maskitoInstance?: Maskito;

  // ============================================================
  // Zoned Date-Time Picker Specific Inputs
  // ============================================================

  /**
   * The timezone for the value.
   *
   * This represents where the event "lives" - it's persisted with the value.
   * If not provided, uses the timezone from CoarTimeZoneService.
   *
   * Examples: 'Europe/Vienna', 'America/New_York', 'UTC'
   */
  timeZone = input<string | null>(null);

  /**
   * Whether the timezone selector is locked (read-only).
   * When locked, users can see but not change the timezone.
   * Use this to protect the value timezone from accidental changes.
   */
  timeZoneLocked = input<boolean, unknown>(false, { transform: booleanAttribute });

  /**
   * Whether to show the timezone selector in the panel.
   * When false, the timezone is determined by the `timeZone` input
   * or the CoarTimeZoneService.
   */
  showTimeZoneSelector = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Minimum selectable datetime (in the value's timezone) */
  min = input<Temporal.ZonedDateTime | null>(null);

  /** Maximum selectable datetime (in the value's timezone) */
  max = input<Temporal.ZonedDateTime | null>(null);

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

  /**
   * Filter patterns for available timezone options.
   *
   * Supports wildcards:
   * - `*` matches any characters
   * - Patterns are case-insensitive
   *
   * If not provided or empty, all IANA timezones are available.
   *
   * @example
   * // Only European timezones
   * [timezoneFilter]="['Europe/*']"
   *
   * // European + specific US cities
   * [timezoneFilter]="['Europe/*', 'America/New_York', 'America/Los_Angeles']"
   *
   * // Anything containing 'New'
   * [timezoneFilter]="['*New*']"
   */
  timezoneFilter = input<string[]>([]);

  // ============================================================
  // Model & Outputs
  // ============================================================

  /** Current selected value (two-way bindable with [(value)]) */
  value = model<Temporal.ZonedDateTime | null>(null);

  /** Emitted when the selected value changes */
  valueChange = output<Temporal.ZonedDateTime | null>();

  /**
   * Emitted when the derived instant (UTC) changes.
   * This is a convenience output for consumers who need the instant
   * for API calls, storage, or comparisons.
   */
  instantChange = output<Temporal.Instant | null>();

  // ============================================================
  // Internal State
  // ============================================================

  /** Unique ID counter for component instances */
  private static nextId = 0;

  /** Unique ID for this component instance */
  private readonly uid = `coar-zoned-date-time-picker-${CoarZonedDateTimePickerComponent.nextId++}`;

  /** ID for the label element */
  protected labelId = computed(() => `${this.uid}-label`);

  /** ID for the input element */
  protected inputId = computed(() => `${this.uid}-input`);

  /** ID for the panel */
  protected panelId = computed(() => `${this.uid}-panel`);

  /** Reference to the input element */
  protected inputRef = viewChild<ElementRef<HTMLInputElement>>('dateInput');

  /** Reference to the trigger element */
  protected triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');

  /** Reference to the panel template */
  protected panelTemplateRef = viewChild<TemplateRef<unknown>>('panelTemplate');

  /** Pending time value (stored until a date is selected) */
  protected pendingTime = signal<CoarTimeValue | null>(null);

  /**
   * Display timezone - the user's viewing lens.
   * This can be freely changed without affecting the stored value.
   * Defaults to the user's timezone from CoarTimeZoneService.
   */
  protected displayTimeZone = signal<string | null>(null);

  /**
   * Whether we're showing the value in the value timezone (true) or display timezone (false).
   * This is toggled by the indicator icon in the closed state.
   */
  protected showingValueTimeZone = signal<boolean>(false);

  /**
   * Whether the value timezone is being edited (unlocked inline select mode).
   */
  protected isEditingValueTimeZone = signal<boolean>(false);

  // ============================================================
  // Computed Values (Zoned Date-Time Picker Specific)
  // ============================================================

  /**
   * The value's timezone (where the event "lives").
   * This is the intent timezone - stored with the value.
   */
  protected valueTimeZone = computed((): string | null => {
    const val = this.value();
    return val ? val.timeZoneId : null;
  });

  /**
   * Effective display timezone for viewing.
   * Priority: explicit display selection > service timezone > UTC fallback
   */
  protected effectiveDisplayTimeZone = computed((): string => {
    const explicit = this.displayTimeZone();
    if (explicit) return explicit;

    const fromService = this.currentTimeZone?.();
    if (fromService) return fromService;

    return 'UTC';
  });

  /**
   * The current working timezone for the picker UI.
   * When creating new values, this determines the timezone used.
   * When editing, this is the display timezone (value TZ is preserved).
   */
  protected currentWorkingTimeZone = computed((): string => {
    // If showing value timezone or no value yet, use value's timezone
    if (this.showingValueTimeZone()) {
      return this.valueTimeZone() ?? this.effectiveDisplayTimeZone();
    }
    return this.effectiveDisplayTimeZone();
  });

  /**
   * Whether the display timezone differs from the value timezone.
   * Used to show/hide the timezone indicator.
   */
  protected timeZonesDiffer = computed((): boolean => {
    const valueTz = this.valueTimeZone();
    if (!valueTz) return false;
    return valueTz !== this.effectiveDisplayTimeZone();
  });

  /**
   * Short display name for the value timezone.
   */
  protected valueTimeZoneDisplayName = computed((): string => {
    const tz = this.valueTimeZone();
    if (!tz) return '';
    const parts = tz.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ');
  });

  /**
   * Short display name for the display timezone.
   */
  protected displayTimeZoneDisplayName = computed((): string => {
    const tz = this.effectiveDisplayTimeZone();
    const parts = tz.split('/');
    return parts[parts.length - 1].replace(/_/g, ' ');
  });

  /**
   * UTC offset string for the value timezone.
   */
  protected valueTimeZoneOffset = computed((): string => {
    const tz = this.valueTimeZone();
    if (!tz) return '';
    return this.getOffsetForTimeZone(tz);
  });

  /**
   * UTC offset string for the display timezone.
   */
  protected displayTimeZoneOffset = computed((): string => {
    return this.getOffsetForTimeZone(this.effectiveDisplayTimeZone());
  });

  /**
   * The value formatted in the VALUE timezone (intent).
   * Always shows what the time means in the original context.
   */
  protected valueInValueTimeZone = computed((): string => {
    const val = this.value();
    if (!val) return '';
    return this.formatZonedDateTime(val);
  });

  /**
   * The value formatted in the DISPLAY timezone (user's view).
   */
  protected valueInDisplayTimeZone = computed((): string => {
    const val = this.value();
    if (!val) return '';

    const displayTz = this.effectiveDisplayTimeZone();
    if (val.timeZoneId === displayTz) {
      return this.formatZonedDateTime(val);
    }

    // Convert to display timezone
    const inDisplayTz = val.toInstant().toZonedDateTimeISO(displayTz);
    return this.formatZonedDateTime(inDisplayTz);
  });

  /**
   * The currently displayed value based on which timezone view is active.
   */
  protected currentDisplayedValue = computed((): string => {
    if (this.showingValueTimeZone()) {
      return this.valueInValueTimeZone();
    }
    return this.valueInDisplayTimeZone();
  });

  /**
   * Computed info for timezone display in trigger tooltip and panel.
   * Returns both display and value timezone info.
   */
  protected popoverTimeZoneInfo = computed(() => {
    const val = this.value();
    const displayTz = this.effectiveDisplayTimeZone();
    const valueTz = this.valueTimeZone();

    return {
      displayTzName: this.displayTimeZoneDisplayName(),
      displayTzOffset: this.getOffsetForTimeZone(displayTz),
      valueTzName: this.valueTimeZoneDisplayName(),
      valueTzOffset: valueTz ? this.getOffsetForTimeZone(valueTz) : '',
    };
  });

  /** All IANA timezones from the browser */
  private readonly allTimezones: string[] = ['UTC', ...Intl.supportedValuesOf('timeZone')];

  /**
   * Filtered timezone options for the select dropdowns.
   * If timezoneFilter is empty, all timezones are available.
   * Supports wildcards: 'Europe/*', '*New*', etc.
   */
  protected readonly timezoneOptions = computed<CoarSelectOption<string>[]>(() => {
    const filters = this.timezoneFilter();

    if (!filters || filters.length === 0) {
      // No filter: return all timezones
      return this.allTimezones.map(tz => ({ value: tz, label: tz }));
    }

    // Convert wildcard patterns to regex
    const regexPatterns = filters.map(pattern => {
      // Escape regex special chars except *, then convert * to .*
      const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      return new RegExp(`^${escaped}$`, 'i');
    });

    // Filter timezones that match any pattern
    const filtered = this.allTimezones.filter(tz => regexPatterns.some(regex => regex.test(tz)));

    return filtered.map(tz => ({ value: tz, label: tz }));
  });

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
  /**
   * The value converted to the current working (display) timezone.
   * Used to extract date/time for the calendar and time picker.
   */
  protected valueInWorkingTimeZone = computed((): Temporal.ZonedDateTime | null => {
    const val = this.value();
    if (!val) return null;

    const workingTz = this.currentWorkingTimeZone();
    const valueTz = val.timeZoneId;

    // If same timezone, no conversion needed
    if (workingTz === valueTz) return val;

    // Convert to working timezone
    return val.toInstant().toZonedDateTimeISO(workingTz);
  });

  /** Extract date portion from value in working timezone */
  protected selectedDate = computed((): Temporal.PlainDate | null => {
    const val = this.valueInWorkingTimeZone();
    return val ? val.toPlainDate() : null;
  });

  /** Extract time portion from value in working timezone */
  protected selectedTime = computed((): CoarTimeValue | null => {
    const val = this.valueInWorkingTimeZone();
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

  /**
   * The derived instant (UTC) from the current value.
   * Null if no value is selected.
   */
  protected derivedInstant = computed((): Temporal.Instant | null => {
    const val = this.value();
    return val ? val.toInstant() : null;
  });

  // ============================================================
  // Abstract Method Implementations
  // ============================================================

  protected override getValue(): Temporal.ZonedDateTime | null {
    return this.value();
  }

  // ============================================================
  // Constructor & Lifecycle
  // ============================================================

  constructor() {
    super();

    // Sync display value with selected value (in current display timezone)
    effect(() => {
      const displayed = this.currentDisplayedValue();
      this.displayValue.set(displayed);
    });

    // Emit instant changes
    effect(() => {
      const instant = this.derivedInstant();
      this.instantChange.emit(instant);
    });

    // Keep Maskito config in sync
    effect(() => {
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
    this.instantChange.emit(null);
    this.cvaOnChange(null);
  }

  // ============================================================
  // Calendar Event Handlers
  // ============================================================

  /**
   * Handle date selection from calendar.
   * The date/time is edited in the current working timezone,
   * but the value timezone is preserved (unless explicitly changed).
   */
  protected onDateSelected(date: Temporal.PlainDate): void {
    const time = this.selectedTime() ?? this.defaultTime();
    const valueTz = this.valueTimeZone();

    const plainDateTime = date.toPlainDateTime({
      hour: time.hours,
      minute: coarRoundMinutesToStep(time.minutes, this.minuteStep()),
    });

    // If we have an existing value, preserve its timezone (intent)
    // Otherwise use the display timezone for new values
    const targetTz = valueTz ?? this.effectiveDisplayTimeZone();

    // If editing in display timezone but value has different timezone,
    // we need to convert the selected time to the value timezone
    const workingTz = this.currentWorkingTimeZone();
    let zonedDateTime: Temporal.ZonedDateTime;

    if (workingTz !== targetTz) {
      // User is editing in display timezone, convert to value timezone
      const inWorkingTz = plainDateTime.toZonedDateTime(workingTz);
      zonedDateTime = inWorkingTz.toInstant().toZonedDateTimeISO(targetTz);
    } else {
      zonedDateTime = plainDateTime.toZonedDateTime(targetTz);
    }

    // Clamp to min/max bounds
    zonedDateTime = this.clampZonedDateTimeToRange(zonedDateTime);

    this.value.set(zonedDateTime);
    this.valueChange.emit(zonedDateTime);
    this.cvaOnChange(zonedDateTime);
  }

  /**
   * Handle time changes from time picker.
   * Preserves the value timezone (intent).
   */
  protected onTimeChanged(time: CoarTimeValue | null): void {
    if (!time) return;

    const currentDate = this.selectedDate();
    if (currentDate) {
      const valueTz = this.valueTimeZone();
      const targetTz = valueTz ?? this.effectiveDisplayTimeZone();
      const workingTz = this.currentWorkingTimeZone();

      const plainDateTime = currentDate.toPlainDateTime({
        hour: time.hours,
        minute: time.minutes,
      });

      let zonedDateTime: Temporal.ZonedDateTime;

      if (workingTz !== targetTz) {
        const inWorkingTz = plainDateTime.toZonedDateTime(workingTz);
        zonedDateTime = inWorkingTz.toInstant().toZonedDateTimeISO(targetTz);
      } else {
        zonedDateTime = plainDateTime.toZonedDateTime(targetTz);
      }

      zonedDateTime = this.clampZonedDateTimeToRange(zonedDateTime);

      this.value.set(zonedDateTime);
      this.valueChange.emit(zonedDateTime);
      this.cvaOnChange(zonedDateTime);
    } else {
      this.pendingTime.set(time);
    }
  }

  /**
   * Handle display timezone change (viewing lens).
   * This does NOT change the value - only how it's displayed.
   */
  protected onDisplayTimeZoneChanged(newTimeZone: string | null): void {
    this.displayTimeZone.set(newTimeZone);
  }

  /**
   * Toggle between showing value in display timezone vs value timezone.
   * Used by the indicator icon in the trigger.
   */
  protected toggleTimeZoneView(): void {
    this.showingValueTimeZone.set(!this.showingValueTimeZone());
  }

  /**
   * Start editing the value timezone (unlock).
   */
  protected startEditingValueTimeZone(): void {
    if (this.timeZoneLocked()) return;
    this.isEditingValueTimeZone.set(true);
  }

  /**
   * Cancel editing the value timezone.
   */
  protected cancelEditingValueTimeZone(): void {
    this.isEditingValueTimeZone.set(false);
  }

  /**
   * Change the value timezone (intent).
   * This is an EXPLICIT action - the value's local time stays the same,
   * but it's now interpreted in a different timezone.
   */
  protected onValueTimeZoneChanged(newTimeZone: string | null): void {
    if (!newTimeZone || this.timeZoneLocked()) return;

    const currentValue = this.value();
    if (currentValue) {
      // Keep the same local date/time, but change the timezone (intent)
      const plainDateTime = currentValue.toPlainDateTime();
      const newZonedDateTime = plainDateTime.toZonedDateTime(newTimeZone);

      this.value.set(newZonedDateTime);
      this.valueChange.emit(newZonedDateTime);
      this.cvaOnChange(newZonedDateTime);
    }

    // Auto-lock after selection
    this.isEditingValueTimeZone.set(false);
  }

  /**
   * Clamps a ZonedDateTime to be within the min/max range.
   */
  private clampZonedDateTimeToRange(zonedDateTime: Temporal.ZonedDateTime): Temporal.ZonedDateTime {
    const minDateTime = this.min();
    const maxDateTime = this.max();

    if (minDateTime) {
      const minInstant = minDateTime.toInstant();
      const valueInstant = zonedDateTime.toInstant();
      if (Temporal.Instant.compare(valueInstant, minInstant) < 0) {
        // Return min in the value's timezone for consistency
        return minInstant.toZonedDateTimeISO(zonedDateTime.timeZoneId);
      }
    }

    if (maxDateTime) {
      const maxInstant = maxDateTime.toInstant();
      const valueInstant = zonedDateTime.toInstant();
      if (Temporal.Instant.compare(valueInstant, maxInstant) > 0) {
        return maxInstant.toZonedDateTimeISO(zonedDateTime.timeZoneId);
      }
    }

    return zonedDateTime;
  }

  // ============================================================
  // CVA Methods
  // ============================================================

  writeValue(value: Temporal.ZonedDateTime | string | null): void {
    if (value === null || value === undefined) {
      this.value.set(null);
      this.pendingTime.set(null);
    } else if (typeof value === 'string') {
      try {
        this.value.set(Temporal.ZonedDateTime.from(value));
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

  private formatValue(val: Temporal.ZonedDateTime): string {
    const datePart = coarFormatPlainDate(val.toPlainDate(), this.dateFormat());
    const timePart = coarFormatTime(val.hour, val.minute, this.effectiveUse24Hour());
    return `${datePart} ${timePart}`;
  }

  private parseValueFromInput(text: string): Temporal.ZonedDateTime | null {
    if (!text) return null;

    const parts = text.split(' ');
    if (parts.length < 2) return null;

    const datePart = parts[0];
    const date = coarParsePlainDateFromInput(datePart, this.dateFormat(), {
      min: this.minDate(),
      max: this.maxDate(),
    });

    if (!date) return null;

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

    const plainDateTime = date.toPlainDateTime({ hour: hours, minute: minutes });
    // Parse input in the value timezone (preserving the event's intent)
    // If no value exists yet, use the display timezone as the initial timezone
    const targetTz = this.valueTimeZone() ?? this.effectiveDisplayTimeZone();
    return plainDateTime.toZonedDateTime(targetTz);
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

    const options = maskitoDateTimeOptionsGenerator({
      dateMode: modeMap[format],
      timeMode: 'HH:MM',
      dateSeparator: separator,
      min: minDate ? coarTemporalPlainDateToDate(minDate) : undefined,
      max: maxDate ? coarTemporalPlainDateToDate(maxDate) : undefined,
    });

    this.maskitoInstance = new Maskito(inputElement, options);
  }

  /**
   * Get UTC offset string for a given timezone.
   */
  private getOffsetForTimeZone(tz: string): string {
    const val = this.value();
    const instant = val?.toInstant() ?? Temporal.Now.instant();
    const zoned = instant.toZonedDateTimeISO(tz);

    const offsetNs = zoned.offsetNanoseconds;
    const offsetMinutes = Math.floor(offsetNs / 60_000_000_000);
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    return `${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Format a ZonedDateTime for display.
   */
  private formatZonedDateTime(val: Temporal.ZonedDateTime): string {
    const datePart = coarFormatPlainDate(val.toPlainDate(), this.dateFormat());
    const timePart = coarFormatTime(val.hour, val.minute, this.effectiveUse24Hour());
    return `${datePart} ${timePart}`;
  }
}
