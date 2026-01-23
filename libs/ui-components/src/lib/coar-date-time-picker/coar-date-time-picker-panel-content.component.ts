import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Temporal } from '@js-temporal/polyfill';

import { CoarIconComponent } from '../coar-icon/coar-icon.component';
import { CoarScrollableCalendarComponent } from '../coar-scrollable-calendar/coar-scrollable-calendar.component';
import { CoarScrollbarDirective } from '../coar-scrollbar/coar-scrollbar.directive';
import { CoarTimePickerComponent } from '../coar-time-picker/coar-time-picker.component';

import type { DateFormatConfig } from '../date/coar-date-format';
import type { CoarDateMarker } from '../date/coar-date-marker';
import type { CoarTimeValue } from '../date/coar-time-helpers';
import type { CoarDateTimePickerMode } from './coar-date-time-picker.component';

@Component({
  selector: 'coar-date-time-picker-panel-content',
  standalone: true,
  imports: [
    CoarIconComponent,
    CoarScrollableCalendarComponent,
    CoarTimePickerComponent,
    CoarScrollbarDirective,
  ],
  templateUrl: './coar-date-time-picker-panel-content.component.html',
  styleUrl: './coar-date-time-picker-panel-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoarDateTimePickerPanelContentComponent {
  value = input<Temporal.PlainDate | null>(null);

  activeMonth = input<Temporal.PlainYearMonth>(Temporal.Now.plainDateISO().toPlainYearMonth());
  activeMonthChange = output<Temporal.PlainYearMonth>();

  min = input<Temporal.PlainDate | null>(null);
  max = input<Temporal.PlainDate | null>(null);

  locale = input<string>('');
  dateFormatConfig = input<DateFormatConfig>();

  showWeekNumbers = input<boolean>(false);
  highlightWeekends = input<boolean>(false);
  markers = input<CoarDateMarker[]>([]);

  showCurrentMonthButton = input<boolean>(true);
  currentMonthScrollDirection = input<'up' | 'down' | 'hidden'>('hidden');

  currentYear = input<number>(Temporal.Now.plainDateISO().year);
  isPrevYearDisabled = input<boolean>(false);
  isNextYearDisabled = input<boolean>(false);

  monthItems = input<
    ReadonlyArray<{
      month: number;
      name: string;
      isActive: boolean;
      yearMonth: Temporal.PlainYearMonth;
    }>
  >([]);

  mode = input<CoarDateTimePickerMode>('datetime');
  selectedTime = input<CoarTimeValue | null>(null);
  use24Hour = input<boolean | 'auto'>('auto');
  minuteStep = input<1 | 5 | 10 | 15>(5);

  disabled = input<boolean>(false);
  readonly = input<boolean>(false);

  selectedDateMarkers = input<CoarDateMarker[]>([]);

  dateSelected = output<Temporal.PlainDate>();
  scrollToCurrentMonth = output<void>();
  previousYear = output<void>();
  nextYear = output<void>();
  selectMonth = output<Temporal.PlainYearMonth>();
  timeChanged = output<CoarTimeValue | null>();
}
