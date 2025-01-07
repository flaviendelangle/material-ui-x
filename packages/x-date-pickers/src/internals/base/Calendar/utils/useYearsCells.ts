import * as React from 'react';
import { PickerValidDate } from '../../../../models';
import { useUtils } from '../../../hooks/useUtils';
import { useBaseCalendarRootContext } from '../../utils/base-calendar/root/BaseCalendarRootContext';

export function useYearsCells(): useYearsCells.ReturnValue {
  const baseRootContext = useBaseCalendarRootContext();
  const utils = useUtils();

  const years = React.useMemo(
    () =>
      utils.getYearRange([
        baseRootContext.validationProps.minDate,
        baseRootContext.validationProps.maxDate,
      ]),
    [utils, baseRootContext.validationProps.minDate, baseRootContext.validationProps.maxDate],
  );

  const registerSection = baseRootContext.registerSection;
  React.useEffect(() => {
    return registerSection({ type: 'month', value: baseRootContext.visibleDate });
  }, [registerSection, baseRootContext.visibleDate]);

  return { years };
}

export namespace useYearsCells {
  export interface ReturnValue {
    years: PickerValidDate[];
  }
}
