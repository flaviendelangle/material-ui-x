import * as React from 'react';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { createPickerRenderer, getTextbox, expectInputPlaceholderV6 } from 'test/utils/pickers';

describe('<MobileDateTimePicker /> - Field', () => {
  const { render } = createPickerRenderer();

  it('should pass the ampm prop to the field', () => {
    const { setProps } = render(<MobileDateTimePicker ampm />);

    const input = getTextbox();
    expectInputPlaceholderV6(input, 'MM/DD/YYYY hh:mm aa');

    setProps({ ampm: false });
    expectInputPlaceholderV6(input, 'MM/DD/YYYY hh:mm');
  });
});
