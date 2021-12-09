import * as React from 'react';
import {
  DataGridPro,
  GridApiRef,
  GridColumns,
  GridEvents,
  GridGroupingColumnsModel,
  useGridApiRef,
} from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';
import Stack from '@mui/material/Stack';
import { InputLabel, Select } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

const INITIAL_GROUPING_COLUMN_MODEL = ['company', 'director'];

const useKeepGroupingColumnsHidden = (
  apiRef: GridApiRef,
  columns: GridColumns,
  initialModel: GridGroupingColumnsModel,
  leafField?: string,
) => {
  const prevModel = React.useRef(initialModel);

  React.useEffect(() => {
    apiRef.current.subscribeEvent(
      GridEvents.groupingColumnsModelChange,
      (newModel) => {
        apiRef.current.updateColumns([
          ...newModel
            .filter((field) => !prevModel.current.includes(field))
            .map((field) => ({ field, hide: true })),
          ...prevModel.current
            .filter((field) => !newModel.includes(field))
            .map((field) => ({ field, hide: false })),
        ]);
        prevModel.current = initialModel;
      },
    );
  }, [apiRef, initialModel]);

  return React.useMemo(
    () =>
      columns.map((colDef) =>
        initialModel.includes(colDef.field) ||
        (leafField && colDef.field === leafField)
          ? { ...colDef, hide: true }
          : colDef,
      ),
    [columns, initialModel, leafField],
  );
};

export default function GroupingColumnsSortingSingleGroupingColDef() {
  const data = useMovieData();
  const [mainGroupingCriteria, setMainGroupingCriteria] =
    React.useState<string>('undefined');

  const apiRef = useGridApiRef();

  const columns = useKeepGroupingColumnsHidden(
    apiRef,
    data.columns,
    INITIAL_GROUPING_COLUMN_MODEL,
  );

  return (
    <Stack style={{ width: '100%' }} alignItems="flex-start" spacing={2}>
      <FormControl fullWidth>
        <InputLabel
          htmlFor="main-grouping-criteria"
          id="ain-grouping-criteria-label"
        >
          Main Grouping Criteria
        </InputLabel>
        <Select
          label="Main Grouping Criteria"
          onChange={(e) => setMainGroupingCriteria(e.target.value)}
          value={mainGroupingCriteria}
          id="main-grouping-criteria"
          labelId="main-grouping-criteria-label"
        >
          <MenuItem value="undefined">Default behavior</MenuItem>
          <MenuItem value="company">Company</MenuItem>
          <MenuItem value="director">Director</MenuItem>
        </Select>
      </FormControl>
      <div style={{ height: 400, width: '100%' }}>
        <DataGridPro
          {...data}
          apiRef={apiRef}
          columns={columns}
          disableSelectionOnClick
          defaultGroupingExpansionDepth={-1}
          initialState={{
            groupingColumns: {
              model: INITIAL_GROUPING_COLUMN_MODEL,
            },
          }}
          groupingColumnMode="single"
          groupingColDef={{
            mainGroupingCriteria:
              mainGroupingCriteria === 'undefined'
                ? undefined
                : mainGroupingCriteria,
          }}
          experimentalFeatures={{
            groupingColumns: true,
          }}
        />
      </div>
    </Stack>
  );
}
