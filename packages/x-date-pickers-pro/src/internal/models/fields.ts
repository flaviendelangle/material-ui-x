import * as React from 'react';
import { SlotComponentProps } from '@mui/base/utils';
import { TextFieldProps } from '@mui/material/TextField';
import Stack, { StackProps } from '@mui/material/Stack';
import Typography, { TypographyProps } from '@mui/material/Typography';
import {
  BaseFieldProps,
  FieldSection,
  UncapitalizeObjectKeys,
} from '@mui/x-date-pickers/internals';

export interface RangeFieldSection extends FieldSection {
  dateName: 'start' | 'end';
}

export interface RangeFieldSectionWithoutPosition
  extends Omit<RangeFieldSection, 'start' | 'end' | 'startInInput' | 'endInInput'> {}

type BaseMultiInputFieldSlotsComponent = {
  Root?: React.ElementType<StackProps>;
  TextField?: React.ElementType<TextFieldProps>;
  Separator?: React.ElementType<TypographyProps>;
};

export interface MultiInputFieldSlotTextFieldProps {
  inputRef?: React.Ref<HTMLInputElement>;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  label?: React.ReactNode;
  onKeyDown?: React.KeyboardEventHandler;
  onFocus?: React.FocusEventHandler;
  focused?: boolean;
}

type BaseMultiInputFieldSlotsComponentsProps = {
  root?: SlotComponentProps<typeof Stack, {}, Record<string, any>>;
  textField?: SlotComponentProps<
    React.ElementType<MultiInputFieldSlotTextFieldProps>,
    {},
    { position?: 'start' | 'end' } & Record<string, any>
  >;
  separator?: SlotComponentProps<typeof Typography, {}, Record<string, any>>;
};

/**
 * Props the multi input field can receive when used inside a picker.
 * Do not take into account props that would be passed directly through `props.slotProps.field`.
 */
export interface BaseMultiInputFieldProps<TValue, TError> extends BaseFieldProps<TValue, TError> {
  slots?: UncapitalizeObjectKeys<BaseMultiInputFieldSlotsComponent>;
  slotProps?: BaseMultiInputFieldSlotsComponentsProps;
}
