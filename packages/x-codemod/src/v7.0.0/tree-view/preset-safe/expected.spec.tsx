// @ts-nocheck
import * as React from 'react';
import { SimpleTreeView, simpleTreeViewClasses } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

const className = simpleTreeViewClasses.root;

<SimpleTreeView expandedNodes={[]} defaultExpandedNodes={[]} onExpandedNodesChange={callback}>
  <TreeItem nodeId="1" label="Item 1" />
</SimpleTreeView>;
