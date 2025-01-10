import * as React from 'react';
import { PickerValidDate } from '../../../../../models';
import { GenericHTMLProps } from '../../../base-utils/types';
import { mergeReactProps } from '../../../base-utils/mergeReactProps';

export function useBaseCalendarSetVisibleMonth(
  parameters: useBaseCalendarSetVisibleMonth.Parameters,
) {
  const { ctx } = parameters;

  const getSetVisibleMonthProps = React.useCallback(
    (externalProps: GenericHTMLProps) => {
      return mergeReactProps(externalProps, {
        type: 'button' as const,
        disabled: ctx.isDisabled,
        onClick: ctx.setTarget,
      });
    },
    [ctx.isDisabled, ctx.setTarget],
  );

  return React.useMemo(() => ({ getSetVisibleMonthProps }), [getSetVisibleMonthProps]);
}

export namespace useBaseCalendarSetVisibleMonth {
  export interface Parameters {
    /**
     * The month to navigate to.
     */
    target: 'previous' | 'next' | PickerValidDate;
    /**
     * The memoized context forwarded by the wrapper component so that this component does not need to subscribe to any context.
     */
    ctx: Context;
  }

  export interface Context {
    setTarget: () => void;
    isDisabled: boolean;
  }
}
