import {
  useUtils,
  useField,
  splitFieldInternalAndForwardedProps,
} from '@mui/x-date-pickers/internals';
import {
  UseSingleInputTimeRangeFieldComponentProps,
  UseSingleInputTimeRangeFieldDefaultizedProps,
  UseSingleInputTimeRangeFieldProps,
} from './SingleInputTimeRangeField.types';
import { rangeValueManager, rangeFieldValueManager } from '../internals/utils/valueManagers';
import { validateTimeRange } from '../internals/utils/validation/validateTimeRange';

export const useDefaultizedTimeRangeFieldProps = <
  TDate,
  TUseV6TextField extends boolean,
  AdditionalProps extends {},
>(
  props: UseSingleInputTimeRangeFieldProps<TDate, TUseV6TextField>,
): UseSingleInputTimeRangeFieldDefaultizedProps<TDate, TUseV6TextField, AdditionalProps> => {
  const utils = useUtils<TDate>();

  const ampm = props.ampm ?? utils.is12HourCycleInCurrentLocale();
  const defaultFormat = ampm ? utils.formats.fullTime12h : utils.formats.fullTime24h;

  return {
    ...props,
    disablePast: props.disablePast ?? false,
    disableFuture: props.disableFuture ?? false,
    format: props.format ?? defaultFormat,
  } as any;
};

export const useSingleInputTimeRangeField = <
  TDate,
  TUseV6TextField extends boolean,
  TChildProps extends {},
>(
  inProps: UseSingleInputTimeRangeFieldComponentProps<TDate, TUseV6TextField, TChildProps>,
) => {
  const props = useDefaultizedTimeRangeFieldProps<TDate, TUseV6TextField, TChildProps>(inProps);

  const { forwardedProps, internalProps } = splitFieldInternalAndForwardedProps<
    typeof props,
    keyof UseSingleInputTimeRangeFieldProps<any, any>
  >(props, 'time');

  return useField({
    forwardedProps,
    internalProps,
    valueManager: rangeValueManager,
    fieldValueManager: rangeFieldValueManager,
    validator: validateTimeRange,
    valueType: 'time',
  });
};
