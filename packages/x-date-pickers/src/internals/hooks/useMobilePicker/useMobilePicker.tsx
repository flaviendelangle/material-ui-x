import * as React from 'react';
import { useSlotProps } from '@mui/base/utils';
import useId from '@mui/utils/useId';
import { PickersModalDialog } from '../../components/PickersModalDialog';
import { UseMobilePickerParams, UseMobilePickerProps } from './useMobilePicker.types';
import { usePicker } from '../usePicker';
import { onSpaceOrEnter } from '../../utils/utils';
import { useUtils } from '../useUtils';
import { LocalizationProvider } from '../../../LocalizationProvider';
import { PickersLayout } from '../../../PickersLayout';
import { InferError } from '../useValidation';
import { FieldSection, BaseSingleInputFieldProps } from '../../../models';
import { DateOrTimeViewWithMeridiem } from '../../models';

/**
 * Hook managing all the single-date mobile pickers:
 * - MobileDatePicker
 * - MobileDateTimePicker
 * - MobileTimePicker
 */
export const useMobilePicker = <
  TDate,
  TView extends DateOrTimeViewWithMeridiem,
  TExternalProps extends UseMobilePickerProps<TDate, TView, any, TExternalProps>,
>({
  props,
  getOpenDialogAriaText,
  ...pickerParams
}: UseMobilePickerParams<TDate, TView, TExternalProps>) => {
  const {
    slots,
    slotProps: innerSlotProps,
    className,
    sx,
    format,
    formatDensity,
    timezone,
    label,
    inputRef,
    readOnly,
    disabled,
    localeText,
  } = props;

  const utils = useUtils<TDate>();
  const labelId = useId();
  const isToolbarHidden = innerSlotProps?.toolbar?.hidden ?? false;

  const {
    open,
    actions,
    layoutProps,
    renderCurrentView,
    fieldProps: pickerFieldProps,
  } = usePicker<TDate | null, TDate, TView, FieldSection, TExternalProps, {}>({
    ...pickerParams,
    props,
    autoFocusView: true,
    additionalViewProps: {},
    wrapperVariant: 'mobile',
  });

  const Field = slots.field;
  const fieldProps: BaseSingleInputFieldProps<
    TDate | null,
    TDate,
    FieldSection,
    InferError<TExternalProps>
  > = useSlotProps({
    elementType: Field,
    externalSlotProps: innerSlotProps?.field,
    additionalProps: {
      ...pickerFieldProps,
      ...(isToolbarHidden && { id: labelId }),
      ...(!(disabled || readOnly) && {
        onClick: actions.onOpen,
        onKeyDown: onSpaceOrEnter(actions.onOpen),
      }),
      readOnly: readOnly ?? true,
      disabled,
      className,
      sx,
      format,
      formatDensity,
      timezone,
      label,
      inputRef,
    },
    ownerState: props,
  });

  // TODO: Move to `useSlotProps` when https://github.com/mui/material-ui/pull/35088 will be merged
  fieldProps.inputProps = {
    ...fieldProps.inputProps,
    'aria-label': getOpenDialogAriaText(pickerFieldProps.value, utils),
  };

  const slotsForField: BaseSingleInputFieldProps<
    TDate | null,
    TDate,
    FieldSection,
    unknown
  >['slots'] = {
    textField: slots.textField,
    ...fieldProps.slots,
  };

  const Layout = slots.layout ?? PickersLayout;

  let labelledById = labelId;
  if (isToolbarHidden) {
    if (label) {
      labelledById = `${labelId}-label`;
    } else {
      labelledById = undefined;
    }
  }
  const slotProps = {
    ...innerSlotProps,
    toolbar: {
      ...innerSlotProps?.toolbar,
      titleId: labelId,
    },
    mobilePaper: {
      'aria-labelledby': labelledById,
      ...innerSlotProps?.mobilePaper,
    },
  };

  const renderPicker = () => (
    <LocalizationProvider localeText={localeText}>
      <Field {...fieldProps} slots={slotsForField} slotProps={slotProps} />
      <PickersModalDialog {...actions} open={open} slots={slots} slotProps={slotProps}>
        <Layout {...layoutProps} {...slotProps?.layout} slots={slots} slotProps={slotProps}>
          {renderCurrentView()}
        </Layout>
      </PickersModalDialog>
    </LocalizationProvider>
  );

  return { renderPicker };
};
