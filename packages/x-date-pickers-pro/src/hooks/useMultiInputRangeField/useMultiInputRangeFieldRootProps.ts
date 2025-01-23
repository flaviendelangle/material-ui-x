import * as React from 'react';
import useForkRef from '@mui/utils/useForkRef';
import useEventCallback from '@mui/utils/useEventCallback';
import {
  executeInTheNextEventLoopTick,
  getActiveElement,
  useNullablePickerContext,
  usePickerPrivateContext,
} from '@mui/x-date-pickers/internals';

/**
 * @ignore - internal hook.
 */
export function useMultiInputRangeFieldRootProps<TForwardedProps extends { [key: string]: any }>(
  forwardedProps: TForwardedProps,
): UseMultiInputRangeFieldRootPropsReturnValue<TForwardedProps> {
  const pickerContext = useNullablePickerContext();
  const privatePickerContext = usePickerPrivateContext();
  const ref = React.useRef<HTMLElement>(null);
  const handleRef = useForkRef(forwardedProps.ref, ref);

  const handleBlur = useEventCallback(() => {
    if (!pickerContext || pickerContext.variant === 'mobile') {
      return;
    }

    executeInTheNextEventLoopTick(() => {
      if (
        ref.current?.contains(getActiveElement(document)) ||
        pickerContext.popupRef.current?.contains(getActiveElement(document))
      ) {
        return;
      }

      privatePickerContext.dismissViews();
    });
  });

  return { ...forwardedProps, onBlur: handleBlur, ref: handleRef };
}

export type UseMultiInputRangeFieldRootPropsReturnValue<
  TForwardedProps extends { [key: string]: any },
> = Omit<TForwardedProps, 'onBlur' | 'ref'> & {
  onBlur: () => void;
  ref: React.Ref<HTMLDivElement>;
};
