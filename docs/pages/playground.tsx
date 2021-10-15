import * as React from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useDemoTreeData } from '@mui/x-data-grid-generator';

export default function BasicTreeData() {
  const { data, loading } = useDemoTreeData({
    rowLength: [10, 5],
    randomLength: true,
  });

  return (
    <div style={{ height: 300, width: '100%' }}>
      <DataGridPro
        loading={loading}
        treeData
        disableSelectionOnClick
        filterModel={{ items: [{ columnField: 'id', operatorValue: '=', value: 6 }] }}
        {...data}
      />
    </div>
  );
}
