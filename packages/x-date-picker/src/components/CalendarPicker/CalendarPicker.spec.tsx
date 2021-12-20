import * as React from 'react';
import moment, { Moment } from 'moment';
import { CalendarPicker } from '@mui/x-date-picker';

// External components are generic as well
<CalendarPicker<Moment>
  view="day"
  views={['day']}
  date={moment()}
  minDate={moment()}
  maxDate={moment()}
  onChange={(date) => date?.format()}
/>;
