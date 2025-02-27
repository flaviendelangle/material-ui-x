import * as React from 'react';
import dayjs from 'dayjs';
// eslint-disable-next-line no-restricted-imports
import { Clock } from '@mui/x-date-pickers/internals/base/Clock';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import styles from './clock.module.css';

export default function HourWithMeridiemMinuteSecondDemo() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Clock.Root
        defaultValue={dayjs('2022-04-17T15:30:00')}
        className={styles.Root}
      >
        <Clock.Hour12Options render={<OptionList />}>
          {({ items }) =>
            items.map((item) => (
              <Clock.Option
                key={item.toString()}
                value={item}
                className={styles.Option}
              />
            ))
          }
        </Clock.Hour12Options>
        <Clock.MinuteOptions render={<OptionList />}>
          {({ items }) =>
            items.map((item) => (
              <Clock.Option
                key={item.toString()}
                value={item}
                className={styles.Option}
              />
            ))
          }
        </Clock.MinuteOptions>
        <Clock.SecondOptions render={<OptionList />}>
          {({ items }) =>
            items.map((item) => (
              <Clock.Option
                key={item.toString()}
                value={item}
                className={styles.Option}
              />
            ))
          }
        </Clock.SecondOptions>
        <Clock.MeridiemOptions render={<OptionList />}>
          {({ items }) =>
            items.map((item) => (
              <Clock.Option
                key={item.toString()}
                value={item}
                className={styles.Option}
              />
            ))
          }
        </Clock.MeridiemOptions>
      </Clock.Root>
    </LocalizationProvider>
  );
}

function OptionList(props) {
  const { children, ...other } = props;

  return (
    <div className={styles.OptionListWrapper} {...other}>
      <div className={styles.OptionListContent}>{children}</div>
    </div>
  );
}
