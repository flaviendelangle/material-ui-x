import * as React from 'react';
import { createPickerRenderer, getTextbox, expectInputPlaceholderV6 } from 'test/utils/pickers';
import {
  DesktopDateTimePicker,
  DesktopDateTimePickerProps,
} from '@mui/x-date-pickers/DesktopDateTimePicker';

describe('<DesktopDateTimePicker /> - Field', () => {
  const { render } = createPickerRenderer();

  it('should pass the ampm prop to the field', () => {
    const { setProps } = render(<DesktopDateTimePicker ampm />);

    const input = getTextbox();
    expectInputPlaceholderV6(input, 'MM/DD/YYYY hh:mm aa');

    setProps({ ampm: false });
    expectInputPlaceholderV6(input, 'MM/DD/YYYY hh:mm');
  });

  it('should adapt the default field format based on the props of the picker', () => {
    const testFormat = (props: DesktopDateTimePickerProps<any>, expectedFormat: string) => {
      const { unmount } = render(<DesktopDateTimePicker {...props} />);
      const input = getTextbox();
      expectInputPlaceholderV6(input, expectedFormat);
      unmount();
    };

    testFormat({ views: ['day', 'hours', 'minutes'], ampm: false }, 'DD hh:mm');
    testFormat({ views: ['day', 'hours', 'minutes'], ampm: true }, 'DD hh:mm aa');
    testFormat({ views: ['day', 'hours', 'minutes', 'seconds'], ampm: false }, 'DD hh:mm:ss');
    testFormat({ views: ['day', 'hours', 'minutes', 'seconds'], ampm: true }, 'DD hh:mm:ss aa');
    testFormat(
      { views: ['year', 'month', 'day', 'hours', 'minutes', 'seconds'], ampm: false },
      'MM/DD/YYYY hh:mm:ss',
    );
    testFormat(
      { views: ['year', 'month', 'day', 'hours', 'minutes', 'seconds'], ampm: true },
      'MM/DD/YYYY hh:mm:ss aa',
    );
  });
});
