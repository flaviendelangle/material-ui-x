import {
  GRID_ROOT_GROUP_ID,
  GridGroupNode,
  GridRowId,
  GridRowsLookup,
  GridRowTreeConfig,
} from '@mui/x-data-grid';
import { isDeepEqual } from '@mui/x-data-grid/internals';
import { RowTreeBuilderGroupingCriteria, RowTreeBuilderNode } from './models';
import { insertNodeInTree } from './insertNodeInTree';

export interface UpdateRowTreeNodes {
  inserted: RowTreeBuilderNode[];
  modified: RowTreeBuilderNode[];
  deleted: GridRowId[];
}

const getNodePathInTree = (
  tree: GridRowTreeConfig,
  id: GridRowId,
): RowTreeBuilderGroupingCriteria[] => {
  const node = tree[id];

  const parentPath =
    node.parent == null || node.parent === GRID_ROOT_GROUP_ID
      ? []
      : getNodePathInTree(tree, node.parent);

  if (node.type === 'footer') {
    return [...parentPath, { key: '', field: null }];
  }

  if (node.type === 'group') {
    return [...parentPath, { key: node.groupingKey ?? '', field: node.groupingField }];
  }

  return [...parentPath, { key: node.groupingKey ?? '', field: null }];
};

interface UpdateRowTreeParams {
  idRowsLookup: GridRowsLookup;
  idToIdLookup: Record<string, GridRowId>;
  previousTree: GridRowTreeConfig;
  nodes: UpdateRowTreeNodes;
  defaultGroupingExpansionDepth: number;
  isGroupExpandedByDefault?: (node: GridGroupNode) => boolean;
  groupingName: string;
  onDuplicatePath?: (
    firstId: GridRowId,
    secondId: GridRowId,
    path: RowTreeBuilderGroupingCriteria[],
  ) => void;
}

export const updateRowTree = (params: UpdateRowTreeParams) => {
  const tree = { ...params.previousTree };

  // TODO: Retrieve previous tree depth
  let treeDepth = 1;
  const ids = Object.values(params.idToIdLookup);
  const idRowsLookup = { ...params.idRowsLookup };
  const idToIdLookup = { ...params.idToIdLookup };

  params.nodes.modified.forEach((modifiedNode) => {
    const pathInPreviousTree = getNodePathInTree(params.previousTree, modifiedNode.id);
    const isInSameGroup = isDeepEqual(pathInPreviousTree, modifiedNode.path);

    if (!isInSameGroup) {
      console.log('Must be removed from old group and added to new one');
    }
  });

  for (let i = 0; i < params.nodes.inserted.length; i += 1) {
    const node = params.nodes.inserted[i];

    insertNodeInTree({
      tree,
      ids,
      idRowsLookup,
      idToIdLookup,
      id: node.id,
      path: node.path,
      onDuplicatePath: params.onDuplicatePath,
    });

    treeDepth = Math.max(treeDepth, node.path.length);
  }

  params.nodes.deleted.forEach((deletedNode) => {});

  return {
    tree,
    treeDepth,
    ids,
    idRowsLookup,
    idToIdLookup,
    groupingName: params.groupingName,
  };
};
