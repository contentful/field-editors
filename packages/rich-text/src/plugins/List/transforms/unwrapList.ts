/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { BLOCKS } from '@contentful/rich-text-types';
import { getAbove, PlateEditor, unwrapNodes } from '@udecode/plate-core';
import { Editor, Path } from 'slate';

const listTypes = [BLOCKS.UL_LIST, BLOCKS.OL_LIST] as string[];

export const unwrapList = (editor: PlateEditor, { at }: { at?: Path } = {}) => {
  Editor.withoutNormalizing(editor, () => {
    do {
      unwrapNodes(editor, {
        at,
        match: { type: BLOCKS.LIST_ITEM },
        split: true,
      });

      unwrapNodes(editor, {
        at,
        match: {
          type: listTypes,
        },
        split: true,
      });
    } while (getAbove(editor, { match: { type: listTypes, at } }));
  });
};
