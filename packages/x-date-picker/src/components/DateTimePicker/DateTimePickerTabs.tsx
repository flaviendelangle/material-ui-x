import * as React from 'react';
import Tab from '@mui/material/Tab';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';
import { Time, DateRange } from '../icons';
import {
  WrapperVariantContext,
  WrapperVariant,
} from '../../internal/pickers/wrappers/WrapperVariantContext';
import { CalendarOrClockPickerView } from '../../models';

type TabValue = 'date' | 'time';

const viewToTab = (openView: CalendarOrClockPickerView): TabValue => {
  // TODO: what happens if `openView` is `month`?
  if (openView === 'day' || openView === 'year') {
    return 'date';
  }

  return 'time';
};

const tabToView = (tab: TabValue): CalendarOrClockPickerView => {
  if (tab === 'date') {
    return 'day';
  }

  return 'hours';
};

export interface DateTimePickerTabsProps {
  dateRangeIcon?: React.ReactNode;
  onChange: (view: CalendarOrClockPickerView) => void;
  timeIcon?: React.ReactNode;
  view: CalendarOrClockPickerView;
}

type OwnerState = DateTimePickerTabsProps & { wrapperVariant: WrapperVariant };

const DateTimePickerTabsRoot = styled(Tabs, { skipSx: true })<{ ownerState: OwnerState }>(
  ({ ownerState, theme }) => ({
    boxShadow: `0 -1px 0 0 inset ${theme.palette.divider}`,
    ...(ownerState.wrapperVariant === 'desktop' && {
      order: 1,
      boxShadow: `0 1px 0 0 inset ${theme.palette.divider}`,
      [`& .${tabsClasses.indicator}`]: {
        bottom: 'auto',
        top: 0,
      },
    }),
  }),
);

/**
 * @ignore - internal component.
 */
export const DateTimePickerTabs = (props: DateTimePickerTabsProps) => {
  const { dateRangeIcon = <DateRange />, onChange, timeIcon = <Time />, view } = props;

  const wrapperVariant = React.useContext(WrapperVariantContext);
  const ownerState = { ...props, wrapperVariant };

  const handleChange = (event: React.SyntheticEvent, value: TabValue) => {
    onChange(tabToView(value));
  };

  return (
    <DateTimePickerTabsRoot
      ownerState={ownerState}
      variant="fullWidth"
      value={viewToTab(view)}
      onChange={handleChange}
    >
      <Tab
        value="date"
        aria-label="pick date"
        icon={<React.Fragment>{dateRangeIcon}</React.Fragment>}
      />
      <Tab value="time" aria-label="pick time" icon={<React.Fragment>{timeIcon}</React.Fragment>} />
    </DateTimePickerTabsRoot>
  );
};
