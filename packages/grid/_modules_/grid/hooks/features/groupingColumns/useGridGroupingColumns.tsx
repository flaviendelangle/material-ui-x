import * as React from 'react';
import type {
  GridApiRef,
  GridRowModel,
  GridRowId,
  GridColDef,
  GridKeyValue,
  GridCellValue,
  GridValueGetterSimpleParams,
} from '../../../models';
import { GridEvents, GridEventListener } from '../../../models/events';
import { GridRowGroupingPreProcessing } from '../../core/rowGroupsPerProcessing';
import { useFirstRender } from '../../utils/useFirstRender';
import { buildRowTree, BuildRowTreeGroupingCriteria } from '../../../utils/tree/buildRowTree';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import {
  gridGroupingColumnsModelSelector,
  gridGroupingColumnsSanitizedModelSelector,
} from './gridGroupingColumnsSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import {
  filterRowTreeFromGroupingColumns,
  getGroupingColDefFieldFromGroupingCriteriaField,
  getColDefOverrides,
  GROUPING_COLUMNS_FEATURE_NAME,
  isGroupingColumn,
} from './gridGroupingColumnsUtils';
import {
  createGroupingColDefForOneGroupingCriteria,
  createGroupingColDefForAllGroupingCriteria,
} from './createGroupingColDef';
import { isDeepEqual } from '../../../utils/utils';
import { GridPreProcessingGroup, useGridRegisterPreProcessor } from '../../core/preProcessing';
import { GridColumnsRawState } from '../columns/gridColumnsState';
import { useGridRegisterFilteringMethod } from '../filter/useGridRegisterFilteringMethod';
import { GridFilteringMethod } from '../filter/gridFilterState';
import { gridRowIdsSelector, gridRowTreeSelector } from '../rows';
import { useGridRegisterSortingMethod } from '../sorting/useGridRegisterSortingMethod';
import { GridSortingMethod } from '../sorting/gridSortingState';
import { sortRowTree } from '../../../utils/tree/sortRowTree';
import { gridFilteredDescendantCountLookupSelector } from '../filter';
import { useGridStateInit } from '../../utils/useGridStateInit';
import { GridGroupingColumnsApi, GridGroupingColumnsModel } from './gridGroupingColumnsInterfaces';
import { useGridApiMethod, useGridState } from '../../utils';
import { gridColumnLookupSelector } from '../columns';
import { GridGroupingColumnsMenuItems } from '../../../components/menu/columnMenu/GridGroupingColumnsMenuItems';

/**
 * Only available in DataGridPro
 * @requires useGridColumns (state, method) - can be after, async only
 * @requires useGridRows (state, method) - can be after, async only
 * @requires useGridParamsApi (method) - can be after, async only
 * TODO: Move the the Premium plan once available and remove the `experimentalFeatures.groupingColumns` flag
 */
export const useGridGroupingColumns = (
  apiRef: GridApiRef,
  props: Pick<
    GridComponentProps,
    | 'initialState'
    | 'groupingColumnsModel'
    | 'onGroupingColumnsModelChange'
    | 'defaultGroupingExpansionDepth'
    | 'groupingColDef'
    | 'groupingColumnMode'
    | 'disableGroupingColumns'
  >,
) => {
  useGridStateInit(apiRef, (state) => ({
    ...state,
    groupingColumns: {
      model: props.groupingColumnsModel ?? props.initialState?.groupingColumns?.model ?? [],
    },
  }));

  const [, setGridState, forceUpdate] = useGridState(apiRef);

  apiRef.current.unstable_updateControlState({
    stateId: 'groupingColumns',
    propModel: props.groupingColumnsModel,
    propOnChange: props.onGroupingColumnsModelChange,
    stateSelector: gridGroupingColumnsModelSelector,
    changeEvent: GridEvents.groupingColumnsModelChange,
  });

  /**
   * ROW GROUPING
   */
  // Tracks the model on the last pre-processing to check if we need to re-build the grouping columns when the grid upserts a column.
  const sanitizedModelOnLastRowPreProcessing = React.useRef<GridGroupingColumnsModel>([]);

  const updateRowGrouping = React.useCallback(() => {
    const groupRows: GridRowGroupingPreProcessing = (params) => {
      const groupingColumnsModel = gridGroupingColumnsSanitizedModelSelector(apiRef.current.state);
      const columnsLookup = gridColumnLookupSelector(apiRef.current.state);
      sanitizedModelOnLastRowPreProcessing.current = groupingColumnsModel;

      if (props.disableGroupingColumns || groupingColumnsModel.length === 0) {
        return null;
      }

      const distinctValues: {
        [field: string]: { lookup: { [val: string]: boolean }; list: any[] };
      } = Object.fromEntries(
        groupingColumnsModel.map((groupingField) => [groupingField, { lookup: {}, list: [] }]),
      );

      const getCellGroupingCriteria = ({
        row,
        id,
        colDef,
      }: {
        row: GridRowModel;
        id: GridRowId;
        colDef: GridColDef;
      }) => {
        let value: GridCellValue;
        if (colDef.valueGetter) {
          const valueGetterParams: GridValueGetterSimpleParams = {
            colDef,
            field: colDef.field,
            id,
            row,
            rowNode: {
              isAutoGenerated: false,
              id,
            },
          };
          value = colDef.valueGetter(valueGetterParams);
        } else {
          value = row[colDef.field];
        }

        let key: GridKeyValue | null | undefined;
        if (colDef.keyGetter) {
          key = colDef.keyGetter({
            value,
            id,
            field: colDef.field,
          });
        } else {
          key = value as GridKeyValue;
        }

        return {
          key,
          field: colDef.field,
        };
      };

      params.ids.forEach((rowId) => {
        const row = params.idRowsLookup[rowId];

        groupingColumnsModel.forEach((groupingCriteria) => {
          const { key } = getCellGroupingCriteria({
            row,
            id: rowId,
            colDef: columnsLookup[groupingCriteria],
          });
          const groupingFieldsDistinctKeys = distinctValues[groupingCriteria];

          if (key != null && !groupingFieldsDistinctKeys.lookup[key.toString()]) {
            groupingFieldsDistinctKeys.lookup[key.toString()] = true;
            groupingFieldsDistinctKeys.list.push(key);
          }
        });
      });

      const rows = params.ids.map((rowId) => {
        const row = params.idRowsLookup[rowId];
        const parentPath = groupingColumnsModel
          .map((groupingField) =>
            getCellGroupingCriteria({
              row,
              id: rowId,
              colDef: columnsLookup[groupingField],
            }),
          )
          .filter((cell) => cell.key != null) as BuildRowTreeGroupingCriteria[];

        const leafGroupingCriteria: BuildRowTreeGroupingCriteria = {
          key: rowId.toString(),
          field: null,
        };

        return {
          path: [...parentPath, leafGroupingCriteria],
          id: rowId,
        };
      });

      return buildRowTree({
        ...params,
        rows,
        defaultGroupingExpansionDepth: props.defaultGroupingExpansionDepth,
        groupingName: GROUPING_COLUMNS_FEATURE_NAME,
      });
    };

    return apiRef.current.unstable_registerRowGroupsBuilder('rowGrouping', groupRows);
  }, [apiRef, props.defaultGroupingExpansionDepth, props.disableGroupingColumns]);

  useFirstRender(() => {
    updateRowGrouping();
  });

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    updateRowGrouping();
  }, [updateRowGrouping]);

  /**
   * PRE-PROCESSING
   */
  const getGroupingColDefs = React.useCallback(
    (columnsState: GridColumnsRawState) => {
      if (props.disableGroupingColumns) {
        return [];
      }

      const propGroupingColDef = props.groupingColDef;

      // We can't use `gridGroupingRowsSanitizedModelSelector` here because the new columns are not in the state yet
      const groupingColumnsModel = gridGroupingColumnsModelSelector(apiRef.current.state).filter(
        (field) => !!columnsState.lookup[field],
      );

      if (groupingColumnsModel.length === 0) {
        return [];
      }

      switch (props.groupingColumnMode) {
        case 'single': {
          return [
            createGroupingColDefForAllGroupingCriteria({
              apiRef,
              groupingColumnsModel,
              colDefOverride: getColDefOverrides(propGroupingColDef, groupingColumnsModel),
              columnsLookup: columnsState.lookup,
            }),
          ];
        }

        case 'multiple': {
          return groupingColumnsModel.map((groupingCriteria) =>
            createGroupingColDefForOneGroupingCriteria({
              groupingCriteria,
              colDefOverride: getColDefOverrides(propGroupingColDef, [groupingCriteria]),
              groupedByColDef: columnsState.lookup[groupingCriteria],
              columnsLookup: columnsState.lookup,
            }),
          );
        }

        default: {
          return [];
        }
      }
    },
    [apiRef, props.groupingColDef, props.groupingColumnMode, props.disableGroupingColumns],
  );

  const updateGroupingColumn = React.useCallback(
    (columnsState: GridColumnsRawState) => {
      const groupingColDefs = getGroupingColDefs(columnsState);

      // We remove the grouping columns
      const newColumnFields: string[] = [];
      columnsState.all.forEach((field) => {
        if (isGroupingColumn(field)) {
          delete columnsState.lookup[field];
        } else {
          newColumnFields.push(field);
        }
      });
      columnsState.all = newColumnFields;

      // We add the grouping column
      groupingColDefs.forEach((groupingColDef) => {
        columnsState.lookup[groupingColDef.field] = groupingColDef;
      });
      const startIndex = columnsState.all[0] === '__check__' ? 1 : 0;
      columnsState.all = [
        ...columnsState.all.slice(0, startIndex),
        ...groupingColDefs.map((colDef) => colDef.field),
        ...columnsState.all.slice(startIndex),
      ];

      return columnsState;
    },
    [getGroupingColDefs],
  );

  const addColumnMenuButtons = React.useCallback(
    (initialValue: JSX.Element[]) => {
      if (props.disableGroupingColumns) {
        return initialValue;
      }

      return [...initialValue, <GridGroupingColumnsMenuItems />];
    },
    [props.disableGroupingColumns],
  );

  const filteringMethod = React.useCallback<GridFilteringMethod>(
    (params) => {
      const rowTree = gridRowTreeSelector(apiRef.current.state);

      return filterRowTreeFromGroupingColumns({
        rowTree,
        isRowMatchingFilters: params.isRowMatchingFilters,
      });
    },
    [apiRef],
  );

  const sortingMethod = React.useCallback<GridSortingMethod>(
    (params) => {
      const rowTree = gridRowTreeSelector(apiRef.current.state);
      const rowIds = gridRowIdsSelector(apiRef.current.state);

      return sortRowTree({
        rowTree,
        rowIds,
        sortRowList: params.sortRowList,
        comparatorList: params.comparatorList,
        disableChildrenSorting: false,
      });
    },
    [apiRef],
  );

  useGridRegisterPreProcessor(apiRef, GridPreProcessingGroup.hydrateColumns, updateGroupingColumn);
  useGridRegisterPreProcessor(apiRef, GridPreProcessingGroup.columnMenu, addColumnMenuButtons);
  useGridRegisterFilteringMethod(apiRef, GROUPING_COLUMNS_FEATURE_NAME, filteringMethod);
  useGridRegisterSortingMethod(apiRef, GROUPING_COLUMNS_FEATURE_NAME, sortingMethod);

  /**
   * API METHODS
   */
  const setGroupingColumnsModel = React.useCallback<
    GridGroupingColumnsApi['setGroupingColumnsModel']
  >(
    (model) => {
      const currentModel = gridGroupingColumnsModelSelector(apiRef.current.state);
      if (currentModel !== model) {
        setGridState((state) => ({
          ...state,
          groupingColumns: { ...state.groupingColumns, model },
        }));
        updateRowGrouping();
        forceUpdate();
      }
    },
    [apiRef, setGridState, forceUpdate, updateRowGrouping],
  );

  const addGroupingCriteria = React.useCallback<GridGroupingColumnsApi['addGroupingCriteria']>(
    (field, groupingIndex) => {
      const currentModel = gridGroupingColumnsModelSelector(apiRef.current.state);
      if (currentModel.includes(field)) {
        return;
      }

      const cleanGroupingIndex = groupingIndex ?? currentModel.length;

      const updatedModel = [
        ...currentModel.slice(0, cleanGroupingIndex),
        field,
        ...currentModel.slice(cleanGroupingIndex),
      ];

      apiRef.current.setGroupingColumnsModel(updatedModel);
    },
    [apiRef],
  );

  const removeGroupingCriteria = React.useCallback<
    GridGroupingColumnsApi['removeGroupingCriteria']
  >(
    (field) => {
      const currentModel = gridGroupingColumnsModelSelector(apiRef.current.state);
      if (!currentModel.includes(field)) {
        return;
      }
      apiRef.current.setGroupingColumnsModel(currentModel.filter((el) => el !== field));
    },
    [apiRef],
  );

  const setGroupingCriteriaIndex = React.useCallback<
    GridGroupingColumnsApi['setGroupingCriteriaIndex']
  >(
    (field, targetIndex) => {
      const currentModel = gridGroupingColumnsModelSelector(apiRef.current.state);
      const currentTargetIndex = currentModel.indexOf(field);

      if (currentTargetIndex === -1) {
        return;
      }

      const updatedModel = [...currentModel];
      updatedModel.splice(targetIndex, 0, updatedModel.splice(currentTargetIndex, 1)[0]);

      apiRef.current.setGroupingColumnsModel(updatedModel);
    },
    [apiRef],
  );

  useGridApiMethod<GridGroupingColumnsApi>(
    apiRef,
    {
      setGroupingColumnsModel,
      addGroupingCriteria,
      removeGroupingCriteria,
      setGroupingCriteriaIndex,
    },
    'GridGroupingColumnsApi',
  );

  /**
   * EVENTS
   */
  const handleCellKeyDown = React.useCallback<GridEventListener<GridEvents.cellKeyDown>>(
    (params, event) => {
      const cellParams = apiRef.current.getCellParams(params.id, params.field);
      if (isGroupingColumn(cellParams.field) && event.key === ' ' && !event.shiftKey) {
        event.stopPropagation();
        event.preventDefault();

        const filteredDescendantCount =
          gridFilteredDescendantCountLookupSelector(apiRef.current.state)[params.id] ?? 0;

        const isOnGroupingCell =
          props.groupingColumnMode === 'single' ||
          getGroupingColDefFieldFromGroupingCriteriaField(params.rowNode.groupingField) ===
            params.field;
        if (!isOnGroupingCell || filteredDescendantCount === 0) {
          return;
        }

        apiRef.current.setRowChildrenExpansion(params.id, !params.rowNode.childrenExpanded);
      }
    },
    [apiRef, props.groupingColumnMode],
  );

  const checkGroupingColumnsModelDiff = React.useCallback<
    GridEventListener<GridEvents.columnsChange>
  >(() => {
    const groupingColumnsModel = gridGroupingColumnsSanitizedModelSelector(apiRef.current.state);
    const lastGroupingColumnsModelApplied = sanitizedModelOnLastRowPreProcessing.current;

    if (!isDeepEqual(lastGroupingColumnsModelApplied, groupingColumnsModel)) {
      sanitizedModelOnLastRowPreProcessing.current = groupingColumnsModel;

      // Refresh the column pre-processing
      apiRef.current.updateColumns([]);
      updateRowGrouping();
    }
  }, [apiRef, updateRowGrouping]);

  useGridApiEventHandler(apiRef, GridEvents.cellKeyDown, handleCellKeyDown);
  useGridApiEventHandler(apiRef, GridEvents.columnsChange, checkGroupingColumnsModelDiff);
  useGridApiEventHandler(
    apiRef,
    GridEvents.groupingColumnsModelChange,
    checkGroupingColumnsModelDiff,
  );

  /**
   * EFFECTS
   */
  React.useEffect(() => {
    if (props.groupingColumnsModel !== undefined) {
      apiRef.current.setGroupingColumnsModel(props.groupingColumnsModel);
    }
  }, [apiRef, props.groupingColumnsModel]);
};
