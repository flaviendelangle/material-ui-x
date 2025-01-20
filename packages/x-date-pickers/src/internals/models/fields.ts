import { SxProps } from '@mui/material/styles';
import type { FieldSection, PickerOwnerState } from '../../models';
import type { UseFieldInternalProps } from '../hooks/useField';
import { RangePosition } from './pickers';
import { PickerValidValue } from './value';
import type { ExportedPickerFieldUIProps } from '../components/PickerFieldUI';

export interface FieldRangeSection extends FieldSection {
  dateName: RangePosition;
}

/**
 * Props the single input field can receive when used inside a picker.
 * Only contains what the MUI components are passing to the field, not what users can pass using the `props.slotProps.field`.
 */
export interface BaseSingleInputFieldProps
  extends Pick<ExportedPickerFieldUIProps, 'clearable' | 'onClear'> {
  className: string | undefined;
  sx: SxProps<any> | undefined;
  label: React.ReactNode | undefined;
  name: string | undefined;
  id?: string;
  focused?: boolean;
  onKeyDown?: React.KeyboardEventHandler;
  onBlur?: React.FocusEventHandler;
  ref?: React.Ref<HTMLDivElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  ownerState: PickerOwnerState;
}
