import { validateTime, Validator } from '@mui/x-date-pickers/validation';
import { TimeValidationProps, BaseTimeValidationProps } from '@mui/x-date-pickers/internals';
import { isRangeValid } from '../internals/utils/date-utils';
import { TimeRangeValidationError } from '../models';
import { rangeValueManager } from '../internals/utils/valueManagers';

/**
 * Validation props used by the Time Range Picker and Time Range Field.
 */
export interface ExportedValidateTimeRangeProps
  extends BaseTimeValidationProps,
    TimeValidationProps {}

export interface ValidateTimeRangeProps
  extends Required<BaseTimeValidationProps>,
    TimeValidationProps {}

export const validateTimeRange: Validator<
  true,
  TimeRangeValidationError,
  ValidateTimeRangeProps
> = ({ adapter, value, timezone, props }) => {
  const [start, end] = value;

  const dateTimeValidations: TimeRangeValidationError = [
    validateTime({
      adapter,
      value: start,
      timezone,
      props,
    }),
    validateTime({
      adapter,
      value: end,
      timezone,
      props,
    }),
  ];

  if (dateTimeValidations[0] || dateTimeValidations[1]) {
    return dateTimeValidations;
  }

  // for partial input
  if (start === null || end === null) {
    return [null, null];
  }

  if (!isRangeValid(adapter.utils, value)) {
    return ['invalidRange', 'invalidRange'];
  }

  return [null, null];
};

validateTimeRange.valueManager = rangeValueManager;
