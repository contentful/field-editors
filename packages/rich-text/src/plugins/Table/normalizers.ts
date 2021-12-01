import { PlateEditor } from '@udecode/plate';
import { Element, Node, Transforms } from 'slate';
import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';

import { CustomElement } from '../../types';
import { Normalizer, withNormalizer } from '../../helpers/normalizers';
import { replaceNode, slateNodeEntryToText } from '../../helpers/editor';

const isTable = (node: CustomElement) => {
  return node.type === BLOCKS.TABLE;
};

const isTableCell = (node: CustomElement) => {
  return node.type === BLOCKS.TABLE_CELL || node.type === BLOCKS.TABLE_HEADER_CELL;
};

/**
 * Normalizes TABLE_CELL & TABLE_HEADER_CELL nodes
 */
const normalizeTableCell: Normalizer = (editor, entry) => {
  const [node, path] = entry;

  if (!isTableCell(node)) {
    return true;
  }

  for (const [child, childPath] of Node.children(editor, path)) {
    if (!Element.isElement(child)) {
      continue;
    }

    const isValidTableCellItem = CONTAINERS[node.type].includes(child.type);

    if (!isValidTableCellItem) {
      const text = slateNodeEntryToText(editor, childPath);
      replaceNode(editor, childPath, text);
      return;
    }
  }

  return true;
};

/**
 * Normalizes TABLE nodes
 */
const normalizeTable: Normalizer = (editor, entry) => {
  const [node, path] = entry;

  if (!isTable(node)) {
    return true;
  }

  // All direct children must be of type TABLE_ROW
  for (const [child, childPath] of Node.children(editor, path)) {
    if (!Element.isElement(child)) {
      continue;
    }

    const isValidTableChild = CONTAINERS[BLOCKS.TABLE].includes(child.type as BLOCKS);

    if (!isValidTableChild) {
      Transforms.removeNodes(editor, { at: childPath });
      return;
    }
  }

  return true;
};

export const addTableNormalizers = (editor: PlateEditor) => {
  withNormalizer(editor, normalizeTable);
  withNormalizer(editor, normalizeTableCell);
};
