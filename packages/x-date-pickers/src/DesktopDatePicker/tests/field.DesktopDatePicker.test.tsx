import { fireEvent } from '@mui-internal/test-utils';
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker';
import {
  createPickerRenderer,
  buildFieldInteractions,
  getTextbox,
  expectFieldValueV7,
  expectFieldValueV6,
  expectFieldPlaceholderV6,
  adapterToUse,
  describeAdapters,
} from 'test/utils/pickers';

describe('<DesktopDatePicker /> - Field', () => {
  describe('Basic behaviors', () => {
    const { render, clock } = createPickerRenderer({
      clock: 'fake',
      clockConfig: new Date('2018-01-01T10:05:05.000'),
    });
    const { renderWithProps } = buildFieldInteractions({
      clock,
      render,
      Component: DesktopDatePicker,
    });

    it('should be able to reset a single section', () => {
      // Test with v7 input
      const v7Response = renderWithProps(
        { format: `${adapterToUse.formats.month} ${adapterToUse.formats.dayOfMonth}` },
        { componentFamily: 'picker' },
      );

      v7Response.selectSection('month');
      expectFieldValueV7(v7Response.fieldContainer, 'MMMM DD');

      v7Response.pressCharacter(0, 'N');
      expectFieldValueV7(v7Response.fieldContainer, 'November DD');

      v7Response.pressCharacter(1, '4');
      expectFieldValueV7(v7Response.fieldContainer, 'November 04');

      v7Response.pressCharacter(1, '');
      expectFieldValueV7(v7Response.fieldContainer, 'November DD');

      v7Response.unmount();

      // Test with v6 input
      const v6Response = renderWithProps(
        {
          shouldUseV6TextField: true,
          format: `${adapterToUse.formats.month} ${adapterToUse.formats.dayOfMonth}`,
        },
        { componentFamily: 'picker' },
      );

      const input = getTextbox();
      v6Response.selectSection('month');
      expectFieldPlaceholderV6(input, 'MMMM DD');

      fireEvent.change(input, { target: { value: 'N DD' } }); // Press "N"
      expectFieldValueV6(input, 'November DD');

      fireEvent.change(input, { target: { value: 'November 4' } }); // Press "4"
      expectFieldValueV6(input, 'November 04');

      fireEvent.change(input, { target: { value: 'November ' } });
      expectFieldValueV6(input, 'November DD');
    });

    it('should adapt the default field format based on the props of the picker', () => {
      const testFormat = (props: DesktopDatePickerProps<any>, expectedFormat: string) => {
        // Test with v7 input
        const v7Response = renderWithProps(props, { componentFamily: 'picker' });
        expectFieldValueV7(v7Response.fieldContainer, expectedFormat);
        v7Response.unmount();

        // Test with v6 input
        const v6Response = renderWithProps(
          { ...props, shouldUseV6TextField: true },
          { componentFamily: 'picker' },
        );
        const input = getTextbox();
        expectFieldPlaceholderV6(input, expectedFormat);
        v6Response.unmount();
      };

      testFormat({ views: ['year'] }, 'YYYY');
      testFormat({ views: ['month'] }, 'MMMM');
      testFormat({ views: ['day'] }, 'DD');
      testFormat({ views: ['month', 'day'] }, 'MMMM DD');
      testFormat({ views: ['year', 'month'] }, 'MMMM YYYY');
      testFormat({ views: ['year', 'month', 'day'] }, 'MM/DD/YYYY');
      testFormat({ views: ['year', 'day'] }, 'MM/DD/YYYY');
    });
  });

  describeAdapters('Timezone', DesktopDatePicker, ({ adapter, renderWithProps }) => {
    it('should clear the selected section when all sections are completed when using timezones', () => {
      const v7Response = renderWithProps(
        {
          value: adapter.date()!,
          format: `${adapter.formats.month} ${adapter.formats.year}`,
          timezone: 'America/Chicago',
        },
        { componentFamily: 'picker' },
      );

      expectFieldValueV7(v7Response.fieldContainer, 'June 2022');
      v7Response.selectSection('month');

      v7Response.pressCharacter(0, '');
      expectFieldValueV7(v7Response.fieldContainer, 'MMMM 2022');
    });
  });
});
