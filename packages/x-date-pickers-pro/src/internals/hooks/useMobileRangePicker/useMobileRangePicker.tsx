import * as React from 'react';
import { useSlotProps } from '@mui/base/utils';
import { useLicenseVerifier } from '@mui/x-license-pro';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { FieldRef } from '@mui/x-date-pickers/models';
import { PickersLayout, PickersLayoutSlotProps } from '@mui/x-date-pickers/PickersLayout';
import {
  usePicker,
  PickersModalDialog,
  InferError,
  ExportedBaseToolbarProps,
  useLocaleText,
} from '@mui/x-date-pickers/internals';
import useId from '@mui/utils/useId';
import { DateOrTimeViewWithMeridiem } from '@mui/x-date-pickers/internals/models';
import {
  MobileRangePickerAdditionalViewProps,
  UseMobileRangePickerParams,
  UseMobileRangePickerProps,
} from './useMobileRangePicker.types';
import { useEnrichedRangePickerFieldProps } from '../useEnrichedRangePickerFieldProps';
import { getReleaseInfo } from '../../utils/releaseInfo';
import { DateRange } from '../../models/range';
import { BaseMultiInputFieldProps, RangeFieldSection } from '../../models/fields';
import { useRangePosition } from '../useRangePosition';

const releaseInfo = getReleaseInfo();

export const useMobileRangePicker = <
  TDate,
  TView extends DateOrTimeViewWithMeridiem,
  TUseV6TextField extends boolean,
  TExternalProps extends UseMobileRangePickerProps<
    TDate,
    TView,
    TUseV6TextField,
    any,
    TExternalProps
  >,
>({
  props,
  ...pickerParams
}: UseMobileRangePickerParams<TDate, TView, TUseV6TextField, TExternalProps>) => {
  useLicenseVerifier('x-date-pickers-pro', releaseInfo);

  const {
    slots,
    slotProps: innerSlotProps,
    className,
    sx,
    format,
    formatDensity,
    shouldUseV6TextField,
    selectedSections,
    onSelectedSectionsChange,
    timezone,
    label,
    inputRef,
    name,
    readOnly,
    disabled,
    disableOpenPicker,
    localeText,
  } = props;

  const startFieldRef = React.useRef<FieldRef<RangeFieldSection>>(null);
  const endFieldRef = React.useRef<FieldRef<RangeFieldSection>>(null);

  const fieldType = (slots.field as any).fieldType ?? 'multi-input';
  const { rangePosition, onRangePositionChange } = useRangePosition(
    props,
    fieldType === 'single-input' ? startFieldRef : undefined,
  );
  const labelId = useId();
  const contextLocaleText = useLocaleText();

  const {
    open,
    actions,
    layoutProps,
    renderCurrentView,
    fieldProps: pickerFieldProps,
  } = usePicker<
    DateRange<TDate>,
    TDate,
    TView,
    RangeFieldSection,
    TExternalProps,
    MobileRangePickerAdditionalViewProps
  >({
    ...pickerParams,
    props,
    wrapperVariant: 'mobile',
    autoFocusView: true,
    fieldRef: rangePosition === 'start' ? startFieldRef : endFieldRef,
    additionalViewProps: {
      rangePosition,
      onRangePositionChange,
    },
  });

  const Field = slots.field;

  const fieldProps: BaseMultiInputFieldProps<
    DateRange<TDate>,
    TDate,
    RangeFieldSection,
    TUseV6TextField,
    InferError<TExternalProps>
  > = useSlotProps({
    elementType: Field,
    externalSlotProps: innerSlotProps?.field,
    additionalProps: {
      ...pickerFieldProps,
      readOnly: readOnly ?? true,
      disabled,
      className,
      sx,
      format,
      formatDensity,
      shouldUseV6TextField,
      selectedSections,
      onSelectedSectionsChange,
      timezone,
      ...(inputRef ? { inputRef, name } : {}),
    },
    ownerState: props,
  });

  const isToolbarHidden = innerSlotProps?.toolbar?.hidden ?? false;

  const enrichedFieldProps = useEnrichedRangePickerFieldProps<
    TDate,
    TView,
    TUseV6TextField,
    InferError<TExternalProps>
  >({
    wrapperVariant: 'mobile',
    fieldType,
    open,
    actions,
    readOnly,
    labelId,
    disableOpenPicker,
    label,
    localeText,
    rangePosition,
    onRangePositionChange,
    pickerSlots: slots,
    pickerSlotProps: innerSlotProps,
    fieldProps,
    startFieldRef,
    endFieldRef,
  });

  const slotPropsForLayout: PickersLayoutSlotProps<DateRange<TDate>, TDate, TView> = {
    ...innerSlotProps,
    toolbar: {
      ...innerSlotProps?.toolbar,
      titleId: labelId,
      rangePosition,
      onRangePositionChange,
    } as ExportedBaseToolbarProps,
  };

  const Layout = slots?.layout ?? PickersLayout;

  const finalLocaleText = {
    ...contextLocaleText,
    ...localeText,
  };
  let labelledById = labelId;
  if (isToolbarHidden) {
    const labels: string[] = [];
    if (fieldType === 'multi-input') {
      if (finalLocaleText.start) {
        labels.push(`${labelId}-start-label`);
      }
      if (finalLocaleText.end) {
        labels.push(`${labelId}-end-label`);
      }
    } else if (label != null) {
      labels.push(`${labelId}-label`);
    }

    labelledById = labels.length > 0 ? labels.join(' ') : undefined;
  }
  const slotProps = {
    ...innerSlotProps,
    mobilePaper: {
      'aria-labelledby': labelledById,
      ...innerSlotProps?.mobilePaper,
    },
  };

  const renderPicker = () => (
    <LocalizationProvider localeText={localeText}>
      <Field {...enrichedFieldProps} />
      <PickersModalDialog {...actions} open={open} slots={slots} slotProps={slotProps}>
        <Layout
          {...layoutProps}
          {...slotProps?.layout}
          slots={slots}
          slotProps={slotPropsForLayout}
        >
          {renderCurrentView()}
        </Layout>
      </PickersModalDialog>
    </LocalizationProvider>
  );

  return {
    renderPicker,
  };
};
