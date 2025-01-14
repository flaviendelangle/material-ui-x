import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import { PickerValidDate } from '../../../../../models';
import { useNow, useUtils } from '../../../../hooks/useUtils';
import { findClosestEnabledDate } from '../../../../utils/date-utils';
import { useCompositeListItem } from '../../../composite/list/useCompositeListItem';
import { useBaseCalendarRootContext } from '../root/BaseCalendarRootContext';
import { useBaseCalendarYearsCell } from './useBaseCalendarYearsCell';
import { useBaseCalendarYearsGridOrListContext } from '../years-grid/BaseCalendarYearsGridOrListContext';

export function useBaseCalendarYearsCellWrapper(
  parameters: useBaseCalendarYearsCellWrapper.Parameters,
): useBaseCalendarYearsCellWrapper.ReturnValue {
  const { forwardedRef, value } = parameters;
  const baseRootContext = useBaseCalendarRootContext();
  const baseYearsListOrGridContext = useBaseCalendarYearsGridOrListContext();
  const { ref: listItemRef } = useCompositeListItem();
  const utils = useUtils();
  const now = useNow(baseRootContext.timezone);
  const mergedRef = useForkRef(forwardedRef, listItemRef);

  const isSelected = React.useMemo(
    () => baseRootContext.selectedDates.some((date) => utils.isSameYear(date, value)),
    [baseRootContext.selectedDates, value, utils],
  );

  const isCurrent = React.useMemo(() => utils.isSameYear(value, utils.date()), [utils, value]);

  const isInvalid = React.useMemo(() => {
    if (baseRootContext.dateValidationProps.disablePast && utils.isBeforeYear(value, now)) {
      return true;
    }
    if (baseRootContext.dateValidationProps.disableFuture && utils.isAfterYear(value, now)) {
      return true;
    }
    if (
      baseRootContext.dateValidationProps.minDate &&
      utils.isBeforeYear(value, baseRootContext.dateValidationProps.minDate)
    ) {
      return true;
    }
    if (
      baseRootContext.dateValidationProps.maxDate &&
      utils.isAfterYear(value, baseRootContext.dateValidationProps.maxDate)
    ) {
      return true;
    }

    if (!baseRootContext.dateValidationProps.shouldDisableYear) {
      return false;
    }

    const yearToValidate = utils.startOfYear(value);

    return baseRootContext.dateValidationProps.shouldDisableYear(yearToValidate);
  }, [baseRootContext.dateValidationProps, value, now, utils]);

  const isDisabled = React.useMemo(() => {
    if (baseRootContext.disabled) {
      return true;
    }

    return isInvalid;
  }, [baseRootContext.disabled, isInvalid]);

  const isTabbable = React.useMemo(
    () => baseYearsListOrGridContext.tabbableYears.some((year) => utils.isSameYear(year, value)),
    [baseYearsListOrGridContext, value, utils],
  );

  const selectYear = useEventCallback((newValue: PickerValidDate) => {
    if (baseRootContext.readOnly) {
      return;
    }

    const newCleanValue = utils.setYear(baseRootContext.currentDate, utils.getYear(newValue));

    const startOfYear = utils.startOfYear(newCleanValue);
    const endOfYear = utils.endOfYear(newCleanValue);

    const closestEnabledDate = baseRootContext.isDateInvalid(newCleanValue)
      ? findClosestEnabledDate({
          utils,
          date: newCleanValue,
          minDate: utils.isBefore(baseRootContext.dateValidationProps.minDate, startOfYear)
            ? startOfYear
            : baseRootContext.dateValidationProps.minDate,
          maxDate: utils.isAfter(baseRootContext.dateValidationProps.maxDate, endOfYear)
            ? endOfYear
            : baseRootContext.dateValidationProps.maxDate,
          disablePast: baseRootContext.dateValidationProps.disablePast,
          disableFuture: baseRootContext.dateValidationProps.disableFuture,
          isDateDisabled: baseRootContext.isDateInvalid,
          timezone: baseRootContext.timezone,
        })
      : newCleanValue;

    if (closestEnabledDate) {
      baseRootContext.selectDate(closestEnabledDate, { section: 'year' });
    }
  });

  const ctx = React.useMemo<useBaseCalendarYearsCell.Context>(
    () => ({
      isSelected,
      isDisabled,
      isInvalid,
      isTabbable,
      isCurrent,
      selectYear,
    }),
    [isSelected, isDisabled, isInvalid, isTabbable, isCurrent, selectYear],
  );

  return { ref: mergedRef, ctx };
}

export namespace useBaseCalendarYearsCellWrapper {
  export interface Parameters extends Pick<useBaseCalendarYearsCell.Parameters, 'value'> {
    /**
     * The ref forwarded by the parent component.
     */
    forwardedRef: React.ForwardedRef<HTMLButtonElement>;
  }

  export interface ReturnValue {
    /**
     * The ref to forward to the component.
     */
    ref: React.RefCallback<HTMLButtonElement> | null;
    /**
     * The memoized context to forward to the memoized component so that it does not need to subscribe to any context.
     */
    ctx: useBaseCalendarYearsCell.Context;
  }
}
