import { GridComponentProps } from '../../_modules_/grid/GridComponentProps';
import { useGridClipboard } from '../../_modules_/grid/hooks/features/clipboard/useGridClipboard';
import { useGridColumnMenu } from '../../_modules_/grid/hooks/features/columnMenu/useGridColumnMenu';
import { useGridColumns } from '../../_modules_/grid/hooks/features/columns/useGridColumns';
import { useGridControlState } from '../../_modules_/grid/hooks/features/core/useGridControlState';
import { useGridDensity } from '../../_modules_/grid/hooks/features/density/useGridDensity';
import { useGridCsvExport } from '../../_modules_/grid/hooks/features/export/useGridCsvExport';
import { useGridFilter } from '../../_modules_/grid/hooks/features/filter/useGridFilter';
import { useGridFocus } from '../../_modules_/grid/hooks/features/focus/useGridFocus';
import { useGridKeyboard } from '../../_modules_/grid/hooks/features/keyboard/useGridKeyboard';
import { useGridKeyboardNavigation } from '../../_modules_/grid/hooks/features/keyboard/useGridKeyboardNavigation';
import { useLocaleText } from '../../_modules_/grid/hooks/features/localeText/useLocaleText';
import { useGridPageSize } from '../../_modules_/grid/hooks/features/pagination/useGridPageSize';
import { useGridPage } from '../../_modules_/grid/hooks/features/pagination/useGridPage';
import { useGridPreferencesPanel } from '../../_modules_/grid/hooks/features/preferencesPanel/useGridPreferencesPanel';
import { useGridEditRows } from '../../_modules_/grid/hooks/features/rows/useGridEditRows';
import { useGridFreezeRows } from '../../_modules_/grid/hooks/features/rows/useGridFreezeRows';
import { useGridParamsApi } from '../../_modules_/grid/hooks/features/rows/useGridParamsApi';
import { useGridRows } from '../../_modules_/grid/hooks/features/rows/useGridRows';
import { useGridSelection } from '../../_modules_/grid/hooks/features/selection/useGridSelection';
import { useGridSorting } from '../../_modules_/grid/hooks/features/sorting/useGridSorting';
import { useGridVirtualization } from '../../_modules_/grid/hooks/features/virtualization/useGridVirtualization';
import { useGridNoVirtualization } from '../../_modules_/grid/hooks/features/virtualization/useGridNoVirtualization';
import { useGridScroll } from '../../_modules_/grid/hooks/features/scroll/useGridScroll';
import { useApi } from '../../_modules_/grid/hooks/root/useApi';
import { useGridEvents } from '../../_modules_/grid/hooks/root/useGridEvents';
import { useGridContainerProps } from '../../_modules_/grid/hooks/root/useGridContainerProps';
import { useErrorHandler } from '../../_modules_/grid/hooks/utils/useErrorHandler';
import { useGridLoggerFactory } from '../../_modules_/grid/hooks/utils/useGridLogger';
import { useRenderInfoLog } from '../../_modules_/grid/hooks/utils/useRenderInfoLog';
import { useGridResizeContainer } from '../../_modules_/grid/hooks/utils/useGridResizeContainer';
import { useStateProp } from '../../_modules_/grid/hooks/utils/useStateProp';
import { GridApiRef } from '../../_modules_/grid/models/api/gridApiRef';
import { useGridColumnsPreProcessing } from '../../_modules_/grid/hooks/root/columnsPreProcessing';

export const useDataGridComponent = (apiRef: GridApiRef, props: GridComponentProps) => {
  useGridLoggerFactory(apiRef, props);
  useApi(apiRef, props);
  useErrorHandler(apiRef, props);
  useGridControlState(apiRef, props);
  useGridColumnsPreProcessing(apiRef);
  useLocaleText(apiRef, props);
  useGridResizeContainer(apiRef, props);
  useGridSelection(apiRef, props);
  useGridColumns(apiRef, props);
  useGridFreezeRows(apiRef, props);
  useGridRows(apiRef, props);
  useGridParamsApi(apiRef);
  useGridEditRows(apiRef, props);
  useGridFocus(apiRef, props);
  useGridSorting(apiRef, props);
  useGridPreferencesPanel(apiRef);
  useGridFilter(apiRef, props);
  useGridDensity(apiRef, props);
  useGridContainerProps(apiRef, props);
  useGridPageSize(apiRef, props);
  useGridPage(apiRef, props);
  useGridScroll(apiRef, props);
  useGridNoVirtualization(apiRef, props);
  useGridVirtualization(apiRef, props);
  useGridColumnMenu(apiRef);
  useGridKeyboard(apiRef);
  useGridKeyboardNavigation(apiRef, props);
  useGridCsvExport(apiRef);
  useGridClipboard(apiRef);
  useGridEvents(apiRef, props);
  useStateProp(apiRef, props);
  useRenderInfoLog(apiRef);
};
