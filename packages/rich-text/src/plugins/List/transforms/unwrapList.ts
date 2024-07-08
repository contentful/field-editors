/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { BLOCKS } from '@contentful/rich-text-types';

import { withoutNormalizing } from '../../../internal';
import { getNodeEntries, isElement } from '../../../internal/queries';
import { unwrapNodes, liftNodes } from '../../../internal/transforms';
import { PlateEditor, Path } from '../../../internal/types';

function hasUnliftedListItems(editor: PlateEditor, stoppingIndex: number, at?: Path) {
  return getNodeEntries(editor, {
    at,
    match: (node, path) =>
      isElement(node) && node.type === BLOCKS.LIST_ITEM && path.length >= stoppingIndex,
  }).next().done;
}

function getStoppingIndex(editor: PlateEditor, at?: Path) {
  const tableCell = getNodeEntries(editor, {
    at,
    match: (node) => {
      return isElement(node) && node.type === BLOCKS.TABLE_CELL;
    },
  }).next().value;
  const rootStoppingIndex = 2;
  return tableCell ? tableCell[1].length + rootStoppingIndex : rootStoppingIndex;
}

export const unwrapList = (editor: PlateEditor, { at }: { at?: Path } = {}) => {
  const stoppingIndex = getStoppingIndex(editor, at);

  withoutNormalizing(editor, () => {
    do {
      // lift list items to the root level
      liftNodes(editor, {
        at,
        match: (node) => isElement(node) && node.type === BLOCKS.LIST_ITEM,
        mode: 'lowest',
      });
    } while (!hasUnliftedListItems(editor, stoppingIndex, at));

    // finally unwrap all lifted items
    unwrapNodes(editor, {
      at,
      match: { type: BLOCKS.LIST_ITEM },
      split: false,
    });
  });
};
