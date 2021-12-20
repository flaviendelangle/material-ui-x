import * as React from 'react';
import TextField from '@mui/material/TextField';
import { describeConformance } from '@material-ui/monorepo/test/utils';
import { StaticTimePicker } from './StaticTimePicker';
import { wrapPickerMount } from '../../utils/test-utils';

describe('<StaticTimePicker />', () => {
  describeConformance(
    <StaticTimePicker
      onChange={() => {}}
      renderInput={(props) => <TextField {...props} />}
      value={null}
    />,
    () => ({
      classes: {},
      muiName: 'MuiStaticTimePicker',
      wrapMount: wrapPickerMount,
      refInstanceof: undefined,
      skip: [
        'componentProp',
        'componentsProp',
        'themeDefaultProps',
        'themeStyleOverrides',
        'themeVariants',
        'mergeClassName',
        'propsSpread',
        // TODO: `ref` is typed but has no effect
        'refForwarding',
        'rootClass',
        'reactTestRenderer',
      ],
    }),
  );
});
