import * as React from 'react';

import { unstable_useForkRef as useForkRef } from '@mui/utils';
import Box from '@mui/system/Box';
import styled from '@mui/system/styled';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { unstable_useDateField as useDateField } from '@mui/x-date-pickers/DateField';
import { useClearableField } from '@mui/x-date-pickers/hooks';

import { Unstable_PickersSectionList as PickersSectionList } from '@mui/x-date-pickers/PickersSectionList';

const BrowserFieldContent = styled('div', { name: 'BrowserField', slot: 'Content' })(
  {
    border: '1px solid grey',
    fontSize: 13.33333,
    lineHeight: 'normal',
    padding: '1px 2px',
    width: '20ch',
  },
);

const BrowserField = React.forwardRef((props, ref) => {
  const {
    disabled,
    id,
    label,
    inputRef,
    InputProps: { ref: containerRef, startAdornment, endAdornment } = {},
    // extracting `error`, 'focused', and `ownerState` as `input` does not support those props
    error,
    focused,
    ownerState,
    sx,
    textField,
    elements,
    onClick,
    onInput,
    sectionRef,
    contentEditable,
    onFocus,
    onBlur,
    tabIndex,
    ...other
  } = props;

  const handleRef = useForkRef(containerRef, ref);

  return (
    <Box
      sx={{ ...(sx || {}), display: 'flex', alignItems: 'center' }}
      id={id}
      ref={handleRef}
      {...other}
    >
      {startAdornment}
      <BrowserFieldContent>
        <PickersSectionList
          elements={elements}
          sectionRef={sectionRef}
          contentEditable={contentEditable}
          onFocus={onFocus}
          onBlur={onBlur}
          tabIndex={tabIndex}
        />
      </BrowserFieldContent>
      {endAdornment}
    </Box>
  );
});

const BrowserDateField = React.forwardRef((props, ref) => {
  const { slots, slotProps, ...textFieldProps } = props;

  const fieldResponse = useDateField({
    ...textFieldProps,
    shouldUseV6TextField: false,
  });

  /* If you don't need a clear button, you can skip the use of this hook */
  const processedFieldProps = useClearableField({
    ...fieldResponse,
    slots,
    slotProps,
  });

  return <BrowserField ref={ref} {...processedFieldProps} />;
});

const BrowserDatePicker = React.forwardRef((props, ref) => {
  return (
    <DatePicker
      ref={ref}
      {...props}
      slots={{ field: BrowserDateField, ...props.slots }}
    />
  );
});

export default function BrowserV7Field() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BrowserDatePicker
        slotProps={{
          field: { clearable: true },
        }}
      />
    </LocalizationProvider>
  );
}
