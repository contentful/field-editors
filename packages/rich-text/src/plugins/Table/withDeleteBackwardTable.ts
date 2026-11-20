import { BLOCKS } from '@contentful/rich-text-types';

import { isText } from '../../internal/queries';
import type { Element, PlateEditor } from '../../internal/types/editor';

const isElementNode = (node: unknown): node is Element =>
  typeof node === 'object' &&
  node !== null &&
  'type' in node &&
  typeof node.type === 'string' &&
  'children' in node &&
  Array.isArray(node.children);

const isEmptyParagraph = (node: unknown) =>
  isElementNode(node) &&
  node.type === BLOCKS.PARAGRAPH &&
  node.children.length > 0 &&
  node.children.every((child) => isText(child) && child.text.length === 0);

const isEmptyTable = (node: unknown): node is Element =>
  isElementNode(node) &&
  node.type === BLOCKS.TABLE &&
  node.children.length > 0 &&
  node.children.every(
    (row) =>
      isElementNode(row) &&
      row.type === BLOCKS.TABLE_ROW &&
      row.children.length > 0 &&
      row.children.every(
        (cell) =>
          isElementNode(cell) &&
          (cell.type === BLOCKS.TABLE_CELL || cell.type === BLOCKS.TABLE_HEADER_CELL) &&
          cell.children.length > 0 &&
          cell.children.every(isEmptyParagraph),
      ),
  );

const getEmptyTableBeforeBackspace = (editor: PlateEditor) => {
  const { selection } = editor;
  if (!selection || !editor.api.isCollapsed()) return;

  const tableEntry = editor.api.above({
    at: selection.anchor,
    match: { type: editor.getType(BLOCKS.TABLE) },
  });
  if (tableEntry) {
    if (!isEmptyTable(tableEntry[0])) return;

    const firstCellPath = [...tableEntry[1], 0, 0];
    return editor.api.isStart(selection.anchor, firstCellPath) ? tableEntry[1] : undefined;
  }

  const currentBlockIndex = selection.anchor.path[0];
  const currentBlock = editor.children[currentBlockIndex];
  if (
    !currentBlock ||
    currentBlock.type !== BLOCKS.PARAGRAPH ||
    currentBlockIndex === 0 ||
    !editor.api.isStart(selection.anchor, [currentBlockIndex])
  ) {
    return;
  }

  const previousBlock = editor.children[currentBlockIndex - 1];
  return previousBlock && isEmptyTable(previousBlock) ? [currentBlockIndex - 1] : undefined;
};

export const withDeleteBackwardTable = (editor: PlateEditor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const emptyTablePath = getEmptyTableBeforeBackspace(editor);
    if (emptyTablePath) {
      editor.tf.removeNodes({ at: emptyTablePath });
      return;
    }

    deleteBackward(unit);
  };

  return editor;
};
