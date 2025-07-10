/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/list/src/transforms/unwrapList.ts
 */

import { BLOCKS } from '@contentful/rich-text-types';
import { getListTypes } from '@udecode/plate-list';

import {
  getAboveNode,
  getBlockAbove,
  getCommonNode,
  getPluginType,
  isElement,
} from '../../../internal/queries';
import { withoutNormalizing, unwrapNodes, setElements } from '../../../internal/transforms';
import { PlateEditor, Path, Descendant } from '../../../internal/types';

function handleEmbeddedType(
  editor: PlateEditor,
  blockType: BLOCKS.EMBEDDED_ASSET | BLOCKS.EMBEDDED_ENTRY,
  at?: Path,
  firstChild?: Descendant
) {
  if (firstChild) {
    setElements(editor, {
      at,
      type: getPluginType(editor, blockType),
      value: { ...firstChild },
    });
  }
}

export const unwrapList = (editor: PlateEditor, { at }: { at?: Path } = {}) => {
  const ancestorListTypeCheck = () => {
    if (getAboveNode(editor, { match: { at, type: getListTypes(editor) } })) {
      return true;
    }
    // The selection's common node might be a list type
    if (!at && editor.selection) {
      const commonNode = getCommonNode(
        editor,
        editor.selection.anchor.path,
        editor.selection.focus.path
      );

      if (isElement(commonNode[0]) && getListTypes(editor).includes(commonNode[0].type)) {
        return true;
      }
    }

    return false;
  };

  withoutNormalizing(editor, () => {
    do {
      const licEntry = getBlockAbove(editor, {
        at,
        match: { type: getPluginType(editor, BLOCKS.LIST_ITEM) },
      });

      if (licEntry) {
        // Special case for embedded entry and asset
        // if we don't do these they will get replaced by a paragraph and lose
        // their value.
        const firstChild = licEntry[0]?.children[0];
        if (
          firstChild.type === BLOCKS.EMBEDDED_ENTRY ||
          firstChild.type === BLOCKS.EMBEDDED_ASSET
        ) {
          handleEmbeddedType(editor, firstChild.type, at, firstChild);
        } else {
          setElements(editor, {
            at,
            type: getPluginType(editor, BLOCKS.PARAGRAPH),
          });
        }
      }

      unwrapNodes(editor, {
        at,
        match: { type: getPluginType(editor, BLOCKS.LIST_ITEM) },
        // in original code split is set to true
        // ommited here as we get an extra list item when switching off list blocks
      });

      unwrapNodes(editor, {
        at,
        match: {
          type: [getPluginType(editor, BLOCKS.UL_LIST), getPluginType(editor, BLOCKS.OL_LIST)],
        },
        // in original code split is set to true
        // ommited here as we get an extra list item when switching off list blocks
      });
    } while (ancestorListTypeCheck());
  });
};
