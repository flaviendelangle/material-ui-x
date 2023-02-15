import * as React from 'react';
import {
  ExportedPickersLayoutSlotsComponent,
  ExportedPickersLayoutSlotsComponentsProps,
} from '../../../PickersLayout/PickersLayout.types';
import { DateOrTimeView } from '../../models';
import { BasePickerProps } from '../../models/props/basePickerProps';
import { UncapitalizeObjectKeys } from '../../utils/slots-migration';
import { UsePickerParams } from '../usePicker';
import { UsePickerViewsProps } from '../usePicker/usePickerViews';
import { FieldSection } from '../useField';

export interface UseStaticPickerSlotsComponent<TDate, TView extends DateOrTimeView>
  extends ExportedPickersLayoutSlotsComponent<TDate | null, TDate, TView> {}

export interface UseStaticPickerSlotsComponentsProps<TDate, TView extends DateOrTimeView>
  extends ExportedPickersLayoutSlotsComponentsProps<TDate | null, TDate, TView> {}

export interface StaticOnlyPickerProps {
  /**
   * Force static wrapper inner components to be rendered in mobile or desktop mode.
   * @default "mobile"
   */
  displayStaticWrapperAs: 'desktop' | 'mobile';
  /**
   * If `true`, the view is focused during the first mount.
   */
  autoFocus?: boolean;
}

export interface UseStaticPickerProps<
  TDate,
  TView extends DateOrTimeView,
  TError,
  TExternalProps extends UsePickerViewsProps<TDate | null, TView, any, any>,
> extends BasePickerProps<TDate | null, TDate, TView, TError, TExternalProps, {}>,
    StaticOnlyPickerProps {
  /**
   * Overrideable components.
   * @default {}
   * @deprecated Please use `slots`.
   */
  components?: UseStaticPickerSlotsComponent<TDate, TView>;
  /**
   * The props used for each component slot.
   * @default {}
   * @deprecated Please use `slotProps`.
   */
  componentsProps?: UseStaticPickerSlotsComponentsProps<TDate, TView>;
  /**
   * Overrideable component slots.
   * @default {}
   */
  slots?: UncapitalizeObjectKeys<UseStaticPickerSlotsComponent<TDate | null, TView>>;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: UseStaticPickerSlotsComponentsProps<TDate, TView>;
}

export interface UseStaticPickerParams<
  TDate,
  TView extends DateOrTimeView,
  TExternalProps extends UseStaticPickerProps<TDate, TView, any, TExternalProps>,
> extends Pick<
    UsePickerParams<TDate | null, TDate, TView, FieldSection, TExternalProps, {}>,
    'valueManager' | 'validator'
  > {
  props: TExternalProps;
  /**
   * Ref to pass to the root element
   */
  ref?: React.Ref<HTMLDivElement>;
}
