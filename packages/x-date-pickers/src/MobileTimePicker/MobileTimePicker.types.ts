import {
  UseMobilePickerSlotsComponent,
  ExportedUseMobilePickerSlotsComponentsProps,
  MobileOnlyPickerProps,
} from '../internals/hooks/useMobilePicker';
import {
  BaseTimePickerProps,
  BaseTimePickerSlotsComponent,
  BaseTimePickerSlotsComponentsProps,
} from '../TimePicker/shared';
import { MakeOptional } from '../internals/models/helpers';
import { TimeView } from '../models';
import { TimeViewWithMeridiem } from '../internals/models';

export interface MobileTimePickerSlotsComponent<
  TDate,
  TView extends TimeViewWithMeridiem,
  TUseV6TextField extends boolean,
> extends BaseTimePickerSlotsComponent<TDate>,
    MakeOptional<UseMobilePickerSlotsComponent<TDate, TView, TUseV6TextField>, 'field'> {}

export interface MobileTimePickerSlotsComponentsProps<
  TDate,
  TView extends TimeViewWithMeridiem,
  TUseV6TextField extends boolean,
> extends BaseTimePickerSlotsComponentsProps,
    ExportedUseMobilePickerSlotsComponentsProps<TDate, TView, TUseV6TextField> {}

export interface MobileTimePickerProps<
  TDate,
  TView extends TimeViewWithMeridiem = TimeView,
  TUseV6TextField extends boolean = false,
> extends BaseTimePickerProps<TDate, TView>,
    MobileOnlyPickerProps {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: MobileTimePickerSlotsComponent<TDate, TView, TUseV6TextField>;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: MobileTimePickerSlotsComponentsProps<TDate, TView, TUseV6TextField>;
}
