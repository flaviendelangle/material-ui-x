import * as React from 'react';
import useSlotProps from '@mui/utils/useSlotProps';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import { PickersTextField, PickersTextFieldProps } from '@mui/x-date-pickers/PickersTextField';
import { usePickerTranslations } from '@mui/x-date-pickers/hooks';
import {
  PickerValue,
  RangePosition,
  useNullablePickerContext,
} from '@mui/x-date-pickers/internals';
import { FieldOwnerState, FieldRef } from '@mui/x-date-pickers/models';
import { MultiInputRangeFieldSlotProps } from './createMultiInputRangeField.types';
import { usePickerRangePositionContext } from '../../../hooks';

export function useTextFieldProps(
  slotProps: MultiInputRangeFieldSlotProps | undefined,
  ownerState: FieldOwnerState,
  position: 'start' | 'end',
  fieldRefProp: React.Ref<FieldRef<PickerValue>> | undefined,
) {
  const pickerContext = useNullablePickerContext();
  const translations = usePickerTranslations();
  const { rangePosition, onRangePositionChange } = usePickerRangePositionContext();

  const fieldRef = React.useRef<FieldRef<PickerValue>>(null);
  const handleFieldRef = useForkRef(fieldRefProp, fieldRef);
  const previousRangePosition = React.useRef<RangePosition>(rangePosition);

  const openPickerIfPossible = (event: React.UIEvent) => {
    if (!pickerContext) {
      return;
    }

    event.stopPropagation();
    onRangePositionChange(position);
    if (pickerContext.triggerStatus === 'enabled') {
      event.preventDefault();
      pickerContext.setOpen(true);
    }
  };

  const handleKeyDown = useEventCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      openPickerIfPossible(event);
    }
  });

  // Registering `onClick` listener on the root element as well to correctly handle cases where user is clicking on `label`
  // which has `pointer-events: none` and due to DOM structure the `input` does not catch the click event
  const handleClick = useEventCallback((event: React.MouseEvent) => {
    openPickerIfPossible(event);
  });

  const handleFocus = useEventCallback(() => {
    if (pickerContext?.open) {
      onRangePositionChange(position);
      if (previousRangePosition.current !== position && pickerContext.initialView) {
        pickerContext.setView?.(pickerContext.initialView);
      }
    }
  });

  const textFieldProps: PickersTextFieldProps = useSlotProps({
    elementType: PickersTextField,
    externalSlotProps: slotProps?.textField,
    additionalProps: {
      onKeyDown: handleKeyDown,
      onClick: handleClick,
      onFocus: handleFocus,
      label: translations[position],
      focused: pickerContext?.open ? rangePosition === position : undefined,
      ...(pickerContext?.variant === 'mobile' && { readOnly: true }),
    },
    ownerState: { ...ownerState, position },
  });

  if (!textFieldProps.InputProps) {
    textFieldProps.InputProps = {};
  }

  if (pickerContext && position === 'start') {
    textFieldProps.InputProps.ref = pickerContext.triggerRef;
  }

  React.useEffect(() => {
    if (!pickerContext?.open || pickerContext?.variant === 'mobile') {
      return;
    }

    fieldRef.current?.focusField();
    if (!fieldRef.current || pickerContext.view === pickerContext.initialView) {
      // could happen when the user is switching between the inputs
      previousRangePosition.current = rangePosition;
      return;
    }

    // bring back focus to the field
    fieldRef.current.setSelectedSections(
      // use the current view or `0` when the range position has just been swapped
      previousRangePosition.current === rangePosition ? pickerContext.view : 0,
    );
    previousRangePosition.current = rangePosition;
  }, [
    rangePosition,
    pickerContext?.open,
    pickerContext?.variant,
    pickerContext?.initialView,
    pickerContext?.view,
  ]);

  return { textFieldProps, fieldRef: handleFieldRef };
}
