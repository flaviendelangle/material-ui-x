import {
  expectFieldPlaceholderV6,
  expectFieldValueV6,
  expectFieldValueV7,
  getTextbox,
  describeAdapters,
} from 'test/utils/pickers';
import { DateField } from '@mui/x-date-pickers/DateField';

describeAdapters('<DateField /> - Format', DateField, ({ adapter, renderWithProps }) => {
  it('should support escaped characters in start separator', () => {
    const { start: startChar, end: endChar } = adapter.escapedCharacters;

    // Test with v7 input
    const v7Response = renderWithProps({
      // For Day.js: "[Escaped] YYYY"
      format: `${startChar}Escaped${endChar} ${adapter.formats.year}`,
    });
    expectFieldValueV7(v7Response.fieldContainer, 'Escaped YYYY');

    v7Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV7(v7Response.fieldContainer, 'Escaped 2019');

    v7Response.unmount();

    // Test with v6 input
    const v6Response = renderWithProps({
      // For Day.js: "[Escaped] YYYY"
      format: `${startChar}Escaped${endChar} ${adapter.formats.year}`,
      shouldUseV6TextField: true,
    });
    const input = getTextbox();
    expectFieldPlaceholderV6(input, 'Escaped YYYY');

    v6Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV6(input, 'Escaped 2019');
  });

  it('should support escaped characters between sections separator', () => {
    const { start: startChar, end: endChar } = adapter.escapedCharacters;

    // Test with v7 input
    const v7Response = renderWithProps({
      // For Day.js: "MMMM [Escaped] YYYY"
      format: `${adapter.formats.month} ${startChar}Escaped${endChar} ${adapter.formats.year}`,
    });

    expectFieldValueV7(v7Response.fieldContainer, 'MMMM Escaped YYYY');

    v7Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV7(v7Response.fieldContainer, 'January Escaped 2019');

    v7Response.unmount();

    // Test with v6 input
    const v6Response = renderWithProps({
      // For Day.js: "MMMM [Escaped] YYYY"
      format: `${adapter.formats.month} ${startChar}Escaped${endChar} ${adapter.formats.year}`,
      shouldUseV6TextField: true,
    });

    const input = getTextbox();
    expectFieldPlaceholderV6(input, 'MMMM Escaped YYYY');

    v6Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV6(input, 'January Escaped 2019');
  });

  it('should support nested escaped characters', function test() {
    const { start: startChar, end: endChar } = adapter.escapedCharacters;
    // If your start character and end character are equal
    // Then you can't have nested escaped characters
    if (startChar === endChar) {
      this.skip();
    }

    // Test with v7 input
    const v7Response = renderWithProps({
      // For Day.js: "MMMM [Escaped[] YYYY"
      format: `${adapter.formats.month} ${startChar}Escaped ${startChar}${endChar} ${adapter.formats.year}`,
    });

    expectFieldValueV7(v7Response.fieldContainer, 'MMMM Escaped [ YYYY');

    v7Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV7(v7Response.fieldContainer, 'January Escaped [ 2019');

    v7Response.unmount();

    // Test with v6 input
    const v6Response = renderWithProps({
      // For Day.js: "MMMM [Escaped[] YYYY"
      format: `${adapter.formats.month} ${startChar}Escaped ${startChar}${endChar} ${adapter.formats.year}`,
      shouldUseV6TextField: true,
    });

    const input = getTextbox();
    expectFieldPlaceholderV6(input, 'MMMM Escaped [ YYYY');

    v6Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV6(input, 'January Escaped [ 2019');
  });

  it('should support several escaped parts', () => {
    const { start: startChar, end: endChar } = adapter.escapedCharacters;

    // Test with v7 input
    const v7Response = renderWithProps({
      // For Day.js: "[Escaped] MMMM [Escaped] YYYY"
      format: `${startChar}Escaped${endChar} ${adapter.formats.month} ${startChar}Escaped${endChar} ${adapter.formats.year}`,
    });

    expectFieldValueV7(v7Response.fieldContainer, 'Escaped MMMM Escaped YYYY');

    v7Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV7(v7Response.fieldContainer, 'Escaped January Escaped 2019');

    v7Response.unmount();

    // Test with v6 input
    const v6Response = renderWithProps({
      // For Day.js: "[Escaped] MMMM [Escaped] YYYY"
      format: `${startChar}Escaped${endChar} ${adapter.formats.month} ${startChar}Escaped${endChar} ${adapter.formats.year}`,
      shouldUseV6TextField: true,
    });

    const input = getTextbox();
    expectFieldPlaceholderV6(input, 'Escaped MMMM Escaped YYYY');

    v6Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV6(input, 'Escaped January Escaped 2019');
  });

  it('should add spaces around `/` when `formatDensity = "spacious"`', () => {
    // Test with v7 input
    const v7Response = renderWithProps({
      formatDensity: `spacious`,
    });

    expectFieldValueV7(v7Response.fieldContainer, 'MM / DD / YYYY');

    v7Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV7(v7Response.fieldContainer, '01 / 01 / 2019');

    v7Response.unmount();

    // Test with v6 input
    const v6Response = renderWithProps({
      formatDensity: `spacious`,
      shouldUseV6TextField: true,
    });

    const input = getTextbox();
    expectFieldPlaceholderV6(input, 'MM / DD / YYYY');

    v6Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV6(input, '01 / 01 / 2019');
  });

  it('should add spaces around `.` when `formatDensity = "spacious"`', () => {
    // Test with v7 input
    const v7Response = renderWithProps({
      formatDensity: `spacious`,
      format: adapter.expandFormat(adapter.formats.keyboardDate).replace(/\//g, '.'),
    });

    expectFieldValueV7(v7Response.fieldContainer, 'MM . DD . YYYY');

    v7Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV7(v7Response.fieldContainer, '01 . 01 . 2019');

    v7Response.unmount();

    // Test with v6 input
    const v6Response = renderWithProps({
      formatDensity: `spacious`,
      format: adapter.expandFormat(adapter.formats.keyboardDate).replace(/\//g, '.'),
      shouldUseV6TextField: true,
    });

    const input = getTextbox();
    expectFieldPlaceholderV6(input, 'MM . DD . YYYY');

    v6Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV6(input, '01 . 01 . 2019');
  });

  it('should add spaces around `-` when `formatDensity = "spacious"`', () => {
    // Test with v7 input
    const v7Response = renderWithProps({
      formatDensity: `spacious`,
      format: adapter.expandFormat(adapter.formats.keyboardDate).replace(/\//g, '-'),
    });

    expectFieldValueV7(v7Response.fieldContainer, 'MM - DD - YYYY');

    v7Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV7(v7Response.fieldContainer, '01 - 01 - 2019');

    v7Response.unmount();

    // Test with v6 input
    const v6Response = renderWithProps({
      formatDensity: `spacious`,
      format: adapter.expandFormat(adapter.formats.keyboardDate).replace(/\//g, '-'),
      shouldUseV6TextField: true,
    });

    const input = getTextbox();
    expectFieldPlaceholderV6(input, 'MM - DD - YYYY');

    v6Response.setProps({ value: adapter.date('2019-01-01') });
    expectFieldValueV6(input, '01 - 01 - 2019');
  });
});
