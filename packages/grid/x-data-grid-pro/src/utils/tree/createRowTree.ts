import {
  GridRowId,
  GridGroupNode,
  GridTreeNode,
  GridRowsLookup,
  GRID_ROOT_GROUP_ID,
} from '@mui/x-data-grid';
import { GridRowTreeCreationValue } from '@mui/x-data-grid/internals';
import { RowTreeBuilderNode, GridTreePathDuplicateHandler } from './models';
import { insertNodeInTree } from './insertNodeInTree';

interface BuildRowTreeParams {
  idRowsLookup: GridRowsLookup;
  idToIdLookup: Record<string, GridRowId>;
  nodes: RowTreeBuilderNode[];
  defaultGroupingExpansionDepth: number;
  isGroupExpandedByDefault?: (node: GridGroupNode) => boolean;
  groupingName: string;
  onDuplicatePath?: GridTreePathDuplicateHandler;
}

/**
 * Transform a list of rows into a tree structure where each row references its parent and children.
 * If a row have a parent which does not exist in the input rows, creates an auto generated row
 *
 ```
 params = {
   ids: [0, 1, 2],
   idRowsLookup: { 0: {...}, 1: {...}, 2: {...} },
   rows: [
     { id: 0, path: ['A'] },
     { id: 1, path: ['B', 'A'] },
     { id: 2, path: ['B', 'A', 'A'] }
   ],
   defaultGroupingExpansionDepth: 0,
 }
 Returns:
 {
   ids: [0, 1, 2, 'auto-generated-row-B'],
   idRowsLookup: { 0: {...}, 1: {...}, 2: {...}, 'auto-generated-row-B': {} },
   tree: {
     '0': { id: 0, parent: null, childrenExpanded: false, depth: 0, groupingKey: 'A' },
     'auto-generated-row-B': { id: 'auto-generated-row-B', parent: null, childrenExpanded: false, depth: 0, groupingKey: 'B' },
     '1': { id: 1, parent: 'auto-generated-row-B', childrenExpanded: false, depth: 1, groupingKey: 'A' },
     '2': { id: 2, parent: 1, childrenExpanded: false, depth: 2, groupingKey: 'A' },
   },
   treeDepth: 3,
 }
 ```
 */
export const createRowTree = (params: BuildRowTreeParams): GridRowTreeCreationValue => {
  const gridRootGroupNode: GridGroupNode = {
    type: 'group',
    id: GRID_ROOT_GROUP_ID,
    depth: -1,
    groupingField: null,
    groupingKey: null,
    isAutoGenerated: true,
    children: [],
    childrenFromPath: {},
    parent: null,
  };

  // During the build, we store the children as a Record to avoid linear complexity when checking if a children is already defined.
  const tree: Record<GridRowId, GridTreeNode> = {
    [GRID_ROOT_GROUP_ID]: gridRootGroupNode,
  };
  let treeDepth = 1;

  const ids: GridRowId[] = [];
  const idRowsLookup = { ...params.idRowsLookup };
  const idToIdLookup = { ...params.idToIdLookup };

  const isGroupExpandedByDefault = (node: GridGroupNode) => {
    if (node.id === GRID_ROOT_GROUP_ID) {
      return true;
    }

    // const previousNode = params.previousTree?.[node.id];
    // if (previousNode?.type === 'group') {
    //   return previousNode.childrenExpanded;
    // }

    if (Object.keys(node.children).length === 0) {
      return false;
    }

    if (params.isGroupExpandedByDefault) {
      return params.isGroupExpandedByDefault(node);
    }

    return (
      params.defaultGroupingExpansionDepth === -1 ||
      params.defaultGroupingExpansionDepth > node.depth
    );
  };

  for (let i = 0; i < params.nodes.length; i += 1) {
    const node = params.nodes[i];

    ids.push(node.id);

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

  // TODO: Remove the `previousNode` logic once we stop regenerating the whole tree on every update
  const postProcessNode = (tempNode: GridTreeNode) => {
    let node: GridTreeNode;
    // const previousNode = params.previousTree?.[tempNode.id];

    if (tempNode.type === 'footer' || tempNode.type === 'leaf') {
      // if (
      //   previousNode?.type === tempNode.type &&
      //   previousNode.depth === tempNode.depth &&
      //   previousNode.parent === tempNode.parent
      // ) {
      //   node = previousNode;
      // } else {
      node = tempNode;
      // }
    } else {
      const childrenExpanded = isGroupExpandedByDefault(tempNode);
      const groupNode: GridGroupNode = {
        ...tempNode,
        childrenExpanded,
      };

      // if (
      //   previousNode?.type === 'group' &&
      //   previousNode.depth === groupNode.depth &&
      //   previousNode.parent === groupNode.parent &&
      //   previousNode.isAutoGenerated === groupNode.isAutoGenerated &&
      //   previousNode.parent === groupNode.parent &&
      //   previousNode.groupingKey === groupNode.groupingKey &&
      //   previousNode.groupingField === groupNode.groupingField &&
      //   previousNode.childrenExpanded === groupNode.childrenExpanded &&
      //   previousNode.children.length === groupNode.children?.length &&
      //   previousNode.children.every((childNode, index) => groupNode.children?.[index] === childNode)
      // ) {
      //   node = previousNode;
      // } else {
      node = groupNode;
      // }
    }

    tree[node.id] = node;
  };

  postProcessNode(gridRootGroupNode);

  // TODO: Only loop across groups, not leaves
  for (let i = 0; i < ids.length; i += 1) {
    postProcessNode(tree[ids[i]]);
  }

  return {
    tree,
    treeDepth,
    ids,
    idRowsLookup,
    idToIdLookup,
    groupingName: params.groupingName,
  };
};
