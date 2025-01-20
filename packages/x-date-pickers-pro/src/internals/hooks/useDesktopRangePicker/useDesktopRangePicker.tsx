import * as React from 'react';
import useSlotProps from '@mui/utils/useSlotProps';
import { useLicenseVerifier } from '@mui/x-license';
import { PickersLayout } from '@mui/x-date-pickers/PickersLayout';
import {
  usePicker,
  PickersPopper,
  DateOrTimeViewWithMeridiem,
  PickerProvider,
  PickerRangeValue,
  PickerFieldUIContextProvider,
} from '@mui/x-date-pickers/internals';
import {
  UseDesktopRangePickerParams,
  UseDesktopRangePickerProps,
} from './useDesktopRangePicker.types';
import { RangePickerPropsForFieldSlot } from '../useEnrichedRangePickerField';
import { getReleaseInfo } from '../../utils/releaseInfo';
import { useRangePosition } from '../useRangePosition';
import { PickerRangePositionContext } from '../../../hooks/usePickerRangePositionContext';

const releaseInfo = getReleaseInfo();

export const useDesktopRangePicker = <
  TView extends DateOrTimeViewWithMeridiem,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TExternalProps extends UseDesktopRangePickerProps<
    TView,
    TEnableAccessibleFieldDOMStructure,
    any,
    TExternalProps
  >,
>({
  props,
  ...pickerParams
}: UseDesktopRangePickerParams<TView, TEnableAccessibleFieldDOMStructure, TExternalProps>) => {
  useLicenseVerifier('x-date-pickers-pro', releaseInfo);

  const { slots, slotProps, className, sx, inputRef, name, label, localeText, reduceAnimations } =
    props;

  const fieldType = (slots.field as any).fieldType ?? 'multi-input';
  const rangePositionResponse = useRangePosition(props);

  const { providerProps, renderCurrentView, shouldRestoreFocus, ownerState } = usePicker<
    PickerRangeValue,
    TView,
    TExternalProps
  >({
    ...pickerParams,
    props,
    variant: 'desktop',
    autoFocusView: fieldType === 'single-input',
    localeText,
  });

  // Temporary hack to hide the opening button on the range pickers until we have migrate them to the new opening logic.
  if (fieldType === 'multi-input') {
    providerProps.contextValue.triggerStatus = 'hidden';
  }

  const Field = slots.field;

  const fieldProps: RangePickerPropsForFieldSlot<boolean> = useSlotProps({
    elementType: Field,
    externalSlotProps: slotProps?.field,
    additionalProps: {
      // Forwarded props
      className,
      sx,
      ...(fieldType === 'single-input' && {
        ...(!!inputRef && { inputRef }),
        name,
        label,
        focused: providerProps.contextValue.open ? true : undefined,
      }),
    },
    ownerState,
  });

  const Layout = slots?.layout ?? PickersLayout;

  const renderPicker = () => (
    <PickerProvider {...providerProps}>
      <PickerFieldUIContextProvider slots={slots} slotProps={slotProps}>
        <PickerRangePositionContext.Provider value={rangePositionResponse}>
          <Field {...fieldProps} />
          <PickersPopper
            role="tooltip"
            placement="bottom-start"
            anchorEl={providerProps.contextValue.triggerRef.current}
            // onBlur={handleBlur}
            slots={slots}
            slotProps={slotProps}
            shouldRestoreFocus={shouldRestoreFocus}
            reduceAnimations={reduceAnimations}
          >
            <Layout {...slotProps?.layout} slots={slots} slotProps={slotProps}>
              {renderCurrentView()}
            </Layout>
          </PickersPopper>
        </PickerRangePositionContext.Provider>
      </PickerFieldUIContextProvider>
    </PickerProvider>
  );

  return {
    renderPicker,
  };
};
