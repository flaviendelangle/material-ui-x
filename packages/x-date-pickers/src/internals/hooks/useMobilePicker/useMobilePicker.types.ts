import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { SlotComponentProps } from '@mui/base/utils';
import {
  BaseNonStaticPickerProps,
  BasePickerProps,
  BaseNonRangeNonStaticPickerProps,
} from '../../models/props/basePickerProps';
import {
  PickersModalDialogSlots,
  PickersModalDialogSlotProps,
} from '../../components/PickersModalDialog';
import { UsePickerParams, UsePickerProps } from '../usePicker';
import { BaseSingleInputFieldProps, FieldSection, MuiPickersAdapter } from '../../../models';
import {
  ExportedPickersLayoutSlots,
  ExportedPickersLayoutSlotProps,
  PickersLayoutSlotProps,
} from '../../../PickersLayout/PickersLayout.types';
import { UsePickerValueNonStaticProps } from '../usePicker/usePickerValue.types';
import { UsePickerViewsNonStaticProps, UsePickerViewsProps } from '../usePicker/usePickerViews';
import { DateOrTimeViewWithMeridiem } from '../../models';
import { SlotComponentPropsFromProps } from '../../models/helpers';

export interface UseMobilePickerSlots<TDate, TView extends DateOrTimeViewWithMeridiem>
  extends PickersModalDialogSlots,
    ExportedPickersLayoutSlots<TDate | null, TDate, TView> {
  /**
   * Component used to enter the date with the keyboard.
   */
  field: React.ElementType;
  /**
   * Form control with an input to render the value inside the default field.
   * @default PickersTextField, or TextField from '@mui/material' if shouldUseV6TextField is enabled.
   */
  textField?: React.ElementType;
}

export interface ExportedUseMobilePickerSlotProps<
  TDate,
  TView extends DateOrTimeViewWithMeridiem,
  TUseV6TextField extends boolean,
> extends PickersModalDialogSlotProps,
    ExportedPickersLayoutSlotProps<TDate | null, TDate, TView> {
  field?: SlotComponentPropsFromProps<
    BaseSingleInputFieldProps<TDate | null, TDate, FieldSection, TUseV6TextField, unknown>,
    {},
    UsePickerProps<TDate | null, TDate, any, any, any, any>
  >;
  textField?: SlotComponentProps<typeof TextField, {}, Record<string, any>>;
}

export interface UseMobilePickerSlotProps<
  TDate,
  TView extends DateOrTimeViewWithMeridiem,
  TUseV6TextField extends boolean,
> extends ExportedUseMobilePickerSlotProps<TDate, TView, TUseV6TextField>,
    Pick<PickersLayoutSlotProps<TDate | null, TDate, TView>, 'toolbar'> {}

export interface MobileOnlyPickerProps
  extends BaseNonStaticPickerProps,
    BaseNonRangeNonStaticPickerProps,
    UsePickerValueNonStaticProps,
    UsePickerViewsNonStaticProps {}

export interface UseMobilePickerProps<
  TDate,
  TView extends DateOrTimeViewWithMeridiem,
  TUseV6TextField extends boolean,
  TError,
  TExternalProps extends UsePickerViewsProps<any, any, TView, any, any>,
> extends BasePickerProps<TDate | null, TDate, TView, TError, TExternalProps, {}>,
    MobileOnlyPickerProps {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: UseMobilePickerSlots<TDate, TView>;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: UseMobilePickerSlotProps<TDate, TView, TUseV6TextField>;
}

export interface UseMobilePickerParams<
  TDate,
  TView extends DateOrTimeViewWithMeridiem,
  TUseV6TextField extends boolean,
  TExternalProps extends UseMobilePickerProps<TDate, TView, TUseV6TextField, any, TExternalProps>,
> extends Pick<
    UsePickerParams<TDate | null, TDate, TView, FieldSection, TExternalProps, {}>,
    'valueManager' | 'valueType' | 'validator'
  > {
  props: TExternalProps;
  getOpenDialogAriaText: (date: TDate | null, utils: MuiPickersAdapter<TDate>) => string;
}
