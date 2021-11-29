import * as React from 'react';
import {
  DataGridPro,
  GridColumns,
  GridKeyGetterParams,
  GridRenderCellParams,
} from '@mui/x-data-grid-pro';
import { useMovieRows } from '@mui/x-data-grid-generator';

const columns: GridColumns = [
  { field: 'title', headerName: 'Title' },
  {
    field: 'gross',
    headerName: 'Gross',
    type: 'number',
  },
  {
    field: 'company',
    headerName: 'Company',
    hide: true,
  },
  {
    field: 'director',
    headerName: 'Director',
    hide: true,
  },
  {
    field: 'composer',
    headerName: 'Composer',
    renderCell: (params: GridRenderCellParams<{ name: string } | undefined>) =>
      params.value?.name,
    keyGetter: (params: GridKeyGetterParams<{ name: string }>) => params.value.name,
  },
  {
    field: 'year',
    headerName: 'Year',
  },
];

const getRowId = (row) => row.title;

export default function SingleGroupingColumn() {
  const rows = useMovieRows();

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        groupingColumnMode="multiple"
        groupingColumnsPanel
        initialState={{
          groupingColumns: {
            model: ['company', 'director'],
          },
        }}
      />
    </div>
  );
}
