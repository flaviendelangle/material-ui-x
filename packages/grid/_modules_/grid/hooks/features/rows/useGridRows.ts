import * as React from 'react';
import { GridEvents } from '../../../constants/eventsConstants';
import { GridComponentProps } from '../../../GridComponentProps';
import { GridApiRef } from '../../../models/api/gridApiRef';
import { GridRowApi } from '../../../models/api/gridRowApi';
import {
  checkGridRowIdIsValid,
  GridRowModel,
  GridRowId,
  GridRowsProp,
  GridRowIdGetter,
  GridRowData,
  GridRowIdTreeNode,
  GridRowGroupingResult,
  GridRowIdTree,
} from '../../../models/gridRows';
import { useGridApiMethod } from '../../root/useGridApiMethod';
import { useGridLogger } from '../../utils/useGridLogger';
import { useGridState } from '../core/useGridState';
import { GridRowsState } from './gridRowsState';
import {
  gridRowCountSelector,
  gridRowsLookupSelector,
  gridRowTreeSelector,
  gridRowIdsFlatSelector,
} from './gridRowsSelector';

export type GridRowsInternalCacheState = Omit<GridRowsState, 'tree' | 'paths'> & {
  rowIds: GridRowId[];
};

export interface GridRowsInternalCache {
  state: GridRowsInternalCacheState;
  timeout: NodeJS.Timeout | null;
  lastUpdateMs: number | null;
}

function getGridRowId(
  rowData: GridRowData,
  getRowId?: GridRowIdGetter,
  detailErrorMessage?: string,
): GridRowId {
  const id = getRowId ? getRowId(rowData) : rowData.id;
  checkGridRowIdIsValid(id, rowData, detailErrorMessage);
  return id;
}

export function convertGridRowsPropToState(
  rows: GridRowsProp,
  propRowCount?: number,
  rowIdGetter?: GridRowIdGetter,
): GridRowsInternalCacheState {
  const state: GridRowsInternalCacheState = {
    idRowsLookup: {},
    rowIds: [],
    totalRowCount: propRowCount && propRowCount > rows.length ? propRowCount : rows.length,
  };

  rows.forEach((rowData) => {
    const id = getGridRowId(rowData, rowIdGetter);
    state.idRowsLookup[id] = rowData;
    state.rowIds.push(id);
  });

  return state;
}

const getFlatRowTree = (rowIds: GridRowId[]): GridRowGroupingResult => ({
  tree: new Map<string, GridRowIdTreeNode>(
    rowIds.map((id) => [id.toString(), { id, children: new Map() }]),
  ),
  paths: Object.fromEntries(rowIds.map((id) => [id, [id.toString()]])),
});

const setRowExpansionInTree = (
  id: GridRowId,
  tree: GridRowIdTree,
  path: string[],
  isExpanded: boolean,
) => {
  if (path.length === 0) {
    throw new Error(`Material-UI: Invalid path for row #${id}.`);
  }

  const clonedMap = new Map(tree.entries());
  const [nodeName, ...restPath] = path;
  const nodeBefore = clonedMap.get(nodeName);

  if (!nodeBefore) {
    throw new Error(`Material-UI: Invalid path for row #${id}.`);
  }

  if (restPath.length === 0) {
    clonedMap.set(nodeName, { ...nodeBefore, expanded: isExpanded });
  } else {
    clonedMap.set(nodeName, {
      ...nodeBefore,
      expanded: nodeBefore.expanded || isExpanded,
      children: setRowExpansionInTree(id, nodeBefore.children, restPath, isExpanded),
    });
  }

  return clonedMap;
};

/**
 * @requires useGridSorting (method)
 * TODO: Impossible priority - useGridSorting also needs to be after useGridRows (which causes all the existence check for apiRef.current.apiRef.current.getSortedRowIds)
 */
export const useGridRows = (
  apiRef: GridApiRef,
  props: Pick<GridComponentProps, 'rows' | 'getRowId' | 'rowCount' | 'throttleRowsMs'>,
): void => {
  const logger = useGridLogger(apiRef, 'useGridRows');
  const [, setGridState, forceUpdate] = useGridState(apiRef);

  const rowsCache = React.useRef<GridRowsInternalCache>({
    state: {
      idRowsLookup: {},
      totalRowCount: 0,
      rowIds: [],
    },
    timeout: null,
    lastUpdateMs: null,
  });

  const getRowIndex = React.useCallback<GridRowApi['getRowIndex']>(
    (id) => {
      if (apiRef.current.getFlatSortedRowIds) {
        return apiRef.current.getFlatSortedRowIds().indexOf(id);
      }

      // TODO: Remove, getFlatSortedRowIds should always be defined
      return gridRowIdsFlatSelector(apiRef.current.state).indexOf(id);
    },
    [apiRef],
  );

  const getRowIdFromRowIndex = React.useCallback<GridRowApi['getRowIdFromRowIndex']>(
    (index) => {
      if (apiRef.current.getFlatSortedRowIds) {
        return apiRef.current.getFlatSortedRowIds()[index];
      }

      // TODO: Remove, getFlatSortedRowIds should always be defined
      return gridRowIdsFlatSelector(apiRef.current.state)[index];
    },
    [apiRef],
  );

  const getRow = React.useCallback<GridRowApi['getRow']>(
    (id) => gridRowsLookupSelector(apiRef.current.state)[id] ?? null,
    [apiRef],
  );

  const throttledRowsChange = React.useCallback(
    (newState: GridRowsInternalCacheState, throttle: boolean) => {
      const run = () => {
        rowsCache.current.timeout = null;
        rowsCache.current.lastUpdateMs = Date.now();
        const { rowIds, ...rowState } = rowsCache.current.state;
        const { tree, paths } = apiRef.current.groupRows
          ? apiRef.current.groupRows(rowState.idRowsLookup, rowIds)
          : getFlatRowTree(rowIds);
        setGridState((state) => ({ ...state, rows: { ...rowState, tree, paths } }));
        apiRef.current.publishEvent(GridEvents.rowsSet);
        forceUpdate();
      };

      if (rowsCache.current.timeout) {
        clearTimeout(rowsCache.current.timeout);
      }

      rowsCache.current.state = newState;
      rowsCache.current.timeout = null;

      if (!throttle) {
        run();
        return;
      }

      const throttleRemainingTimeMs =
        rowsCache.current.lastUpdateMs === null
          ? 0
          : props.throttleRowsMs - (Date.now() - rowsCache.current.lastUpdateMs);

      if (throttleRemainingTimeMs > 0) {
        rowsCache.current.timeout = setTimeout(run, throttleRemainingTimeMs);
        return;
      }

      run();
    },
    [apiRef, forceUpdate, setGridState, rowsCache, props.throttleRowsMs],
  );

  const setRows = React.useCallback<GridRowApi['setRows']>(
    (rows) => {
      logger.debug(`Updating all rows, new length ${rows.length}`);
      throttledRowsChange(convertGridRowsPropToState(rows, props.rowCount, props.getRowId), true);
    },
    [logger, throttledRowsChange, props.rowCount, props.getRowId],
  );

  const updateRows = React.useCallback<GridRowApi['updateRows']>(
    (updates) => {
      // we removes duplicate updates. A server can batch updates, and send several updates for the same row in one fn call.
      const uniqUpdates = new Map<GridRowId, GridRowModel>();

      updates.forEach((update) => {
        const id = getGridRowId(
          update,
          props.getRowId,
          'A row was provided without id when calling updateRows():',
        );

        if (uniqUpdates.has(id)) {
          uniqUpdates.set(id, { ...uniqUpdates.get(id), ...update });
        } else {
          uniqUpdates.set(id, update);
        }
      });

      const deletedRowIds: GridRowId[] = [];

      const idRowsLookup = { ...rowsCache.current.state.idRowsLookup };
      let rowIds = [...rowsCache.current.state.rowIds];

      uniqUpdates.forEach((partialRow, id) => {
        // eslint-disable-next-line no-underscore-dangle
        if (partialRow._action === 'delete') {
          delete idRowsLookup[id];
          deletedRowIds.push(id);
          return;
        }

        const oldRow = apiRef.current.getRow(id);
        if (!oldRow) {
          idRowsLookup[id] = partialRow;
          rowIds.push(id);
          return;
        }

        idRowsLookup[id] = { ...apiRef.current.getRow(id), ...partialRow };
      });

      if (deletedRowIds.length > 0) {
        rowIds = rowIds.filter((id) => !deletedRowIds.includes(id));
      }

      const totalRowCount =
        props.rowCount && props.rowCount > rowIds.length ? props.rowCount : rowIds.length;

      const state: GridRowsInternalCacheState = {
        idRowsLookup,
        rowIds,
        totalRowCount,
      };

      throttledRowsChange(state, true);
    },
    [apiRef, props.getRowId, props.rowCount, throttledRowsChange],
  );

  const getRowModels = React.useCallback<GridRowApi['getRowModels']>(
    () => gridRowTreeSelector(apiRef.current.state),
    [apiRef],
  );

  const getRowsCount = React.useCallback<GridRowApi['getRowsCount']>(
    () => gridRowCountSelector(apiRef.current.state),
    [apiRef],
  );

  const getAllRowIds = React.useCallback<GridRowApi['getAllRowIds']>(
    () => gridRowIdsFlatSelector(apiRef.current.state),
    [apiRef],
  );

  const setRowExpansion = React.useCallback<GridRowApi['setRowExpansion']>(
    (id, isExpanded) => {
      setGridState((state) => {
        const path = state.rows.paths[id];

        return {
          ...state,
          rows: {
            ...state.rows,
            tree: setRowExpansionInTree(id, state.rows.tree, path, isExpanded),
          },
        };
      });
      forceUpdate();
      apiRef.current.publishEvent(GridEvents.rowsSet);
    },
    [apiRef, setGridState, forceUpdate],
  );

  const isRowExpanded = React.useCallback<GridRowApi['isRowExpanded']>(
    (id) => {
      const getNodeFromTree = (tree: GridRowIdTree, path: string[]): GridRowIdTreeNode => {
        if (path.length === 0) {
          throw new Error(`Material-UI: No row with id #${id} found in row tree`);
        }

        const [nodeName, ...restPath] = path;
        const node = tree.get(nodeName);

        if (!node) {
          throw new Error(`Material-UI: No row with id #${id} found in row tree`);
        }

        if (restPath.length === 0) {
          return node;
        }

        return getNodeFromTree(node.children, restPath);
      };

      const path = apiRef.current.state.rows.paths[id];

      if (!path) {
        throw new Error(`Material-UI: No row with id #${id} found in row path list`);
      }

      const node = getNodeFromTree(apiRef.current.getRowModels(), path);

      return !!node.expanded;
    },
    [apiRef],
  );

  React.useEffect(() => {
    return () => {
      if (rowsCache.current.timeout !== null) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(rowsCache.current.timeout);
      }
    };
  }, []);

  React.useEffect(() => {
    logger.debug(`Updating all rows, new length ${props.rows.length}`);
    throttledRowsChange(
      convertGridRowsPropToState(props.rows, props.rowCount, props.getRowId),
      false,
    );
  }, [props.rows, props.rowCount, props.getRowId, logger, throttledRowsChange]);

  const rowApi: GridRowApi = {
    getRowIndex,
    getRowIdFromRowIndex,
    getRow,
    getRowModels,
    getRowsCount,
    getAllRowIds,
    setRows,
    updateRows,
    setRowExpansion,
    isRowExpanded,
  };

  useGridApiMethod(apiRef, rowApi, 'GridRowApi');
};
