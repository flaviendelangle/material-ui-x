import { generateUtilityClass, generateUtilityClasses } from '@mui/base';

export interface ClockPickerClasses {
  /** Styles applied to the arrowSwitcher element. */
  arrowSwitcher: string;
}

export type ClockPickerClassKey = keyof ClockPickerClasses;

export function getClockPickerUtilityClass(slot: string) {
  return generateUtilityClass('MuiClockPicker', slot);
}

export const clockPickerClasses: ClockPickerClasses = generateUtilityClasses('MuiClockPicker', [
  'arrowSwitcher',
]);
