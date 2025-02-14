import * as React from 'react';
import { PickerValidDate } from '../../../../../models';
import { getMonthsInYear } from '../../../../utils/date-utils';
import { useUtils } from '../../../../hooks/useUtils';
import { getFirstEnabledYear, getLastEnabledYear } from './date';
import { useBaseCalendarRootContext } from '../root/BaseCalendarRootContext';
import { BaseCalendarMonthCollectionContext } from './BaseCalendarMonthCollectionContext';
import { useCellList } from './useCellList';
import { useBaseCalendarRootVisibleDateContext } from '../root/BaseCalendarRootVisibleDateContext';

export function useMonthCells(parameters: useMonthCells.Parameters): useMonthCells.ReturnValue {
  const { getItems, focusOnMount } = parameters;
  const baseRootContext = useBaseCalendarRootContext();
  const baseRootVisibleDateContext = useBaseCalendarRootVisibleDateContext();
  const utils = useUtils();

  const currentYear = React.useMemo(
    () => utils.startOfYear(baseRootVisibleDateContext.visibleDate),
    [utils, baseRootVisibleDateContext.visibleDate],
  );

  const items = React.useMemo(() => {
    const getDefaultItems = () => getMonthsInYear(utils, currentYear);

    if (getItems) {
      return getItems({
        year: currentYear,
        getDefaultItems,
      });
    }

    return getDefaultItems();
  }, [utils, getItems, currentYear]);

  const { scrollerRef } = useCellList({ focusOnMount, section: 'month', value: currentYear });

  const tabbableMonths = React.useMemo(() => {
    let tempTabbableDays: PickerValidDate[] = [];
    tempTabbableDays = items.filter((day) =>
      baseRootContext.selectedDates.some((selectedDay) => utils.isSameMonth(day, selectedDay)),
    );

    if (tempTabbableDays.length === 0) {
      tempTabbableDays = items.filter((day) => utils.isSameMonth(day, baseRootContext.currentDate));
    }

    if (tempTabbableDays.length === 0) {
      tempTabbableDays = [items[0]];
    }

    return tempTabbableDays;
  }, [baseRootContext.currentDate, baseRootContext.selectedDates, items, utils]);

  const monthsListOrGridContext = React.useMemo<BaseCalendarMonthCollectionContext>(
    () => ({
      tabbableMonths,
    }),
    [tabbableMonths],
  );

  const changePage = (direction: 'next' | 'previous') => {
    // TODO: Jump over months with no valid date.
    if (direction === 'previous') {
      const targetDate = utils.addYears(
        utils.startOfYear(baseRootVisibleDateContext.visibleDate),
        -baseRootContext.yearPageSize,
      );
      const lastYearInNewPage = utils.addYears(targetDate, baseRootContext.yearPageSize - 1);

      // All the years before the visible ones are fully disabled, we skip the navigation.
      if (
        utils.isAfter(
          getFirstEnabledYear(utils, baseRootContext.dateValidationProps),
          lastYearInNewPage,
        )
      ) {
        return;
      }

      baseRootContext.setVisibleDate(
        utils.addYears(baseRootVisibleDateContext.visibleDate, -baseRootContext.yearPageSize),
        false,
      );
    }
    if (direction === 'next') {
      const targetDate = utils.addYears(
        utils.startOfYear(baseRootVisibleDateContext.visibleDate),
        baseRootContext.yearPageSize,
      );

      // All the years after the visible ones are fully disabled, we skip the navigation.
      if (
        utils.isBefore(getLastEnabledYear(utils, baseRootContext.dateValidationProps), targetDate)
      ) {
        return;
      }
      baseRootContext.setVisibleDate(
        utils.addYears(baseRootVisibleDateContext.visibleDate, baseRootContext.yearPageSize),
        false,
      );
    }
  };

  return { items, monthsListOrGridContext, changePage, scrollerRef };
}

export namespace useMonthCells {
  export interface Parameters extends useCellList.PublicParameters {
    /**
     * Generate the list of items to render the given visible date.
     * @param {GetCellsParameters} parameters The current parameters of the list.
     * @returns {PickerValidDate[]} The list of items.
     */
    getItems?: (parameters: GetCellsParameters) => PickerValidDate[];
  }

  export interface GetCellsParameters {
    year: PickerValidDate;
    getDefaultItems: () => PickerValidDate[];
  }

  export interface ReturnValue extends useCellList.ReturnValue {
    items: PickerValidDate[];
    monthsListOrGridContext: BaseCalendarMonthCollectionContext;
    changePage: (direction: 'next' | 'previous') => void;
  }
}
