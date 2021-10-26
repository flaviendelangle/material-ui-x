import * as React from 'react';
import { GridApiRef } from '../../../models/api/gridApiRef';
import { GridComponentProps } from '../../../GridComponentProps';
import { GridColumnsPreProcessing } from '../../core/columnsPreProcessing';
import { GRID_TREE_DATA_GROUP_COL_DEF } from './gridTreeDataGroupColDef';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import { GridEvents } from '../../../constants';
import { GridCellParams, GridColDef, GridColDefOverrideParams, MuiEvent } from '../../../models';
import { isSpaceKey } from '../../../utils/keyboardUtils';
import { useFirstRender } from '../../utils/useFirstRender';
import { buildRowTree } from '../../../utils/rowTreeUtils';
import { GridRowGroupingPreProcessing } from '../../core/rowGroupsPerProcessing';
import { isFunction } from '../../../utils/utils';

/**
 * Only available in DataGridPro
 * @requires useGridColumnsPreProcessing (method)
 * @requires useGridRowGroupsPreProcessing (method)
 */
export const useGridTreeData = (
  apiRef: GridApiRef,
  props: Pick<
    GridComponentProps,
    'treeData' | 'getTreeDataPath' | 'groupingColDef' | 'defaultGroupingExpansionDepth'
  >,
) => {
  const groupingColDef = React.useMemo<GridColDef>(() => {
    const propGroupingColDef = props.groupingColDef;

    const baseColDef: GridColDef = {
      ...GRID_TREE_DATA_GROUP_COL_DEF,
      headerName: apiRef.current.getLocaleText('treeDataGroupingHeaderName'),
    };
    let colDefOverride: Partial<GridColDef>;

    if (isFunction(propGroupingColDef)) {
      const params: GridColDefOverrideParams = {
        colDef: baseColDef,
        sources: [],
      };

      colDefOverride = propGroupingColDef(params);
    } else {
      colDefOverride = propGroupingColDef ?? {};
    }

    return {
      ...baseColDef,
      ...colDefOverride,
    };
  }, [apiRef, props.groupingColDef]);

  const updateColumnsPreProcessing = React.useCallback(() => {
    const addGroupingColumn: GridColumnsPreProcessing = (columnsState) => {
      const shouldHaveGroupingColumn = props.treeData;
      const haveGroupingColumn = columnsState.lookup[groupingColDef.field] != null;

      if (shouldHaveGroupingColumn && !haveGroupingColumn) {
        columnsState.lookup[groupingColDef.field] = groupingColDef;
        const index = columnsState.lookup[columnsState.all[0]].type === 'checkboxSelection' ? 1 : 0;
        columnsState.all = [
          ...columnsState.all.slice(0, index),
          groupingColDef.field,
          ...columnsState.all.slice(index),
        ];
      } else if (!shouldHaveGroupingColumn && haveGroupingColumn) {
        delete columnsState.lookup[groupingColDef.field];
        columnsState.all = columnsState.all.filter((field) => field !== groupingColDef.field);
      }

      return columnsState;
    };

    apiRef.current.unstable_registerColumnPreProcessing('treeData', addGroupingColumn);
  }, [apiRef, props.treeData, groupingColDef]);

  const updateRowGrouping = React.useCallback(() => {
    if (!props.treeData) {
      return apiRef.current.unstable_registerRowGroupsBuilder('treeData', null);
    }

    const groupRows: GridRowGroupingPreProcessing = (params) => {
      if (!props.getTreeDataPath) {
        throw new Error('MUI: No getTreeDataPath given.');
      }

      const rows = params.ids
        .map((rowId) => ({
          id: rowId,
          path: props.getTreeDataPath!(params.idRowsLookup[rowId]),
        }))
        .sort((a, b) => a.path.length - b.path.length);

      return buildRowTree({
        rows,
        ...params,
        defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
      });
    };

    return apiRef.current.unstable_registerRowGroupsBuilder('treeData', groupRows);
  }, [apiRef, props.getTreeDataPath, props.treeData, props.defaultGroupingExpansionDepth]);

  useFirstRender(() => {
    updateColumnsPreProcessing();
    updateRowGrouping();
  });

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      return;
    }

    updateColumnsPreProcessing();
  }, [updateColumnsPreProcessing]);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    updateRowGrouping();
  }, [updateRowGrouping]);

  const handleCellKeyDown = React.useCallback(
    (params: GridCellParams, event: MuiEvent<React.KeyboardEvent>) => {
      const cellParams = apiRef.current.getCellParams(params.id, params.field);
      if (cellParams.colDef.type === 'treeDataGroup' && isSpaceKey(event.key)) {
        event.stopPropagation();
        event.preventDefault();

        const node = apiRef.current.unstable_getRowNode(params.id);
        if (!node?.descendantCount) {
          return;
        }

        apiRef.current.unstable_setRowExpansion(params.id, !node.expanded);
      }
    },
    [apiRef],
  );

  useGridApiEventHandler(apiRef, GridEvents.cellKeyDown, handleCellKeyDown);
};
