import * as React from 'react';
import { PickerValidDate } from '../../../../../models';

export interface BaseCalendarYearCollectionContext {
  tabbableYears: PickerValidDate[];
}

export const BaseCalendarYearCollectionContext = React.createContext<
  BaseCalendarYearCollectionContext | undefined
>(undefined);

if (process.env.NODE_ENV !== 'production') {
  BaseCalendarYearCollectionContext.displayName = 'BaseCalendarYearCollectionContext';
}

export function useBaseCalendarYearCollectionContext() {
  const context = React.useContext(BaseCalendarYearCollectionContext);
  if (context === undefined) {
    throw new Error(
      [
        'Base UI X: BaseCalendarYearCollectionContext is missing.',
        '<Calendar.YearCell /> must be placed within <Calendar.YearList /> or <Calendar.YearGrid />.',
        '<RangeCalendar.YearCell /> must be placed within <RangeCalendar.YearList /> or <RangeCalendar.YearGrid />.',
      ].join('\n'),
    );
  }
  return context;
}

export function useNullableBaseCalendarYearCollectionContext() {
  return React.useContext(BaseCalendarYearCollectionContext) ?? null;
}
