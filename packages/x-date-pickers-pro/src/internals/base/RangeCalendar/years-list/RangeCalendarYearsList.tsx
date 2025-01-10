'use client';
import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { useBaseCalendarYearsList } from '@mui/x-date-pickers/internals/base/utils/base-calendar/years-list/useBaseCalendarYearsList';
// eslint-disable-next-line no-restricted-imports
import { BaseUIComponentProps } from '@mui/x-date-pickers/internals/base/base-utils/types';
// eslint-disable-next-line no-restricted-imports
import { useComponentRenderer } from '@mui/x-date-pickers/internals/base/base-utils/useComponentRenderer';
// eslint-disable-next-line no-restricted-imports
import { CompositeList } from '@mui/x-date-pickers/internals/base/composite/list/CompositeList';
// eslint-disable-next-line no-restricted-imports
import { BaseCalendarYearsGridOrListContext } from '@mui/x-date-pickers/internals/base/utils/base-calendar/years-grid/BaseCalendarYearsGridOrListContext';

const RangeCalendarYearsList = React.forwardRef(function CalendarYearsList(
  props: CalendarYearsList.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { className, render, children, loop, ...otherProps } = props;
  const { getYearsListProps, yearsCellRefs, yearsListOrGridContext } = useBaseCalendarYearsList({
    children,
    loop,
  });
  const state = React.useMemo(() => ({}), []);

  const { renderElement } = useComponentRenderer({
    propGetter: getYearsListProps,
    render: render ?? 'div',
    ref: forwardedRef,
    className,
    state,
    extraProps: otherProps,
  });

  return (
    <BaseCalendarYearsGridOrListContext.Provider value={yearsListOrGridContext}>
      <CompositeList elementsRef={yearsCellRefs}>{renderElement()}</CompositeList>
    </BaseCalendarYearsGridOrListContext.Provider>
  );
});

export namespace CalendarYearsList {
  export interface State {}

  export interface Props
    extends Omit<BaseUIComponentProps<'div', State>, 'children'>,
      useBaseCalendarYearsList.Parameters {}
}

export { RangeCalendarYearsList as RangeCalendarYearsList };
