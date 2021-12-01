import * as React from 'react';
import {
  GRID_STRING_COL_DEF,
  GridApiRef,
  GridColDef,
  GridGroupingColDefOverride,
  GridRenderCellParams,
  GridStateColDef,
  GridValueGetterFullParams,
} from '../../../models';
import { GridColumnRawLookup } from '../columns/gridColumnsState';
import { GridGroupingColumnGroupCell } from '../../../components/cell/GridGroupingColumnGroupCell';
import { GridGroupingColumnLeafCell } from '../../../components/cell/GridGroupingColumnLeafCell';
import { getCellValue, getGroupingColDefField } from './gridGroupingColumnsUtils';
import { gridColumnLookupSelector } from '../columns';

const GROUPING_COL_DEF_DEFAULT_VALUES: Partial<GridColDef> = {
  ...GRID_STRING_COL_DEF,
  type: 'rowGroupByColumnsGroup',
  disableReorder: true,
  hide: false,
  align: 'left',
  headerAlign: 'left',
};

const getLeafProperties = (leafColDef: GridColDef): Partial<GridColDef> => ({
  headerName: leafColDef.headerName ?? leafColDef.field,
  sortable: leafColDef.sortable,
  filterable: leafColDef.filterable,
  filterOperators: leafColDef.filterOperators?.map((operator) => ({
    ...operator,
    getApplyFilterFn: (filterItem, column) => {
      const originalFn = operator.getApplyFilterFn(filterItem, column);
      if (!originalFn) {
        return null;
      }

      return (params) => {
        // We only want to filter leaves
        if (params.rowNode.groupingField != null) {
          return true;
        }

        return originalFn(params);
      };
    },
  })),
  // We only want to sort leaves
  // TODO: Handle unbalanced object sorting with two non-null groups of same depth but different field (should sort by the depth of the field in the model).
  sortComparator: (v1, v2, cellParams1, cellParams2) => {
    const groupingField1 = cellParams1.rowNode.groupingField;
    const groupingField2 = cellParams2.rowNode.groupingField;

    if (groupingField1 == null && groupingField2 == null) {
      return leafColDef.sortComparator!(v1, v2, cellParams1, cellParams2);
    }

    if (groupingField1 == null) {
      return 1;
    }

    if (groupingField2 == null) {
      return -1;
    }

    return 0;
  },
});

const getGroupingCriteriaProperties = (groupedByColDef: GridColDef, applyHeaderName: boolean) => {
  const properties: Partial<GridColDef> = {
    sortable: groupedByColDef.sortable,
    filterable: groupedByColDef.filterable,
    sortComparator: (v1, v2, cellParams1, cellParams2) => {
      // We only want to sort the groups of the current grouping criteria
      if (cellParams1.rowNode.groupingField !== groupedByColDef.field) {
        return 0;
      }

      return groupedByColDef.sortComparator!(v1, v2, cellParams1, cellParams2);
    },
    filterOperators: groupedByColDef.filterOperators?.map((operator) => ({
      ...operator,
      getApplyFilterFn: (filterItem, column) => {
        const originalFn = operator.getApplyFilterFn(filterItem, column);
        if (!originalFn) {
          return null;
        }

        return (params) => {
          // We only want to filter the groups of the current grouping criteria
          if (params.rowNode.groupingField !== groupedByColDef.field) {
            return true;
          }

          return originalFn(params);
        };
      },
    })),
  };

  if (applyHeaderName) {
    properties.headerName = groupedByColDef.headerName ?? groupedByColDef.field;
  }

  return properties;
};

interface CreateGroupingColDefMonoCriteriaParams {
  columnsLookup: GridColumnRawLookup;

  /**
   * The field from which we are grouping the rows
   */
  groupedByField: string;

  /**
   * The col def from which we are grouping the rows
   */
  groupedByColDef: GridColDef | GridStateColDef;

  /**
   * The col def properties the user wants to override.
   * This value comes prop `prop.groupingColDef`
   */
  colDefOverride: GridGroupingColDefOverride;
}

/**
 * Creates the `GridColDef` for a grouping column that only takes care of a single grouping criteria
 */
export const createGroupingColDefForOneGroupingCriteria = ({
  columnsLookup,
  groupedByColDef,
  groupedByField,
  colDefOverride,
}: CreateGroupingColDefMonoCriteriaParams): GridColDef => {
  const { leafField, mainGroupingCriteria, hideDescendantCount, ...colDefOverrideProperties } =
    colDefOverride;
  const leafColDef = leafField ? columnsLookup[leafField] : null;

  // The properties that do not depend on the presence of a `leafColDef` and that can be overridden by `colDefOverride`
  const commonProperties: Partial<GridColDef> = {
    width: Math.max(
      (groupedByColDef.width ?? GRID_STRING_COL_DEF.width!) + 40,
      leafColDef?.width ?? 0,
    ),
    renderCell: (params: GridRenderCellParams) => {
      if (params.rowNode.groupingField == null) {
        if (leafColDef) {
          if (leafColDef.renderCell) {
            // We get the colDef from the state to have the preprocessed version with the `computedWidth`
            const leafStateColDef = gridColumnLookupSelector(params.api.state)[leafColDef.field];
            return leafColDef.renderCell({ ...params, colDef: leafStateColDef, field: leafField! });
          }

          return <GridGroupingColumnLeafCell {...params} />;
        }

        return null;
      }

      if (params.rowNode.groupingField === groupedByField) {
        return (
          <GridGroupingColumnGroupCell {...params} hideDescendantCount={hideDescendantCount} />
        );
      }

      return null;
    },
    valueGetter: (params) => {
      const fullParams = params as GridValueGetterFullParams;
      if (!fullParams.rowNode) {
        return undefined;
      }

      if (fullParams.rowNode.groupingField === groupedByField) {
        return fullParams.rowNode.groupingKey;
      }

      if (fullParams.rowNode.groupingField == null && leafColDef) {
        return getCellValue({
          id: params.id,
          row: params.row,
          colDef: leafColDef,
          isAutoGenerated: params.rowNode.isAutoGenerated,
        });
      }

      return undefined;
    },
  };

  // If we have a `mainGroupingCriteria` defined and matching the `groupedByField`
  // Then we apply the sorting / filtering on the groups of this column's grouping criteria based on the properties of `groupedByColDef`.
  // It can be useful to define a `leafField` for leaves rendering but still use the grouping criteria for the sorting / filtering
  //
  // If we have a `leafField` defined and matching an existing column
  // Then we apply the sorting / filtering on the leaves based on the properties of `leavesColDef`
  //
  // By default, we apply the sorting / filtering on the groups of this column's grouping criteria based on the properties of `groupedColDef`.
  let sourceProperties: Partial<GridColDef>;
  if (mainGroupingCriteria && mainGroupingCriteria === groupedByField) {
    sourceProperties = getGroupingCriteriaProperties(groupedByColDef, true);
  } else if (leafColDef) {
    sourceProperties = getLeafProperties(leafColDef);
  } else {
    sourceProperties = getGroupingCriteriaProperties(groupedByColDef, true);
  }

  // The properties that can't be overridden with `colDefOverride`
  const forcedProperties: Pick<GridColDef, 'field' | 'editable'> = {
    field: getGroupingColDefField(groupedByField),
    editable: false,
  };

  return {
    ...GROUPING_COL_DEF_DEFAULT_VALUES,
    ...commonProperties,
    ...sourceProperties,
    ...colDefOverrideProperties,
    ...forcedProperties,
  };
};

interface CreateGroupingColDefSeveralCriteriaParams {
  apiRef: GridApiRef;
  columnsLookup: GridColumnRawLookup;

  /**
   * The fields from which we are grouping the rows
   */
  groupingColumnsModel: string[];

  /**
   * The col def properties the user wants to override.
   */
  colDefOverride: GridGroupingColDefOverride;
}

/**
 * Creates the `GridColDef` for a grouping column that takes care of all the grouping criteria
 */
export const createGroupingColDefForAllGroupingCriteria = ({
  apiRef,
  columnsLookup,
  groupingColumnsModel,
  colDefOverride,
}: CreateGroupingColDefSeveralCriteriaParams): GridColDef => {
  const { leafField, mainGroupingCriteria, hideDescendantCount, ...colDefOverrideProperties } =
    colDefOverride;
  const leafColDef = leafField ? columnsLookup[leafField] : null;

  // The properties that do not depend on the presence of a `leafColDef` and that can be overridden by `colDefOverride`
  const commonProperties: Partial<GridColDef> = {
    headerName: apiRef.current.getLocaleText('treeDataGroupingHeaderName'),
    width: Math.max(
      ...groupingColumnsModel.map(
        (field) => (columnsLookup[field].width ?? GRID_STRING_COL_DEF.width!) + 40,
      ),
      leafColDef?.width ?? 0,
    ),
    renderCell: (params) => {
      if (params.rowNode.groupingField == null) {
        if (leafColDef) {
          if (leafColDef.renderCell) {
            // We get the colDef from the state to have the preprocessed version with the `computedWidth`
            const leafStateColDef = gridColumnLookupSelector(params.api.state)[leafColDef.field];
            return leafColDef.renderCell({ ...params, colDef: leafStateColDef, field: leafField! });
          }

          return <GridGroupingColumnLeafCell {...params} />;
        }

        return null;
      }

      return <GridGroupingColumnGroupCell {...params} hideDescendantCount={hideDescendantCount} />;
    },
    valueGetter: (params) => {
      const fullParams = params as GridValueGetterFullParams;
      if (!fullParams.rowNode) {
        return undefined;
      }

      if (fullParams.rowNode.groupingField != null) {
        return fullParams.rowNode.groupingKey;
      }

      if (leafColDef) {
        return getCellValue({
          id: params.id,
          row: params.row,
          colDef: leafColDef,
          isAutoGenerated: params.rowNode.isAutoGenerated,
        });
      }

      return undefined;
    },
  };

  // If we have a `mainGroupingCriteria` defined and matching one of the `orderedGroupedByFields`
  // Then we apply the sorting / filtering on the groups of this column's grouping criteria based on the properties of `columnsLookup[mainGroupingCriteria]`.
  // It can be useful to use another grouping criteria than the top level one for the sorting / filtering
  //
  // If we have a `leafField` defined and matching an existing column
  // Then we apply the sorting / filtering on the leaves based on the properties of `leavesColDef`
  //
  // By default, we apply the sorting / filtering on the groups of the top level grouping criteria based on the properties of `columnsLookup[orderedGroupedByFields[0]]`.
  let sourceProperties: Partial<GridColDef>;
  if (mainGroupingCriteria && groupingColumnsModel.includes(mainGroupingCriteria)) {
    sourceProperties = getGroupingCriteriaProperties(columnsLookup[mainGroupingCriteria], true);
  } else if (leafColDef) {
    sourceProperties = getLeafProperties(leafColDef);
  } else {
    sourceProperties = getGroupingCriteriaProperties(
      columnsLookup[groupingColumnsModel[0]],
      groupingColumnsModel.length === 1,
    );
  }

  // The properties that can't be overridden with `colDefOverride`
  const forcedProperties: Pick<GridColDef, 'field' | 'editable'> = {
    field: getGroupingColDefField(null),
    editable: false,
  };

  return {
    ...GROUPING_COL_DEF_DEFAULT_VALUES,
    ...commonProperties,
    ...sourceProperties,
    ...colDefOverrideProperties,
    ...forcedProperties,
  };
};
