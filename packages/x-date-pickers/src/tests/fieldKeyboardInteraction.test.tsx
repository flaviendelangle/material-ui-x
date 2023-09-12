import * as React from 'react';
import { expect } from 'chai';
import moment from 'moment/moment';
import jMoment from 'moment-jalaali';
import { userEvent } from '@mui/monorepo/test/utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  buildFieldInteractions,
  getCleanedSelectedContent,
  getTextbox,
  createPickerRenderer,
  expectInputValue,
} from 'test/utils/pickers';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import { FieldSectionType, MuiPickersAdapter } from '@mui/x-date-pickers/models';
import {
  getDateSectionConfigFromFormatToken,
  cleanLeadingZeros,
} from '../internals/hooks/useField/useField.utils';

const testDate = new Date(2018, 4, 15, 9, 35, 10);

function updateDate<TDate>(
  date: TDate,
  adapter: MuiPickersAdapter<TDate>,
  sectionType: FieldSectionType,
  diff: number,
) {
  switch (sectionType) {
    case 'year':
      return adapter.addYears(date, diff);
    case 'month':
      return adapter.addMonths(date, diff);
    case 'day':
    case 'weekDay':
      return adapter.addDays(date, diff);
    case 'hours':
      return adapter.addHours(date, diff);
    case 'minutes':
      return adapter.addMinutes(date, diff);
    case 'seconds':
      return adapter.addSeconds(date, diff);
    case 'meridiem':
      return adapter.setHours(date, (adapter.getHours(date) + 12 * diff) % 24);
    default:
      return null;
  }
}

const adapterToTest = [
  'luxon',
  'date-fns',
  'dayjs',
  'moment',
  'date-fns-jalali',
  // 'moment-hijri',
  'moment-jalaali',
] as const;

const theme = createTheme({
  direction: 'rtl',
});

describe(`RTL - test arrows navigation`, () => {
  const { render, clock, adapter } = createPickerRenderer({
    clock: 'fake',
    adapterName: 'moment-jalaali',
  });

  before(() => {
    jMoment.loadPersian();
  });

  after(() => {
    moment.locale('en');
  });

  const { clickOnInput } = buildFieldInteractions({ clock, render, Component: DateTimeField });

  it('should move selected section to the next section respecting RTL order in empty field', () => {
    render(
      <ThemeProvider theme={theme}>
        <DateTimeField />
      </ThemeProvider>,
    );
    const input = getTextbox();
    clickOnInput(input, 24);

    const expectedValues = ['hh', 'mm', 'YYYY', 'MM', 'DD', 'DD'];

    expectedValues.forEach((expectedValue) => {
      expect(getCleanedSelectedContent(input)).to.equal(expectedValue);
      userEvent.keyPress(input, { key: 'ArrowRight' });
    });
  });

  it('should move selected section to the previous section respecting RTL order in empty field', () => {
    render(
      <ThemeProvider theme={theme}>
        <DateTimeField />
      </ThemeProvider>,
    );
    const input = getTextbox();
    clickOnInput(input, 18);

    const expectedValues = ['DD', 'MM', 'YYYY', 'mm', 'hh', 'hh'];

    expectedValues.forEach((expectedValue) => {
      expect(getCleanedSelectedContent(input)).to.equal(expectedValue);
      userEvent.keyPress(input, { key: 'ArrowLeft' });
    });
  });

  it('should move selected section to the next section respecting RTL order in non-empty field', () => {
    render(
      <ThemeProvider theme={theme}>
        <DateTimeField defaultValue={adapter.date(new Date(2018, 3, 25, 11, 54))} />
      </ThemeProvider>,
    );
    const input = getTextbox();
    clickOnInput(input, 24);

    // 25/04/2018 => 1397/02/05
    const expectedValues = ['11', '54', '1397', '02', '05', '05'];

    expectedValues.forEach((expectedValue) => {
      expect(getCleanedSelectedContent(input)).to.equal(expectedValue);
      userEvent.keyPress(input, { key: 'ArrowRight' });
    });
  });

  it('should move selected section to the previous section respecting RTL order in non-empty field', () => {
    render(
      <ThemeProvider theme={theme}>
        <DateTimeField defaultValue={adapter.date(new Date(2018, 3, 25, 11, 54))} />
      </ThemeProvider>,
    );
    const input = getTextbox();
    clickOnInput(input, 18);

    // 25/04/2018 => 1397/02/05
    const expectedValues = ['05', '02', '1397', '54', '11', '11'];

    expectedValues.forEach((expectedValue) => {
      expect(getCleanedSelectedContent(input)).to.equal(expectedValue);
      userEvent.keyPress(input, { key: 'ArrowLeft' });
    });
  });
});

adapterToTest.forEach((adapterName) => {
  describe(`test keyboard interaction with ${adapterName} adapter`, () => {
    const { render, clock, adapter } = createPickerRenderer({
      clock: 'fake',
      adapterName,
    });

    before(() => {
      if (adapterName === 'moment-jalaali') {
        jMoment.loadPersian();
      } else if (adapterName === 'moment') {
        moment.locale('en');
      }
    });

    after(() => {
      if (adapterName === 'moment-jalaali') {
        moment.locale('en');
      }
    });

    const { clickOnInput } = buildFieldInteractions({ clock, render, Component: DateTimeField });

    const cleanValueStr = (
      valueStr: string,
      sectionConfig: ReturnType<typeof getDateSectionConfigFromFormatToken>,
    ) => {
      if (sectionConfig.contentType === 'digit' && sectionConfig.maxLength != null) {
        return cleanLeadingZeros(adapter, valueStr, sectionConfig.maxLength);
      }

      return valueStr;
    };

    const testKeyPress = <TDate extends unknown>({
      key,
      format,
      initialValue,
      expectedValue,
      sectionConfig,
    }: {
      key: string;
      format: string;
      initialValue: TDate;
      expectedValue: TDate;
      sectionConfig: ReturnType<typeof getDateSectionConfigFromFormatToken>;
    }) => {
      render(<DateTimeField defaultValue={initialValue} format={format} />);
      const input = getTextbox();
      clickOnInput(input, 1);
      userEvent.keyPress(input, { key });

      expectInputValue(
        input,
        cleanValueStr(adapter.formatByString(expectedValue, format), sectionConfig),
      );
    };

    const testKeyboardInteraction = (formatToken) => {
      const sectionConfig = getDateSectionConfigFromFormatToken(adapter, formatToken);

      it(`should increase "${sectionConfig.type}" when pressing ArrowUp on "${formatToken}" token`, () => {
        const initialValue = adapter.date(testDate);
        const expectedValue = updateDate(initialValue, adapter, sectionConfig.type, 1);

        testKeyPress({
          key: 'ArrowUp',
          initialValue,
          expectedValue,
          sectionConfig,
          format: formatToken,
        });
      });

      it(`should decrease "${sectionConfig.type}" when pressing ArrowDown on "${formatToken}" token`, () => {
        const initialValue = adapter.date(testDate);
        const expectedValue = updateDate(initialValue, adapter, sectionConfig.type, -1);

        testKeyPress({
          key: 'ArrowDown',
          initialValue,
          expectedValue,
          sectionConfig,
          format: formatToken,
        });
      });
    };

    Object.keys(adapter.formatTokenMap).forEach((formatToken) => {
      testKeyboardInteraction(formatToken);
    });
  });
});
