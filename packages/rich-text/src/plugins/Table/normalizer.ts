// @ts-nocheck
import { Element, Node, Text, Transforms } from 'slate';
import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';

import { CustomElement } from '../../types';
import schema from '../../constants/Schema';
import { replaceNode } from '../../helpers/editor';
import { Normalizer } from '../../helpers/normalizers';

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

const normalizeTableCell: Normalizer = (editor, entry) => {
  const [node, path] = entry;

  for (const [child, childPath] of Node.children(editor, path)) {
    if (Text.isText(child)) {
      Transforms.wrapNodes(editor, paragraph(), { at: childPath });
    } else if (!CONTAINERS[node.type].includes(child.type)) {
      replaceNode(editor, childPath, paragraph([{ text: slateNodeToText(child) }]));
    }
  }
};

export const normalizeTable: Normalizer = (editor, entry) => {
  const [node, path] = entry;

  if (isTable(node)) {
    // Drop all invalid (not a Row) children of a Table node

    for (const [child, childPath] of Node.children(editor, path)) {
      if (Text.isText(child) || !CONTAINERS[BLOCKS.TABLE].includes(child.type as BLOCKS)) {
        Transforms.removeNodes(editor, { at: childPath });
        return true;
      }
    }
  }

  // Wrap table cell children in paragraphs, convert invalid blocks to text
  // if (isTableCell(node)) {
  //   normalizeTableCell(editor, entry);
  // }
};
