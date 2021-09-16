import * as React from 'react';
import { DataGridPro, GridColumns, DataGridProProps } from '@mui/x-data-grid-pro';
import { Meta } from '@storybook/react';
import Button from '@mui/material/Button';

export default {
  title: 'X-Grid Tests/Tree Data',
  component: DataGridPro,
  parameters: {
    options: { selectedPanel: 'storybook/storysource/panel' },
  },
} as Meta;

const rows = [
  { id: 0, name: 'A' },
  { id: 1, name: 'A.A' },
  { id: 2, name: 'B' },
  { id: 3, name: 'B.A' },
  { id: 4, name: 'B.B' },
  { id: 5, name: 'B.B.A' },
  { id: 6, name: 'C' },
];

const columns: GridColumns = [
  {
    field: 'id',
  },
  {
    field: 'name',
    width: 200,
  },
];

const getTreeDataPath = (row) => row.name.split('.');

export function BasicTreeData() {
  const [treeDataEnabled, setTreeDataEnabled] = React.useState(true);

  return (
    <React.Fragment>
      <Button
        onClick={() => setTreeDataEnabled((prev) => !prev)}
        sx={{
          my: 2,
        }}
      >
        {treeDataEnabled ? 'Disable tree data' : 'Enable tree data'}
      </Button>
      <DataGridPro
        rows={rows}
        columns={columns}
        treeData={treeDataEnabled}
        getTreeDataPath={getTreeDataPath}
      />
    </React.Fragment>
  );
}

export function CustomGroupingColumn() {
    const groupingColDef = React.useMemo<DataGridProProps['groupingColDef']>(() => ({
        headerName: 'Custom header'
    }), [])

    return (
        <DataGridPro
            rows={rows}
            columns={columns}
            treeData
            getTreeDataPath={getTreeDataPath}
            groupingColDef={groupingColDef}
        />
    )
}

export function TreeDataWithCheckboxSelection() {
    return (
        <DataGridPro
            rows={rows}
            columns={columns}
            treeData
            getTreeDataPath={getTreeDataPath}
            checkboxSelection
            disableSelectionOnClick
        />
    )
}