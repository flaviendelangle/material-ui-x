import * as React from 'react';
import TextField from '@mui/material/TextField';
import { expect } from 'chai';
import { spy } from 'sinon';
import { fireEvent, screen } from '@material-ui/monorepo/test/utils';
import { StaticDateTimePicker } from '@mui/x-date-picker';
import { adapterToUse, createPickerRenderer } from '../../utils/test-utils';

describe('<StaticDateTimePicker />', () => {
  const { render } = createPickerRenderer({ clock: 'fake' });

  it('allows to select the same day and move to the next view', () => {
    const onChangeMock = spy();
    render(
      <StaticDateTimePicker
        onChange={onChangeMock}
        renderInput={(params) => <TextField {...params} />}
        value={adapterToUse.date('2018-01-01T00:00:00.000')}
      />,
    );

    fireEvent.click(screen.getByLabelText('Jan 1, 2018'));
    expect(onChangeMock.callCount).to.equal(1);

    expect(screen.getByLabelText(/Selected time/))
      // @ts-expect-error need to migrate helpers to TypeScript
      .toBeVisible();
  });
});
