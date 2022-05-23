import {
  GRID_ROOT_GROUP_ID,
  GridGroupNode,
  GridRowId,
  GridRowsLookup,
  GridTreeNode,
} from '@mui/x-data-grid';
import { getGroupRowIdFromPath } from './utils';
import { GridTreePathDuplicateHandler, RowTreeBuilderGroupingCriterion } from './models';

export const insertNodeInTree = ({
  id,
  path,
  tree,
  idRowsLookup,
  idToIdLookup,
  onDuplicatePath,
}: {
  id: GridRowId;
  path: RowTreeBuilderGroupingCriterion[];
  tree: Record<GridRowId, GridTreeNode>;
  idRowsLookup: GridRowsLookup;
  idToIdLookup: Record<string, GridRowId>;
  onDuplicatePath?: GridTreePathDuplicateHandler;
}) => {
  let parentNode = tree[GRID_ROOT_GROUP_ID] as GridGroupNode;

  for (let depth = 0; depth < path.length; depth += 1) {
    const { key, field: rawField } = path[depth];
    const field = rawField ?? '__no_field__';

    let nodeId: GridRowId;

    if (!parentNode.childrenFromPath[field]) {
      parentNode.childrenFromPath[field] = {};
    }

    const nodeIdFromPath = parentNode.childrenFromPath[field][key.toString()];

    if (nodeIdFromPath == null) {
      if (depth === path.length - 1) {
        nodeId = id;
      } else {
        nodeId = getGroupRowIdFromPath(path.slice(0, depth + 1));
      }

      parentNode.childrenFromPath[field][key.toString()] = nodeId;
      parentNode.children.push(nodeId);
    } else {
      if (depth === path.length - 1) {
        onDuplicatePath?.(nodeIdFromPath, id, path);
      }
      nodeId = nodeIdFromPath;
    }

    if (depth < path.length - 1) {
      const currentGroupNode = tree[nodeId];
      // If the group node does not exist, we create it
      if (!currentGroupNode) {
        idRowsLookup[nodeId] = {};
        idToIdLookup[nodeId] = nodeId;

        const groupNode: GridGroupNode = {
          type: 'group',
          id: nodeId,
          depth,
          isAutoGenerated: true,
          groupingKey: key,
          groupingField: rawField,
          children: [],
          childrenFromPath: {},
          parent: parentNode.id,
        };

        tree[nodeId] = groupNode;
        parentNode = groupNode;
      }
      // If the group node exists but is of not a group, we turn it into a group
      else if (currentGroupNode.type !== 'group') {
        const groupNode: GridGroupNode = {
          type: 'group',
          id: currentGroupNode.id,
          depth: currentGroupNode.depth,
          parent: currentGroupNode.parent,
          isAutoGenerated: false,
          groupingKey: key,
          groupingField: rawField,
          children: [],
          childrenFromPath: {},
        };

        tree[nodeId] = groupNode;
        parentNode = groupNode;
      } else {
        parentNode = currentGroupNode;
      }
    } else {
      tree[nodeId] = {
        type: 'leaf',
        id: nodeId,
        depth,
        parent: parentNode.id,
        groupingKey: key,
      };
    }
  }
};
