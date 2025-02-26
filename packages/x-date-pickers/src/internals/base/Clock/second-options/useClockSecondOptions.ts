import * as React from 'react';
import { useUtils } from '../../../hooks/useUtils';
import { GenericHTMLProps } from '../../base-utils/types';
import { mergeReactProps } from '../../base-utils/mergeReactProps';
import { PickerValidDate } from '../../../../models';
import { useClockRootContext } from '../root/ClockRootContext';
import { ClockOptionListContext } from '../utils/ClockOptionListContext';
import { useClockOptionList } from '../utils/useClockOptionList';
import { endOfMinute, startOfMinute } from '../../utils/future-adapter-methods';
import { getOptionListDefaultItems } from '../utils/time';

export function useClockSecondOptions(parameters: useClockSecondOptions.Parameters) {
  const { children, getItems, step = 1 } = parameters;
  const utils = useUtils();
  const rootContext = useClockRootContext();

  const getDefaultItems = React.useCallback(() => {
    return getOptionListDefaultItems({
      utils,
      start: startOfMinute(utils, rootContext.referenceDate),
      end: endOfMinute(utils, rootContext.referenceDate),
      getNextItem: (date) => utils.addSeconds(date, step),
    });
  }, [utils, rootContext.referenceDate, step]);

  const { resolvedChildren } = useClockOptionList({
    getDefaultItems,
    getItems,
    children,
  });

  const isOptionSelected = React.useCallback(
    (option: PickerValidDate) => {
      return (
        rootContext.value != null &&
        utils.isSameHour(option, rootContext.value) &&
        utils.getMinutes(option) === utils.getMinutes(rootContext.value) &&
        utils.getSeconds(option) === utils.getSeconds(rootContext.value)
      );
    },
    [rootContext.value, utils],
  );

  const context: ClockOptionListContext = React.useMemo(
    () => ({
      canOptionBeTabbed: () => true,
      isOptionSelected,
      section: 'second',
      defaultFormat: utils.formats.seconds,
    }),
    [utils, isOptionSelected],
  );

  const getOptionsProps = React.useCallback(
    (externalProps: GenericHTMLProps) => {
      return mergeReactProps(externalProps, { role: 'listbox', children: resolvedChildren });
    },
    [resolvedChildren],
  );

  return React.useMemo(() => ({ getOptionsProps, context }), [getOptionsProps, context]);
}

export namespace useClockSecondOptions {
  export interface Parameters extends useClockOptionList.PublicParameters {
    /**
     * The step in seconds between two consecutive items.
     * @default 1
     */
    step?: number;
  }

  export interface ChildrenParameters {
    items: PickerValidDate[];
  }

  export interface GetItemsParameters {
    /**
     * The minimum valid time of the clock.
     */
    minTime: PickerValidDate | undefined;
    /**
     * The maximum valid time of the clock.
     */
    maxTime: PickerValidDate | undefined;
    /**
     * A function that returns the items that would be rendered if getItems is not provided.
     * @returns {PickerValidDate[]} The list of the items to render.
     */
    getDefaultItems: () => PickerValidDate[];
  }
}
