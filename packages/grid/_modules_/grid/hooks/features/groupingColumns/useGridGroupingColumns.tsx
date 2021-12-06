import * as React from 'react';
import type {
  GridApiRef,
  GridRowModel,
  GridRowId,
  GridColDef,
  GridKeyValue,
} from '../../../models';
import { GridEvents, GridEventListener } from '../../../models/events';
import { GridRowGroupingPreProcessing } from '../../core/rowGroupsPerProcessing';
import { useFirstRender } from '../../utils/useFirstRender';
import { isSpaceKey } from '../../../utils/keyboardUtils';
import { buildRowTree, BuildRowTreeGroupingCriteria } from '../../../utils/tree/buildRowTree';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import {
  gridGroupingRowsModelSelector,
  gridGroupingRowsSanitizedModelSelector,
} from './gridGroupingColumnsSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import {
  filterRowTreeFromGroupingColumns,
  getCellValue,
  getGroupingColDefFieldFromGroupingCriteriaField,
  getColDefOverrides,
  GROUPING_COLUMNS_FEATURE_NAME,
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
 * TODO: Add requirements
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
    stateSelector: gridGroupingRowsModelSelector,
    changeEvent: GridEvents.groupingColumnsModelChange,
  });

  /**
   * ROW GROUPING
   */
  const sanitizedGroupingColumnsModelOnLastRowPreProcessing =
    React.useRef<GridGroupingColumnsModel>([]);

  const updateRowGrouping = React.useCallback(() => {
    const groupRows: GridRowGroupingPreProcessing = (params) => {
      const groupingColumnsModel = gridGroupingRowsSanitizedModelSelector(apiRef.current.state);
      const columnsLookup = gridColumnLookupSelector(apiRef.current.state);
      sanitizedGroupingColumnsModelOnLastRowPreProcessing.current = groupingColumnsModel;

      if (groupingColumnsModel.length === 0) {
        return null;
      }

      const distinctValues: { [field: string]: { map: { [val: string]: boolean }; list: any[] } } =
        Object.fromEntries(
          groupingColumnsModel.map((groupingField) => [groupingField, { map: {}, list: [] }]),
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
        const value = getCellValue({ colDef, row, id, isAutoGenerated: false });

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

        groupingColumnsModel.forEach((groupedByField) => {
          const { key } = getCellGroupingCriteria({
            row,
            id: rowId,
            colDef: columnsLookup[groupedByField],
          });
          const groupingFieldsDistinctKeys = distinctValues[groupedByField];

          if (key != null && !groupingFieldsDistinctKeys.map[key.toString()]) {
            groupingFieldsDistinctKeys.map[key.toString()] = true;
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

        return {
          path: [...parentPath, { key: rowId.toString(), field: null }],
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
  }, [apiRef, props.defaultGroupingExpansionDepth]);

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
      const propGroupingColDef = props.groupingColDef;

      // We can't use `gridGroupingRowsSanitizedModelSelector` here because the new columns are not in the state yet
      const groupingColumnsModel = gridGroupingRowsModelSelector(apiRef.current.state).filter(
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
          return groupingColumnsModel.map((groupedByField) =>
            createGroupingColDefForOneGroupingCriteria({
              groupedByField,
              colDefOverride: getColDefOverrides(propGroupingColDef, [groupedByField]),
              groupedByColDef: columnsState.lookup[groupedByField],
              columnsLookup: columnsState.lookup,
            }),
          );
        }

        default: {
          return [];
        }
      }
    },
    [apiRef, props.groupingColDef, props.groupingColumnMode],
  );

  const updateGroupingColumn = React.useCallback(
    (columnsState: GridColumnsRawState) => {
      const groupingColDefs = getGroupingColDefs(columnsState);

      // We remove the grouping columns
      const newColumnFields: string[] = [];
      columnsState.all.forEach((field) => {
        if (columnsState.lookup[field].type === 'rowGroupByColumnsGroup') {
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

  const addColumnMenuButtons = React.useCallback((initialValue: JSX.Element[]) => {
    return [...initialValue, <GridGroupingColumnsMenuItems />];
  }, []);

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
      const currentModel = gridGroupingRowsModelSelector(apiRef.current.state);
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
      const currentModel = gridGroupingRowsModelSelector(apiRef.current.state);
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
      const currentModel = gridGroupingRowsModelSelector(apiRef.current.state);
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
      const currentModel = gridGroupingRowsModelSelector(apiRef.current.state);
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
      if (
        cellParams.colDef.type === 'rowGroupByColumnsGroup' &&
        isSpaceKey(event.key) &&
        !event.shiftKey
      ) {
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
    const groupingColumnsModel = gridGroupingRowsSanitizedModelSelector(apiRef.current.state);
    const lastGroupingColumnsModelApplied =
      sanitizedGroupingColumnsModelOnLastRowPreProcessing.current;

    if (!isDeepEqual(lastGroupingColumnsModelApplied, groupingColumnsModel)) {
      sanitizedGroupingColumnsModelOnLastRowPreProcessing.current = groupingColumnsModel;

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
   * UPDATES
   */
  React.useEffect(() => {
    if (props.groupingColumnsModel !== undefined) {
      apiRef.current.setGroupingColumnsModel(props.groupingColumnsModel);
    }
  }, [apiRef, props.groupingColumnsModel]);
};
