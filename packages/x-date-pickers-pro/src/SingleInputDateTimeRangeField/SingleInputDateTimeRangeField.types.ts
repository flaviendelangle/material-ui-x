import {
  ExportedPickerFieldUIProps,
  ExportedPickerFieldUISlots,
  PickerFieldUISlotProps,
  PickerRangeValue,
  UseFieldInternalProps,
} from '@mui/x-date-pickers/internals';
import { BuiltInFieldTextFieldProps } from '@mui/x-date-pickers/models';
import { UseDateTimeRangeFieldProps } from '../internals/models';
import { DateTimeRangeValidationError } from '../models';

export interface UseSingleInputDateTimeRangeFieldProps<
  TEnableAccessibleFieldDOMStructure extends boolean,
> extends UseDateTimeRangeFieldProps<TEnableAccessibleFieldDOMStructure>,
    Pick<
      UseFieldInternalProps<
        PickerRangeValue,
        TEnableAccessibleFieldDOMStructure,
        DateTimeRangeValidationError
      >,
      'unstableFieldRef'
    >,
    ExportedPickerFieldUIProps {}

export type SingleInputDateTimeRangeFieldProps<
  TEnableAccessibleFieldDOMStructure extends boolean = true,
> = Omit<
  BuiltInFieldTextFieldProps<TEnableAccessibleFieldDOMStructure>,
  keyof UseSingleInputDateTimeRangeFieldProps<TEnableAccessibleFieldDOMStructure>
> &
  UseSingleInputDateTimeRangeFieldProps<TEnableAccessibleFieldDOMStructure> & {
    /**
     * Overridable component slots.
     * @default {}
     */
    slots?: SingleInputDateTimeRangeFieldSlots;
    /**
     * The props used for each component slot.
     * @default {}
     */
    slotProps?: SingleInputDateTimeRangeFieldSlotProps;
  };

export interface SingleInputDateTimeRangeFieldSlots extends ExportedPickerFieldUISlots {}

export interface SingleInputDateTimeRangeFieldSlotProps extends PickerFieldUISlotProps {}
