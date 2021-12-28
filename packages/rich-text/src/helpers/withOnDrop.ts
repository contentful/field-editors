import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { getNodes, PlateEditor, match } from '@udecode/plate-core';

// Copied from the old DragAndDrop plugin.
// TODO: should this be a fixed list?
const DRAGGABLE_TYPES: string[] = [
  BLOCKS.EMBEDDED_ENTRY,
  BLOCKS.EMBEDDED_ASSET,
  BLOCKS.HR,
  INLINES.EMBEDDED_ENTRY,
];

export type WithOnDropOptions = {
  allow: string[];
};

/**
 * Creates onDrop handler that does the following:
 *
 * 1) Cancels Drop event in case the element type is not in the allowed list
 * 2) Mutates history accordingly to correctly handle undo commands
 */
export const withOnDrop =
  ({ allow }: WithOnDropOptions) =>
  (editor: PlateEditor) =>
  () => {
    const [draggingBlock] = Array.from(
      getNodes(editor, {
        match: (node) => DRAGGABLE_TYPES.includes(node?.type),
      })
    );

    if (!draggingBlock) return false;

    const [draggingNode] = draggingBlock;

    const isDropAllowed = match(draggingNode, {
      type: allow,
    });

    if (isDropAllowed) {
      // Move the drop event to a new undo batch mitigating the bug where undo not only moves it back,
      // but also undoes a previous action: https://github.com/ianstormtaylor/slate/issues/4694
      editor.history.undos.push([]);
    }

    // If true, the next handlers will be skipped.
    return !isDropAllowed;
  };
