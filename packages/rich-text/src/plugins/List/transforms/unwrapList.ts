/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { BLOCKS } from '@contentful/rich-text-types';
import { PlateEditor, unwrapNodes } from '@udecode/plate-core';
import { Editor, Element, Path, Transforms } from 'slate';

function hasUnliftedListItems(editor: PlateEditor, at?: Path) {
  return Editor.nodes(editor, {
    at,
    match: (node, path) =>
      Element.isElement(node) && node.type === BLOCKS.LIST_ITEM && path.length >= 2,
  }).next().done;
}
export const unwrapList = (editor: PlateEditor, { at }: { at?: Path } = {}) => {
  Editor.withoutNormalizing(editor, () => {
    do {
      // lift list items to the root level
      Transforms.liftNodes(editor, {
        at,
        match: (node) => Element.isElement(node) && node.type === BLOCKS.LIST_ITEM,
        mode: 'lowest',
      });
    } while (!hasUnliftedListItems(editor, at));

    // finally unwrap all lifted items
    unwrapNodes(editor, {
      at,
      match: { type: BLOCKS.LIST_ITEM },
      split: false,
    });
  });
};
