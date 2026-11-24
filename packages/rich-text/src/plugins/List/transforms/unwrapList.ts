/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { BLOCKS } from '@contentful/rich-text-types';

import { getTableCellEntry } from '../../../helpers/editor';
import { withoutNormalizing } from '../../../internal';
import { getNodeEntries, isElement } from '../../../internal/queries';
import { unwrapNodes, liftNodes } from '../../../internal/transforms';
import { PlateEditor, Path } from '../../../internal/types';

/**
 * The path length of a list item once it has been lifted out of every
 * list, i.e. when it is a direct child of the document or of a table cell.
 */
function getUnwrappedListItemDepth(editor: PlateEditor, at?: Path) {
  const path = at ?? editor.selection?.anchor.path;
  const [, cellPath] = path ? getTableCellEntry(editor, path) : [];

  return (cellPath?.length ?? 0) + 1;
}

function hasUnliftedListItems(editor: PlateEditor, unwrappedDepth: number, at?: Path) {
  return getNodeEntries(editor, {
    at,
    match: (node, path) =>
      isElement(node) && node.type === BLOCKS.LIST_ITEM && path.length > unwrappedDepth,
  }).next().done;
}

export const unwrapList = (editor: PlateEditor, { at }: { at?: Path } = {}) => {
  const unwrappedDepth = getUnwrappedListItemDepth(editor, at);

  withoutNormalizing(editor, () => {
    do {
      // lift list items to the root level (or the table cell they live in)
      liftNodes(editor, {
        at,
        match: (node) => isElement(node) && node.type === BLOCKS.LIST_ITEM,
        mode: 'lowest',
      });
    } while (!hasUnliftedListItems(editor, unwrappedDepth, at));

    // finally unwrap all lifted items
    unwrapNodes(editor, {
      at,
      match: { type: BLOCKS.LIST_ITEM },
      split: false,
    });
  });
};
