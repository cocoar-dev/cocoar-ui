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

import { Temporal } from '@js-temporal/polyfill';
import { of } from 'rxjs';

import type { DateFormatConfig } from '../_shared/coar-date-format';
import type { CoarDateMarker } from '../_shared/coar-date-marker';
import {
  coarCalculateIsoWeekNumber,
  coarDetectDateFormatPatternFromIntl,
  coarGetCalendarGridDates,
  coarGetLocalizedWeekdays,
  coarClampPlainDate,
} from '../_shared/coar-date-helpers';

import { CoarIconComponent } from '../../display/icon/coar-icon.component';
import { CoarPopoverComponent } from '../../overlay/popover/coar-popover.component';
import { CoarPopoverGroupService } from '../../overlay/popover/coar-popover-group.service';
import {
  CoarI18nPipe,
  CoarLocalizationService,
  CoarLocalizationDataStore,
  CoarTimeZoneService,
} from '@cocoar/localization';

@Component({
  selector: 'coar-mini-calendar',
  standalone: true,
  imports: [CoarIconComponent, CoarPopoverComponent, CoarI18nPipe],
  templateUrl: './coar-mini-calendar.component.html',
  styleUrl: './coar-mini-calendar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CoarPopoverGroupService],
})
export class CoarMiniCalendarComponent {
  private readonly localizationService = inject(CoarLocalizationService, { optional: true });
  private readonly localizationDataStore = inject(CoarLocalizationDataStore, { optional: true });
  private readonly timeZoneService = inject(CoarTimeZoneService, { optional: true });

  /** Current language from localization service (reactive) */
  private readonly currentLanguage = toSignal(
    this.localizationService?.languageState.value$ ?? of(''),
    {
      initialValue: this.localizationService?.languageState.value ?? '',
    }
  );

  /** Current selected date (two-way bindable with [(value)]) */
  value = model<Temporal.PlainDate | null>(null);
  valueChange = output<Temporal.PlainDate | null>();

  /** Minimum selectable date */
  min = input<Temporal.PlainDate | null>(null);

  /** Maximum selectable date */
  max = input<Temporal.PlainDate | null>(null);

  /**
   * Locale identifier for date formatting (e.g., 'de-AT', 'en-US').
   * Uses global locale service default if not specified.
   */
  locale = input<string>();

  /** Date format configuration (pattern and first day of week) */
  dateFormatConfig = input<DateFormatConfig>();

  /** Whether to show a "Today" button */
  showTodayButton = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Whether to show week numbers */
  showWeekNumbers = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Whether to highlight weekend days (Saturday/Sunday) with a subtle background */
  highlightWeekends = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** Date markers for highlighting special dates (holidays, events, etc.) */
  markers = input<CoarDateMarker[]>([]);

  /** Maximum number of lines shown in the marker popover (including "+N" line). */
  protected readonly markerPopoverMaxLines = 5;

  /** Visible markers before switching to "+N other events". */
  protected readonly markerPopoverVisibleMarkers = 4;

  /**
   * Today's date based on the configured timezone.
   * Reactive: updates when timezone changes.
   */
  protected readonly today = computed(() => {
    const tz = this.timeZoneService?.currentTimeZone();
    if (tz) {
      return Temporal.Now.plainDateISO(tz);
    }
    return Temporal.Now.plainDateISO();
  });

  /** Currently viewed month/year in the calendar */
  protected viewDate = signal<Temporal.PlainYearMonth>(
    Temporal.Now.plainDateISO().toPlainYearMonth()
  );

  /** Focused date in the calendar (for keyboard navigation) */
  protected focusedDate = signal<Temporal.PlainDate | null>(null);

  /**
   * Effective locale for calendar month/year display.
   * Priority: input locale > locale service language > browser locale
   */
  protected effectiveLocale = computed(() => {
    return this.locale() ?? this.currentLanguage() ?? navigator.language;
  });

  protected effectiveDateFormat = computed((): DateFormatConfig => {
    const directConfig = this.dateFormatConfig();
    if (directConfig) return directConfig;

    // Try to get from localization data store using the language key
    // The store uses language codes ('en', 'de') not full locales ('en-GB')
    // Read dataVersion to establish signal dependency for async loading
    const _version = this.localizationDataStore?.dataVersion();
    const language = this.currentLanguage();
    const localeData = language ? this.localizationDataStore?.getLocaleData(language) : undefined;
    if (localeData?.date) {
      // Convert 0-6 (Sun-Sat) format to ISO 1-7 (Mon-Sun) format
      const isoFirstDay = localeData.date.firstDayOfWeek === 0 ? 7 : localeData.date.firstDayOfWeek;
      return {
        pattern: localeData.date.pattern,
        firstDayOfWeek: isoFirstDay as 1 | 7,
      };
    }

    // Fallback: detect pattern from Intl, default firstDayOfWeek to Monday
    const detectedPattern = coarDetectDateFormatPatternFromIntl(this.effectiveLocale());
    return { pattern: detectedPattern ?? 'dd.mm.yyyy', firstDayOfWeek: 1 };
  });

  protected firstDayOfWeek = computed(() => this.effectiveDateFormat().firstDayOfWeek);

  protected daysOfWeek = computed(() =>
    coarGetLocalizedWeekdays(this.effectiveLocale(), this.firstDayOfWeek())
  );

  protected calendarDays = computed(() => {
    const viewMonth = this.viewDate();
    const grid = coarGetCalendarGridDates(viewMonth, this.firstDayOfWeek());
    return grid.map((cell) => this.createCalendarDay(cell.date, cell.isOutsideMonth));
  });

  protected viewMonth = computed(() => {
    const viewMonth = this.viewDate();
    const formatter = new Intl.DateTimeFormat(this.effectiveLocale(), { month: 'long' });
    const jsDate = new Date(viewMonth.year, viewMonth.month - 1, 1);
    return formatter.format(jsDate);
  });

  protected viewYear = computed(() => this.viewDate().year);

  protected weekNumbers = computed(() => {
    const days = this.calendarDays();
    const weeks: number[] = [];

    for (let i = 0; i < 6; i++) {
      const firstDayOfWeek = days[i * 7];
      if (firstDayOfWeek) {
        const weekNum =
          firstDayOfWeek.date.weekOfYear ?? coarCalculateIsoWeekNumber(firstDayOfWeek.date);
        weeks.push(weekNum);
      }
    }

    return weeks;
  });

  constructor() {
    // Keep the view month in sync when a value is provided/changed.
    effect(() => {
      const val = this.value();
      if (!val) return;
      this.viewDate.set(val.toPlainYearMonth());

      // Set a sensible default focus when a value arrives.
      if (!this.focusedDate()) {
        this.focusedDate.set(val);
      }
    });

    // Default focus when no value is set.
    effect(() => {
      if (this.value()) return;
      if (this.focusedDate()) return;
      this.focusedDate.set(this.today());
    });
  }

  previousMonth(): void {
    this.viewDate.update((d) => d.subtract({ months: 1 }));
  }

  nextMonth(): void {
    this.viewDate.update((d) => d.add({ months: 1 }));
  }

  previousYear(): void {
    this.viewDate.update((d) => d.subtract({ years: 1 }));
  }

  nextYear(): void {
    this.viewDate.update((d) => d.add({ years: 1 }));
  }

  goToToday(): void {
    this.viewDate.set(this.today().toPlainYearMonth());
    this.focusedDate.set(this.today());
  }

  selectDate(date: Temporal.PlainDate): void {
    if (this.isDateDisabled(date)) return;

    this.value.set(date);
    this.valueChange.emit(date);
    this.focusedDate.set(date);
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const focused = this.focusedDate();
        if (focused) {
          this.selectDate(focused);
        }
        break;
      }
      case 'ArrowLeft':
        event.preventDefault();
        this.moveFocus(-1, 'day');
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.moveFocus(1, 'day');
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-7, 'day');
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(7, 'day');
        break;
      case 'PageUp':
        event.preventDefault();
        if (event.shiftKey) {
          this.moveFocus(-1, 'year');
        } else {
          this.moveFocus(-1, 'month');
        }
        break;
      case 'PageDown':
        event.preventDefault();
        if (event.shiftKey) {
          this.moveFocus(1, 'year');
        } else {
          this.moveFocus(1, 'month');
        }
        break;
      case 'Home':
        event.preventDefault();
        this.goToToday();
        break;
    }
  }

  protected getVisibleMarkers(markers: CoarDateMarker[]): CoarDateMarker[] {
    if (markers.length <= this.markerPopoverMaxLines) {
      return markers;
    }
    return markers.slice(0, this.markerPopoverVisibleMarkers);
  }

  protected getHiddenMarkerCount(markers: CoarDateMarker[]): number {
    if (markers.length <= this.markerPopoverMaxLines) {
      return 0;
    }
    return Math.max(0, markers.length - this.markerPopoverVisibleMarkers);
  }

  private getMarkersForDate(date: Temporal.PlainDate): CoarDateMarker[] {
    const markers = this.markers();
    const matches: CoarDateMarker[] = [];

    for (const marker of markers) {
      const start = marker.startDate;
      const end = marker.endDate ?? marker.startDate;

      if (
        Temporal.PlainDate.compare(date, start) >= 0 &&
        Temporal.PlainDate.compare(date, end) <= 0
      ) {
        matches.push(marker);
      }
    }

    return matches;
  }

  private isDateDisabled(date: Temporal.PlainDate): boolean {
    const minDate = this.min();
    const maxDate = this.max();

    if (minDate && Temporal.PlainDate.compare(date, minDate) < 0) return true;
    if (maxDate && Temporal.PlainDate.compare(date, maxDate) > 0) return true;

    return false;
  }

  private moveFocus(amount: number, unit: 'day' | 'month' | 'year'): void {
    const current = this.focusedDate() ?? this.value() ?? this.today();

    let newDate: Temporal.PlainDate;
    switch (unit) {
      case 'day':
        newDate = current.add({ days: amount });
        break;
      case 'month':
        newDate = current.add({ months: amount });
        break;
      case 'year':
        newDate = current.add({ years: amount });
        break;
    }

    newDate = coarClampPlainDate(newDate, { min: this.min(), max: this.max() });

    this.focusedDate.set(newDate);
    this.viewDate.set(newDate.toPlainYearMonth());
  }

  private createCalendarDay(date: Temporal.PlainDate, isOutsideMonth: boolean): CalendarDay {
    const selected = this.value();
    const focused = this.focusedDate();

    const dayOfWeek = date.dayOfWeek;
    const markers = this.getMarkersForDate(date);

    return {
      date,
      day: date.day,
      isOutsideMonth,
      isToday: Temporal.PlainDate.compare(date, this.today()) === 0,
      isSelected: selected ? Temporal.PlainDate.compare(date, selected) === 0 : false,
      isFocused: focused ? Temporal.PlainDate.compare(date, focused) === 0 : false,
      isDisabled: this.isDateDisabled(date),
      isWeekend: dayOfWeek === 6 || dayOfWeek === 7,
      markers,
      markerCssClass: markers[0]?.cssClass ?? null,
    };
  }
}

interface CalendarDay {
  date: Temporal.PlainDate;
  day: number;
  isOutsideMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isDisabled: boolean;
  isWeekend: boolean;
  markers: CoarDateMarker[];
  markerCssClass: string | null;
}
