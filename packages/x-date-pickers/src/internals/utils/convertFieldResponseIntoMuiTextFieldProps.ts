import { TextFieldProps } from '@mui/material/TextField';
import { UseFieldReturnValue } from '../hooks/useField';

export const convertFieldResponseIntoMuiTextFieldProps = <
  TFieldResponse extends UseFieldReturnValue<any, any>,
>({
  enableAccessibleFieldDOMStructure,
  ...fieldResponse
}: TFieldResponse): TextFieldProps => {
  if (enableAccessibleFieldDOMStructure) {
    const { InputProps, readOnly, ...other } = fieldResponse;

    return {
      ...other,
      InputProps: { ...(InputProps ?? {}), readOnly },
    } as any;
  }

  const { onPaste, onKeyDown, inputMode, readOnly, InputProps, inputProps, inputRef, ...other } =
    fieldResponse;

  return {
    ...other,
    InputProps: { ...(InputProps ?? {}), readOnly },
    inputProps: { ...(inputProps ?? {}), inputMode, onPaste, onKeyDown, ref: inputRef },
  } as any;
};
