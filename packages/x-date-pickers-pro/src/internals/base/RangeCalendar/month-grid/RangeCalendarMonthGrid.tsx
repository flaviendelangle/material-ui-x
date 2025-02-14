'use client';
import * as React from 'react';
import useForkRef from '@mui/utils/useForkRef';
// eslint-disable-next-line no-restricted-imports
import { BaseUIComponentProps } from '@mui/x-date-pickers/internals/base/base-utils/types';
// eslint-disable-next-line no-restricted-imports
import { useComponentRenderer } from '@mui/x-date-pickers/internals/base/base-utils/useComponentRenderer';
// eslint-disable-next-line no-restricted-imports
import { useBaseCalendarMonthGrid } from '@mui/x-date-pickers/internals/base/utils/base-calendar/month-grid/useBaseCalendarMonthGrid';
// eslint-disable-next-line no-restricted-imports
import { BaseCalendarMonthCollectionContext } from '@mui/x-date-pickers/internals/base/utils/base-calendar/utils/BaseCalendarMonthCollectionContext';
// eslint-disable-next-line no-restricted-imports
import { CompositeList } from '@mui/x-date-pickers/internals/base/composite/list/CompositeList';
import { RangeCalendarMonthGridCssVars } from './RangeCalendarMonthGridCssVars';

const RangeCalendarMonthGrid = React.forwardRef(function RangeCalendarMonthList(
  props: RangeCalendarMonthGrid.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    className,
    render,
    children,
    getItems,
    focusOnMount,
    cellsPerRow,
    canChangeYear,
    ...otherProps
  } = props;
  const { getMonthGridProps, cellRefs, monthsListOrGridContext, scrollerRef } =
    useBaseCalendarMonthGrid({
      children,
      getItems,
      focusOnMount,
      cellsPerRow,
      canChangeYear,
      cellsPerRowCssVar: RangeCalendarMonthGridCssVars.calendarMonthGridCellsPerRow,
    });
  const state = React.useMemo(() => ({}), []);
  const ref = useForkRef(forwardedRef, scrollerRef);

  const { renderElement } = useComponentRenderer({
    propGetter: getMonthGridProps,
    render: render ?? 'div',
    ref,
    className,
    state,
    extraProps: otherProps,
  });

  return (
    <BaseCalendarMonthCollectionContext.Provider value={monthsListOrGridContext}>
      <CompositeList elementsRef={cellRefs}>{renderElement()}</CompositeList>
    </BaseCalendarMonthCollectionContext.Provider>
  );
});

export namespace RangeCalendarMonthGrid {
  export interface State {}

  export interface Props
    extends Omit<BaseUIComponentProps<'div', State>, 'children'>,
      useBaseCalendarMonthGrid.PublicParameters {}
}

export { RangeCalendarMonthGrid };
