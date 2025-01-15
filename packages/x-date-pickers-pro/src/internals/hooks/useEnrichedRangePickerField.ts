import * as React from 'react';
import Stack, { StackProps } from '@mui/material/Stack';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { SlotComponentProps } from '@mui/utils';
import resolveComponentProps from '@mui/utils/resolveComponentProps';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import { SlotComponentPropsFromProps } from '@mui/x-internals/types';
import {
  FieldSelectedSections,
  PickerOwnerState,
  FieldOwnerState,
} from '@mui/x-date-pickers/models';
import { UseClearableFieldSlots, UseClearableFieldSlotProps } from '@mui/x-date-pickers/hooks';
import {
  onSpaceOrEnter,
  PickerVariant,
  DateOrTimeViewWithMeridiem,
  BaseSingleInputFieldProps,
  PickerRangeValue,
  PickerContextValue,
  PickerFieldPrivateContextValue,
} from '@mui/x-date-pickers/internals';
import { PickersTextField } from '@mui/x-date-pickers/PickersTextField';
import {
  MultiInputFieldSlotRootProps,
  RangePosition,
  FieldType,
  PickerRangeFieldSlotProps,
} from '../../models';
import { UseRangePositionResponse } from './useRangePosition';
import { BaseMultiInputFieldProps } from '../models/fields';

export interface RangePickerFieldSlots extends UseClearableFieldSlots {
  field: React.ElementType;
  /**
   * Element rendered at the root.
   * Ignored if the field has only one input.
   */
  fieldRoot?: React.ElementType<StackProps>;
  /**
   * Element rendered between the two inputs.
   * Ignored if the field has only one input.
   */
  fieldSeparator?: React.ElementType<TypographyProps>;
  /**
   * Form control with an input to render a date or time inside the default field.
   * It is rendered twice: once for the start element and once for the end element.
   * @default TextField from '@mui/material' or PickersTextField if `enableAccessibleFieldDOMStructure` is `true`.
   */
  textField?: React.ElementType;
}

export interface RangePickerFieldSlotProps<TEnableAccessibleFieldDOMStructure extends boolean>
  extends UseClearableFieldSlotProps {
  field?: SlotComponentPropsFromProps<
    PickerRangeFieldSlotProps<TEnableAccessibleFieldDOMStructure>,
    {},
    PickerOwnerState
  >;
  fieldRoot?: SlotComponentProps<typeof Stack, {}, FieldOwnerState>;
  fieldSeparator?: SlotComponentProps<typeof Typography, {}, FieldOwnerState>;
  textField?: SlotComponentProps<
    typeof PickersTextField,
    {},
    FieldOwnerState & { position?: RangePosition }
  >;
}

export type RangePickerPropsForFieldSlot<
  TIsSingleInput extends boolean,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TError,
> =
  | (TIsSingleInput extends true
      ? BaseSingleInputFieldProps<PickerRangeValue, TEnableAccessibleFieldDOMStructure, TError>
      : never)
  | (TIsSingleInput extends false
      ? BaseMultiInputFieldProps<TEnableAccessibleFieldDOMStructure, TError>
      : never);

export interface UseEnrichedRangePickerFieldPropsParams<
  TIsSingleInput extends boolean,
  TView extends DateOrTimeViewWithMeridiem,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TError,
> extends UseRangePositionResponse {
  contextValue: PickerContextValue<PickerRangeValue, TView, TError>;
  fieldPrivateContextValue: PickerFieldPrivateContextValue;
  variant: PickerVariant;
  fieldType: FieldType;
  readOnly?: boolean;
  labelId?: string;
  disableOpenPicker?: boolean;
  onBlur?: () => void;
  label?: React.ReactNode;
  pickerSlotProps: RangePickerFieldSlotProps<TEnableAccessibleFieldDOMStructure> | undefined;
  pickerSlots: RangePickerFieldSlots | undefined;
  fieldProps: RangePickerPropsForFieldSlot<
    TIsSingleInput,
    TEnableAccessibleFieldDOMStructure,
    TError
  >;
  currentView?: TView | null;
}

const useMultiInputFieldSlotProps = <
  TView extends DateOrTimeViewWithMeridiem,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TError,
>({
  labelId,
  onBlur,
  pickerSlotProps,
  pickerSlots,
  fieldProps,
}: UseEnrichedRangePickerFieldPropsParams<
  false,
  TView,
  TEnableAccessibleFieldDOMStructure,
  TError
>) => {
  type ReturnType = BaseMultiInputFieldProps<TEnableAccessibleFieldDOMStructure, TError>;

  const slots: ReturnType['slots'] = {
    textField: pickerSlots?.textField,
    root: pickerSlots?.fieldRoot,
    separator: pickerSlots?.fieldSeparator,
    ...fieldProps.slots,
  };

  const slotProps: ReturnType['slotProps'] & {
    separator?: any;
  } = {
    ...fieldProps.slotProps,
    textField: (ownerState) => {
      return {
        ...(labelId != null && { id: `${labelId}-${ownerState.position!}` }),
        ...resolveComponentProps(pickerSlotProps?.textField, ownerState),
      };
    },
    root: (ownerState) => {
      const rootProps: MultiInputFieldSlotRootProps = {
        onBlur,
      };

      return {
        ...rootProps,
        ...resolveComponentProps(pickerSlotProps?.fieldRoot, ownerState),
      };
    },
    separator: pickerSlotProps?.fieldSeparator,
  };

  /* TODO: remove this when a clearable behavior for multiple input range fields is implemented */
  const { clearable, onClear, ...restFieldProps } = fieldProps as any;

  const enrichedFieldProps: ReturnType = {
    ...restFieldProps,
    slots,
    slotProps,
  };

  return {
    fieldProps: enrichedFieldProps,
    fieldPrivateContextValue: {},
  };
};

const useSingleInputFieldSlotProps = <
  TView extends DateOrTimeViewWithMeridiem,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TError,
>({
  contextValue,
  fieldPrivateContextValue,
  variant,
  readOnly,
  labelId,
  disableOpenPicker,
  label,
  onBlur,
  rangePosition,
  setRangePosition,
  fieldProps,
  currentView,
}: UseEnrichedRangePickerFieldPropsParams<
  true,
  TView,
  TEnableAccessibleFieldDOMStructure,
  TError
>) => {
  type ReturnType = BaseSingleInputFieldProps<
    PickerRangeValue,
    TEnableAccessibleFieldDOMStructure,
    TError
  >;

  const handleFieldRef = useForkRef(fieldProps.unstableFieldRef, singleInputFieldRef);

  React.useEffect(() => {
    if (!contextValue.open || !singleInputFieldRef.current || variant === 'mobile') {
      return;
    }

    if (singleInputFieldRef.current.isFieldFocused()) {
      return;
    }

    // bring back focus to the field with the current view section selected
    if (currentView) {
      const sections = singleInputFieldRef.current.getSections().map((section) => section.type);
      const newSelectedSection =
        rangePosition === 'start'
          ? sections.indexOf(currentView)
          : sections.lastIndexOf(currentView);
      singleInputFieldRef.current?.focusField(newSelectedSection);
    }
  }, [rangePosition, contextValue.open, currentView, singleInputFieldRef, variant]);

  const updateRangePosition = () => {
    if (!singleInputFieldRef.current?.isFieldFocused()) {
      return;
    }

    const sections = singleInputFieldRef.current.getSections();
    const activeSectionIndex = singleInputFieldRef.current?.getActiveSectionIndex();
    const domRangePosition =
      activeSectionIndex == null || activeSectionIndex < sections.length / 2 ? 'start' : 'end';

    if (domRangePosition != null && domRangePosition !== rangePosition) {
      setRangePosition(domRangePosition);
    }
  };

  const handleSelectedSectionsChange = useEventCallback(
    (selectedSection: FieldSelectedSections) => {
      setTimeout(updateRangePosition);
      fieldPrivateContextValue.onSelectedSectionsChange?.(selectedSection);
    },
  );

  const openPicker = (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    event.stopPropagation();

    if (!readOnly && !disableOpenPicker) {
      event.preventDefault();
      contextValue.setOpen(true);
    }
  };

  const enrichedFieldProps: ReturnType = {
    ...fieldProps,
    label,
    unstableFieldRef: handleFieldRef,
    onKeyDown: onSpaceOrEnter(openPicker, fieldProps.onKeyDown),
    onBlur,
    focused: contextValue.open ? true : undefined,
    ...(labelId != null && { id: labelId }),
    ...(variant === 'mobile' && { readOnly: true }),
    // registering `onClick` listener on the root element as well to correctly handle cases where user is clicking on `label`
    // which has `pointer-events: none` and due to DOM structure the `input` does not catch the click event
    ...(!readOnly && !contextValue.disabled && { onClick: openPicker }),
  };

  return {
    fieldProps: enrichedFieldProps,
    fieldPrivateContextValue: {
      onSelectedSectionsChange: handleSelectedSectionsChange,
    },
  };
};

export const useEnrichedRangePickerField = <
  TView extends DateOrTimeViewWithMeridiem,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TError,
>(
  params: UseEnrichedRangePickerFieldPropsParams<
    boolean,
    TView,
    TEnableAccessibleFieldDOMStructure,
    TError
  >,
) => {
  /* eslint-disable react-hooks/rules-of-hooks */
  if (process.env.NODE_ENV !== 'production') {
    const fieldTypeRef = React.useRef(params.fieldType);
    if (params.fieldType !== fieldTypeRef.current) {
      console.error(
        'Should not switch between a multi input field and a single input field on a range picker.',
      );
    }
  }

  if (params.fieldType === 'multi-input') {
    return useMultiInputFieldSlotProps(
      params as UseEnrichedRangePickerFieldPropsParams<
        false,
        TView,
        TEnableAccessibleFieldDOMStructure,
        TError
      >,
    );
  }

  return useSingleInputFieldSlotProps(
    params as UseEnrichedRangePickerFieldPropsParams<
      true,
      TView,
      TEnableAccessibleFieldDOMStructure,
      TError
    >,
  );
  /* eslint-enable react-hooks/rules-of-hooks */
};
