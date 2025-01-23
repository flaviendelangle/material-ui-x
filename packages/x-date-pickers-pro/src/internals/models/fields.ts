import { SxProps } from '@mui/material/styles';

/**
 * Props the multi input field can receive when used inside a picker.
 * Only contains what the MUI components are passing to the field, not what users can pass using the `props.slotProps.field`.
 */
export interface BaseMultiInputFieldProps {
  className: string | undefined;
  sx: SxProps<any> | undefined;
}
