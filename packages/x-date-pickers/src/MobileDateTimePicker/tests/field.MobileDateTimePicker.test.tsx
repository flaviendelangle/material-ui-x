import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import {
  createPickerRenderer,
  expectFieldValueV7,
  buildFieldInteractions,
} from 'test/utils/pickers';

describe('<MobileDateTimePicker /> - Field', () => {
  const { render, clock } = createPickerRenderer();
  const { renderWithProps } = buildFieldInteractions({
    clock,
    render,
    Component: MobileDateTimePicker,
  });

  it('should pass the ampm prop to the field', () => {
    const v7Response = renderWithProps({ ampm: true });

    expectFieldValueV7(v7Response.fieldContainer, 'MM/DD/YYYY hh:mm aa');

    v7Response.setProps({ ampm: false });
    expectFieldValueV7(v7Response.fieldContainer, 'MM/DD/YYYY hh:mm');
  });
});
