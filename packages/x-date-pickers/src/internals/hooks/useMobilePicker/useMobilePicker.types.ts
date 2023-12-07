import * as React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { SlotComponentProps } from '@mui/base/utils';
import {
  BaseNonStaticPickerProps,
  BasePickerProps,
  BaseNonRangeNonStaticPickerProps,
} from '../../models/props/basePickerProps';
import {
  PickersModalDialogSlotsComponent,
  PickersModalDialogSlotsComponentsProps,
} from '../../components/PickersModalDialog';
import { UsePickerParams, UsePickerProps } from '../usePicker';
import { BaseSingleInputFieldProps, FieldSection, MuiPickersAdapter } from '../../../models';
import {
  ExportedPickersLayoutSlotsComponent,
  ExportedPickersLayoutSlotsComponentsProps,
  PickersLayoutSlotsComponentsProps,
} from '../../../PickersLayout/PickersLayout.types';
import { UsePickerValueNonStaticProps } from '../usePicker/usePickerValue.types';
import { UsePickerViewsNonStaticProps, UsePickerViewsProps } from '../usePicker/usePickerViews';
import { DateOrTimeViewWithMeridiem } from '../../models';

export interface UseMobilePickerSlotsComponent<
  TDate,
  TView extends DateOrTimeViewWithMeridiem,
  TUseV6TextField extends boolean,
> extends PickersModalDialogSlotsComponent,
    ExportedPickersLayoutSlotsComponent<TDate | null, TDate, TView> {
  /**
   * Component used to enter the date with the keyboard.
   */
  field: React.ElementType<
    BaseSingleInputFieldProps<TDate | null, TDate, FieldSection, TUseV6TextField, any>
  >;
  /**
   * Form control with an input to render the value inside the default field.
   * Receives the same props as `@mui/material/TextField`.
   * @default TextField from '@mui/material'
   */
  textField?: React.ElementType<TextFieldProps>;
}

export interface ExportedUseMobilePickerSlotsComponentsProps<
  TDate,
  TView extends DateOrTimeViewWithMeridiem,
  TUseV6TextField extends boolean,
> extends PickersModalDialogSlotsComponentsProps,
    ExportedPickersLayoutSlotsComponentsProps<TDate | null, TDate, TView> {
  field?: SlotComponentProps<
    React.ElementType<
      BaseSingleInputFieldProps<TDate | null, TDate, FieldSection, TUseV6TextField, unknown>
    >,
    {},
    UsePickerProps<TDate | null, TDate, any, any, any, any>
  >;
  textField?: SlotComponentProps<typeof TextField, {}, Record<string, any>>;
}

export interface UseMobilePickerSlotsComponentsProps<
  TDate,
  TView extends DateOrTimeViewWithMeridiem,
  TUseV6TextField extends boolean,
> extends ExportedUseMobilePickerSlotsComponentsProps<TDate, TView, TUseV6TextField>,
    Pick<PickersLayoutSlotsComponentsProps<TDate | null, TDate, TView>, 'toolbar'> {}

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
  slots: UseMobilePickerSlotsComponent<TDate, TView, TUseV6TextField>;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: UseMobilePickerSlotsComponentsProps<TDate, TView, TUseV6TextField>;
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
