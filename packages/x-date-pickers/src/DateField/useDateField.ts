'use client';
import * as React from 'react';
import {
  singleItemFieldValueManager,
  singleItemValueManager,
} from '../internals/utils/valueManagers';
import { useField } from '../internals/hooks/useField';
import { UseDateFieldProps } from './DateField.types';
import { validateDate } from '../validation';
import { useSplitFieldProps } from '../hooks';
import { useDefaultizedDateField } from '../internals/hooks/defaultizedFieldProps';
import { getDateValueManager } from '../valueManagers';

export const useDateField = <
  TEnableAccessibleFieldDOMStructure extends boolean,
  TAllProps extends UseDateFieldProps<TEnableAccessibleFieldDOMStructure>,
>(
  inProps: TAllProps,
) => {
  const valueManager = React.useMemo(
    () => getDateValueManager(inProps.enableAccessibleFieldDOMStructure),
    [inProps.enableAccessibleFieldDOMStructure],
  );

  const props = useDefaultizedDateField<
    UseDateFieldProps<TEnableAccessibleFieldDOMStructure>,
    TAllProps
  >(inProps);

  const { forwardedProps, internalProps } = useSplitFieldProps(props, 'date');

  return useField<
    false,
    TEnableAccessibleFieldDOMStructure,
    typeof forwardedProps,
    typeof internalProps
  >({
    forwardedProps,
    internalProps,
    valueManager: singleItemValueManager,
    fieldValueManager: singleItemFieldValueManager,
    validator: validateDate,
    valueType: 'date',
  });
};
