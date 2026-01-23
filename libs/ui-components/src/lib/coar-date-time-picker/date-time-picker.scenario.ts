import { defineScenario } from '@cocoar/scenar-abstractions';
import { CoarDateTimePickerComponent } from './coar-date-time-picker.component';

export const scenario = defineScenario<CoarDateTimePickerComponent>({
  id: 'date-time-picker',
  title: 'Date Time Picker',
  description: 'Default DateTimePicker. Click the calendar icon to open the popup.',
  inputs: {
    label: 'Appointment',
    mode: 'datetime',
    minuteStep: 5,
  },
});
