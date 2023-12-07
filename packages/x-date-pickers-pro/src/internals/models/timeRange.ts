import {
  BaseTimeValidationProps,
  TimeValidationProps,
  DefaultizedProps,
  MakeOptional,
  UseFieldInternalProps,
} from '@mui/x-date-pickers/internals';
import { DateRange } from './range';
import { TimeRangeValidationError } from '../../models';
import { BaseRangeProps } from './dateRange';
import { RangeFieldSection } from './fields';

export interface UseTimeRangeFieldProps<TDate, TUseV6TextField extends boolean>
  extends MakeOptional<
      UseFieldInternalProps<
        DateRange<TDate>,
        TDate,
        RangeFieldSection,
        TUseV6TextField,
        TimeRangeValidationError
      >,
      'format'
    >,
    TimeValidationProps<TDate>,
    BaseTimeValidationProps,
    BaseRangeProps {
  /**
   * 12h/24h view for hour selection clock.
   * @default `utils.is12HourCycleInCurrentLocale()`
   */
  ampm?: boolean;
}

export type UseTimeRangeFieldDefaultizedProps<
  TDate,
  TUseV6TextField extends boolean,
> = DefaultizedProps<
  UseTimeRangeFieldProps<TDate, TUseV6TextField>,
  keyof BaseTimeValidationProps | 'format'
>;
