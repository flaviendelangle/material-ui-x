import { MakeOptional } from '@mui/x-internals/types';
import { TimeViewWithMeridiem } from '@mui/x-date-pickers/internals';
import {
  UseMobileRangePickerSlots,
  UseMobileRangePickerSlotProps,
  MobileRangeOnlyPickerProps,
} from '../internals/hooks/useMobileRangePicker';
import {
  BaseTimeRangePickerProps,
  BaseTimeRangePickerSlots,
  BaseTimeRangePickerSlotProps,
} from '../TimeRangePicker/shared';

export interface MobileTimeRangePickerSlots
  extends BaseTimeRangePickerSlots,
    MakeOptional<UseMobileRangePickerSlots<TimeViewWithMeridiem>, 'field'> {}

export interface MobileTimeRangePickerSlotProps<TEnableAccessibleFieldDOMStructure extends boolean>
  extends BaseTimeRangePickerSlotProps,
    Omit<
      UseMobileRangePickerSlotProps<TimeViewWithMeridiem, TEnableAccessibleFieldDOMStructure>,
      'tabs' | 'toolbar'
    > {}

export interface MobileTimeRangePickerProps<TEnableAccessibleFieldDOMStructure extends boolean>
  extends BaseTimeRangePickerProps,
    MobileRangeOnlyPickerProps {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: MobileTimeRangePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: MobileTimeRangePickerSlotProps<TEnableAccessibleFieldDOMStructure>;
}
