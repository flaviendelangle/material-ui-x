import useEventCallback from '@mui/utils/useEventCallback';
import {
  SectionOrdering,
  UseFieldForwardedProps,
  UseFieldInternalProps,
  UseFieldDOMInteractions,
} from './useField.types';
import { FieldSection, PickerValidDate } from '../../../models';
import { UseFieldStateResponse } from './useFieldState';
import { buildDefaultSectionOrdering } from './useField.utils';

export const useFieldClearValueProps = <
  TValue,
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TSection extends FieldSection,
>(
  parameters: UseFieldClearValuePropsParameters<
    TValue,
    TDate,
    TEnableAccessibleFieldDOMStructure,
    TSection
  >,
) => {
  const {
    forwardedProps: { clearable: inClearable, onClear },
    internalProps: { readOnly, disabled },
    stateResponse: { setSelectedSections, clearValue, state, areAllSectionsEmpty },
    interactions,
    sectionOrder = buildDefaultSectionOrdering(state.sections.length),
  } = parameters;

  const handleClear = useEventCallback((event: React.MouseEvent, ...args) => {
    event.preventDefault();
    onClear?.(event, ...(args as []));
    clearValue();

    if (!interactions.isFieldFocused()) {
      // setSelectedSections is called internally
      interactions.focusField(0);
    } else {
      setSelectedSections(sectionOrder.startIndex);
    }
  });

  const clearable = Boolean(inClearable && !areAllSectionsEmpty && !readOnly && !disabled);

  return {
    onClear: handleClear,
    clearable,
  };
};

interface UseFieldClearValuePropsParameters<
  TValue,
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean,
  TSection extends FieldSection,
> {
  forwardedProps: UseFieldForwardedProps<TEnableAccessibleFieldDOMStructure>;
  internalProps: UseFieldInternalProps<
    TValue,
    TDate,
    TSection,
    TEnableAccessibleFieldDOMStructure,
    any
  >;
  stateResponse: UseFieldStateResponse<TValue, TDate, TSection>;
  interactions: UseFieldDOMInteractions;
  /**
   * Only define when used with the legacy DOM structure.
   * TODO v9: Remove
   */
  sectionOrder?: SectionOrdering;
}
