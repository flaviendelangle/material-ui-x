import * as React from 'react';
import { expect } from 'chai';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { screen } from '@mui-internal/test-utils/createRenderer';
import { createPickerRenderer, stubMatchMedia } from 'test/utils/pickers';
import { pickersInputClasses } from '@mui/x-date-pickers/internals/components/PickersTextField/pickersTextFieldClasses';

describe('<DatePicker />', () => {
  const { render } = createPickerRenderer();

  it('should render in mobile mode when `useMediaQuery` returns `false`', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = stubMatchMedia(false);

    render(<DatePicker />);

    expect(screen.getByLabelText(/Choose date/)).to.have.class(pickersInputClasses.input);

    window.matchMedia = originalMatchMedia;
  });
});
