import { Element, Node, Transforms, Editor } from 'slate';
import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';

import { CustomElement } from '../../types';
import schema from '../../constants/Schema';
import { replaceNode } from '../../helpers/editor';
import { Normalizer, withNormalizer } from '../../helpers/normalizers';

const isTable = (node: CustomElement) => {
  return node.type === BLOCKS.TABLE;
};

const isTableCell = (node: CustomElement) => {
  return node.type === BLOCKS.TABLE_CELL || node.type === BLOCKS.TABLE_HEADER_CELL;
};

const paragraph = (children: Element['children'] = []) => ({
  type: BLOCKS.PARAGRAPH,
  data: {},
  children,
});

// FIXME: to be replaced with a custom function later
const slateNodeToText = (node: CustomElement): string => {
  const contentfulNode = toContentfulDocument({ document: [node], schema });
  return documentToPlainTextString(contentfulNode);
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
      replaceNode(editor, childPath, paragraph([{ text: slateNodeToText(child) }]));
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

export const addTableNormalizers = (editor: Editor) => {
  withNormalizer(editor, normalizeTable);
  withNormalizer(editor, normalizeTableCell);
};
