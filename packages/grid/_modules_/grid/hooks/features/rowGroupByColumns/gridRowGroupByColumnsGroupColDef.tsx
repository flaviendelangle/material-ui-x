import { GridColDef } from '../../../models/colDef/gridColDef';
import { GRID_STRING_COL_DEF } from '../../../models/colDef/gridStringColDef';

export const GRID_ROW_GROUP_BY_COLUMNS_GROUP_COL_DEF: Omit<GridColDef, 'field'> = {
  ...GRID_STRING_COL_DEF,
  type: 'rowGroupByColumnsGroup',
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  disableReorder: true,
  shouldRenderAutoGeneratedRows: true,
  align: 'left',
  width: 200,
};
