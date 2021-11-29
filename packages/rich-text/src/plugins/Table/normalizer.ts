import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
import { Editor, Element, Location, Node, NodeEntry, Text, Transforms } from 'slate';
import { CustomElement } from '../../types';
import schema from '../../constants/Schema';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';

const cellTypes: string[] = [BLOCKS.TABLE_CELL, BLOCKS.TABLE_HEADER_CELL];

const paragraph = (children: any = []) => ({ type: BLOCKS.PARAGRAPH, data: {}, children });

const replaceNode = (editor: Editor, path: Location, content: Node) => {
  Transforms.removeNodes(editor, { at: path });
  Transforms.insertNodes(editor, content, { at: path });
};

const slateNodeToText = (node: CustomElement): string => {
  const contentfulNode = toContentfulDocument({ document: [node], schema });
  return documentToPlainTextString(contentfulNode);
};

const normalizeTableCell = (editor: Editor, entry: NodeEntry<CustomElement>) => {
  const [node, path] = entry;

  for (const [child, childPath] of Node.children(editor, path)) {
    if (Text.isText(child)) {
      Transforms.wrapNodes(editor, paragraph(), { at: childPath });
    } else if (!CONTAINERS[node.type].includes(child.type)) {
      replaceNode(editor, childPath, paragraph([{ text: slateNodeToText(child) }]));
    }
  }
};

export const createNormalizeNode = (editor: Editor) => {
  const { normalizeNode } = editor;
  return (entry: NodeEntry<CustomElement>) => {
    const [node, path] = entry;

    // Wrap table cell children in paragraphs, convert invalid blocks to text
    if (Element.isElement(node) && cellTypes.includes(node.type)) {
      normalizeTableCell(editor, entry);
    } else if (Element.isElement(node) && node.type === BLOCKS.TABLE) {
      // Drop all invalid (not a Row) children of a Table node
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Text.isText(child) || !CONTAINERS[BLOCKS.TABLE].includes(child.type as BLOCKS)) {
          Transforms.removeNodes(editor, { at: childPath });
        }
      }
    }

    normalizeNode(entry);
  };
};
