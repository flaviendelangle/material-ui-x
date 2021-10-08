import * as React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridApiContext } from '../../hooks/root/useGridApiContext';
import { GridRenderCellParams } from '../../models/params/gridCellParams';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  toggle: {
    flex: '0 0 28px',
    alignSelf: 'stretch',
    marginRight: 16,
  },
});

const GridRowGroupingGroupingCell = (props: GridRenderCellParams) => {
  const { id } = props;

  const rootProps = useGridRootProps();
  const apiRef = useGridApiContext();
  const classes = useStyles();
  const node = apiRef.current.getRowNode(id);

  const Icon = node?.expanded
    ? rootProps.components.TreeDataCollapseIcon
    : rootProps.components.TreeDataExpandIcon;

  const path = apiRef.current.getRowPath(id);

  if (!node || !path) {
    throw new Error(`MUI: No row with id #${id} found`);
  }

  if (!node.fillerNode) {
    return null
  }

  return (
    <Box className={classes.root} sx={{ ml: (path.length - 1) * 4 }}>
      <div className={classes.toggle}>
        {!!node.children?.size && (
          <IconButton
            size="small"
            onClick={() => apiRef.current.setRowExpansion(id, !node?.expanded)}
            tabIndex={-1}
            aria-label={
              node.expanded
                ? apiRef.current.getLocaleText('treeDataCollapse')
                : apiRef.current.getLocaleText('treeDataExpand')
            }
          >
            <Icon fontSize="inherit" />
          </IconButton>
        )}
      </div>
      <span>{path[path.length - 1]}</span>
    </Box>
  );
};

GridRowGroupingGroupingCell.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * GridApi that let you manipulate the grid.
   */
  api: PropTypes.any.isRequired,
  /**
   * The mode of the cell.
   */
  cellMode: PropTypes.oneOf(['edit', 'view']).isRequired,
  /**
   * The column of the row that the current cell belongs to.
   */
  colDef: PropTypes.object.isRequired,
  /**
   * The column field of the cell that triggered the event
   */
  field: PropTypes.string.isRequired,
  /**
   * The cell value formatted with the column valueFormatter.
   */
  formattedValue: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.number,
    PropTypes.object,
    PropTypes.string,
    PropTypes.bool,
  ]),
  /**
   * Get the cell value of a row and field.
   * @param {GridRowId} id The row id.
   * @param {string} field The field.
   * @returns {GridCellValue} The cell value.
   */
  getValue: PropTypes.func.isRequired,
  /**
   * If true, the cell is the active element.
   */
  hasFocus: PropTypes.bool.isRequired,
  /**
   * The grid row id.
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  /**
   * If true, the cell is editable.
   */
  isEditable: PropTypes.bool,
  /**
   * The row model of the row that the current cell belongs to.
   */
  row: PropTypes.object.isRequired,
  /**
   * the tabIndex value.
   */
  tabIndex: PropTypes.oneOf([-1, 0]).isRequired,
  /**
   * The cell value, but if the column has valueGetter, use getValue.
   */
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.number,
    PropTypes.object,
    PropTypes.string,
    PropTypes.bool,
  ]),
} as any;

export { GridRowGroupingGroupingCell };
