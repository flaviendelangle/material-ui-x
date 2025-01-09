import * as React from 'react';
import { DateValidationError, PickerValidDate } from '../../../../models';
import { useDateManager } from '../../../../managers';
import { ExportedValidateDateProps, ValidateDateProps } from '../../../../validation/validateDate';
import { useUtils } from '../../../hooks/useUtils';
import { PickerValue } from '../../../models';
import { CalendarRootContext } from './CalendarRootContext';
import { mergeReactProps } from '../../base-utils/mergeReactProps';
import { GenericHTMLProps } from '../../base-utils/types';
import {
  useAddDefaultsToBaseDateValidationProps,
  useBaseCalendarRoot,
} from '../../utils/base-calendar/root/useBaseCalendarRoot';

export function useCalendarRoot(parameters: useCalendarRoot.Parameters) {
  const {
    // Validation props
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    shouldDisableDate,
    shouldDisableMonth,
    shouldDisableYear,
    // Parameters forwarded to `useBaseCalendarRoot`
    ...baseParameters
  } = parameters;
  const utils = useUtils();
  const manager = useDateManager();

  const baseDateValidationProps = useAddDefaultsToBaseDateValidationProps({
    minDate,
    maxDate,
    disablePast,
    disableFuture,
  });

  const validationProps = React.useMemo<ValidateDateProps>(
    () => ({
      ...baseDateValidationProps,
      shouldDisableDate,
      shouldDisableMonth,
      shouldDisableYear,
    }),
    [baseDateValidationProps, shouldDisableDate, shouldDisableMonth, shouldDisableYear],
  );

  const {
    value,
    setVisibleDate,
    isDateCellVisible,
    context: baseContext,
  } = useBaseCalendarRoot({
    ...baseParameters,
    manager,
    dateValidationProps: validationProps,
    valueValidationProps: validationProps,
    getDateToUseForReferenceDate: (initialValue) => initialValue,
    getNewValueFromNewSelectedDate: ({ selectedDate }) => ({
      value: selectedDate,
      changeImportance: 'accept',
    }),
    getCurrentDateFromValue: (currentValue) => currentValue,
    getSelectedDatesFromValue,
  });

  const [prevValue, setPrevValue] = React.useState<PickerValue>(value);
  if (value !== prevValue && utils.isValid(value)) {
    setPrevValue(value);
    if (isDateCellVisible(value)) {
      setVisibleDate(value);
    }
  }

  const context: CalendarRootContext = React.useMemo(
    () => ({
      value,
    }),
    [value],
  );

  const getRootProps = React.useCallback((externalProps: GenericHTMLProps) => {
    return mergeReactProps(externalProps, {});
  }, []);

  return React.useMemo(
    () => ({ getRootProps, context, baseContext }),
    [getRootProps, context, baseContext],
  );
}

export namespace useCalendarRoot {
  export interface Parameters
    extends useBaseCalendarRoot.PublicParameters<PickerValue, DateValidationError>,
      ExportedValidateDateProps {}
}

function getSelectedDatesFromValue(value: PickerValue): PickerValidDate[] {
  return value == null ? [] : [value];
}
