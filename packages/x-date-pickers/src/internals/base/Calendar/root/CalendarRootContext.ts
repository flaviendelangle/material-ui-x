import * as React from 'react';
import { PickersTimezone, PickerValidDate } from '../../../../models';
import { ValidateDateProps } from '../../../../validation';
import type { useCalendarRoot } from './useCalendarRoot';

export interface CalendarRootContext {
  value: PickerValidDate | null;
  setValue: (
    value: PickerValidDate | null,
    context: Pick<useCalendarRoot.ValueChangeHandlerContext, 'section'>,
  ) => void;
  referenceDate: PickerValidDate;
  timezone: PickersTimezone;
  disabled: boolean;
  readOnly: boolean;
  isDateDisabled: (day: PickerValidDate | null) => boolean;
  validationProps: ValidateDateProps;
  visibleDate: PickerValidDate;
  setVisibleDate: (visibleDate: PickerValidDate) => void;
  monthPageSize: number;
}

export const CalendarRootContext = React.createContext<CalendarRootContext | undefined>(undefined);

if (process.env.NODE_ENV !== 'production') {
  CalendarRootContext.displayName = 'CalendarRootContext';
}

export function useCalendarRootContext() {
  const context = React.useContext(CalendarRootContext);
  if (context === undefined) {
    throw new Error(
      'Base UI X: CalendarRootContext is missing. Calendar parts must be placed withing <Calendar.Root />.',
    );
  }
  return context;
}
