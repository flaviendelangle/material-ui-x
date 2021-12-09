import * as React from 'react';
import { DataGridPro, GridEvents, useGridApiRef } from '@mui/x-data-grid-pro';
import { useMovieData } from '@mui/x-data-grid-generator';

const INITIAL_GROUPING_COLUMN_MODEL = ['decade'];

const useKeepGroupingColumnsHidden = (apiRef, columns, initialModel, leafField) => {
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

export default function GroupingColumnsKeyGetter() {
  const data = useMovieData();
  const apiRef = useGridApiRef();

  const columnsWithDecade = React.useMemo(
    () => [
      ...data.columns,
      {
        field: 'decade',
        headerName: 'Decade',
        valueGetter: (params) => {
          const value = Math.floor(params.row.year / 10) * 10;

          if (params.row.year == null) {
            return null;
          }

          return {
            value,
            name: `${value.toString().slice(-2)}'s`,
          };
        },
        keyGetter: (params) => params.value?.value,
        renderCell: (params) => params.value?.name,
      },
    ],
    [data.columns],
  );

  const columns = useKeepGroupingColumnsHidden(
    apiRef,
    columnsWithDecade,
    INITIAL_GROUPING_COLUMN_MODEL,
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGridPro
        {...data}
        apiRef={apiRef}
        columns={columns}
        initialState={{
          groupingColumns: {
            model: INITIAL_GROUPING_COLUMN_MODEL,
          },
        }}
        experimentalFeatures={{
          groupingColumns: true,
        }}
      />
    </div>
  );
}
