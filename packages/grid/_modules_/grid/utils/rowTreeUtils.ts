import type { GridRowTreeNodeConfig, GridRowId, GridRowTreeConfig } from '../models';
import type {
  GridRowGroupingResult,
  GridRowGroupParams,
} from '../hooks/core/rowGroupsPerProcessing';

type GridNodeNameToIdTree = {
  [nodeName: string]: { id: GridRowId; children: GridNodeNameToIdTree };
};

interface GenerateRowTreeParams extends GridRowGroupParams {
  rows: { id: GridRowId; path: string[] }[];
  defaultGroupingExpansionDepth: number;
}

interface TempRowTreeNode extends Omit<GridRowTreeNodeConfig, 'children'> {
  children?: Record<GridRowId, GridRowId>;
}

type TempRowTree = Record<GridRowId, TempRowTreeNode>;

export const buildRowTree = (params: GenerateRowTreeParams): GridRowGroupingResult => {
  const tempTree: TempRowTree = {};
  let treeDepth = 1;
  const rowIds = [...params.rowIds];
  const idRowsLookup = { ...params.idRowsLookup };

  const nodeNameToIdTree: GridNodeNameToIdTree = {};

  params.rows.forEach((row) => {
    let nodeNameToIdSubTree = nodeNameToIdTree;
    let parentNode: TempRowTreeNode | null = null;

    for (let depth = 0; depth < row.path.length; depth += 1) {
      const nodeName = row.path[depth];
      let nodeId: GridRowId;

      const expanded =
        params.defaultGroupingExpansionDepth === -1 || params.defaultGroupingExpansionDepth > depth;

      let nodeNameConfig = nodeNameToIdSubTree[nodeName];

      if (!nodeNameConfig) {
        nodeId =
          depth === row.path.length - 1
            ? row.id
            : `auto-generated-row-${row.path.slice(0, depth + 1).join('-')}`;

        nodeNameConfig = { id: nodeId, children: {} };
        nodeNameToIdSubTree[nodeName] = nodeNameConfig;
      } else {
        nodeId = nodeNameConfig.id;
      }
      nodeNameToIdSubTree = nodeNameConfig.children;

      if (depth < row.path.length - 1) {
        let node = tempTree[nodeId] ?? null;
        if (!node) {
          node = {
            id: nodeId,
            isAutoGenerated: true,
            expanded,
            parent: parentNode?.id ?? null,
            groupingValue: row.path[depth],
            depth,
          };

          tempTree[nodeId] = node;
          idRowsLookup[nodeId] = {};
          rowIds.push(nodeId);
        }

        node.descendantCount = (node.descendantCount ?? 0) + 1;
      } else {
        tempTree[row.id] = {
          id: row.id,
          expanded,
          parent: parentNode?.id ?? null,
          groupingValue: row.path[depth],
          depth,
        };
      }

      if (parentNode != null) {
        if (!parentNode.children) {
          parentNode.children = {};
        }

        parentNode.children[nodeId] = nodeId;
      }

      parentNode = tempTree[nodeId]!;
    }

    treeDepth = Math.max(treeDepth, row.path.length);
  });

  const tree: GridRowTreeConfig = {};
  rowIds.forEach((rowId) => {
    const tempNode = tempTree[rowId];
    tree[rowId] = {
      ...tempNode,
      children: tempNode.children ? Object.values(tempNode.children) : undefined,
    };
  });

  return {
    tree,
    treeDepth,
    rowIds,
    idRowsLookup,
  };
};
