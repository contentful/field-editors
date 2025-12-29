import {
  Document as CfDocument,
  Block as CfBlock,
  Inline as CfInline,
  Text as CfText,
  INLINES,
  type Hyperlink,
  BLOCKS,
  VOID_BLOCKS,
} from '@contentful/rich-text-types';
import { Text as TextInterface, Element as ElementInterface } from 'slate';

import type { Text, Element } from '../internal';
import { isText } from '../internal';

const inlineTypes = new Set<string>(Object.values(INLINES));
const voidTypes = new Set<string>([
  ...VOID_BLOCKS,
  INLINES.EMBEDDED_ENTRY,
  INLINES.EMBEDDED_RESOURCE,
]);

function isEmptyHyperlink(node: CfBlock | CfInline): boolean {
  if (node.nodeType !== INLINES.HYPERLINK) {
    return false;
  }

  const link = node as Hyperlink;
  if (!link.content?.length) {
    return true;
  }

  return link.content.length === 1 && link.content.at(0)?.value.length === 0;
}

function maybeFixUnevenTableRows(el: Element): Element[] {
  const rows = el.children as Element[];

  const rowSize = Math.max(...rows.map((row) => row.children?.length ?? 0));

  const fixedRows: Element[] = [];

  for (const row of rows) {
    const missingCells = rowSize - row.children.length;

    if (missingCells === 0) {
      fixedRows.push(row);
      continue;
    }

    // Determine padding cell type based on the last cell in the row
    const cellType =
      row.children.at(-1)?.type === BLOCKS.TABLE_HEADER_CELL
        ? BLOCKS.TABLE_HEADER_CELL
        : BLOCKS.TABLE_CELL;

    const paddedRow = { ...row, children: [...row.children] };

    for (let i = 0; i < missingCells; i++) {
      paddedRow.children.push({
        type: cellType,
        data: {},
        children: [
          {
            type: BLOCKS.PARAGRAPH,
            data: {},
            children: [{ text: '' }],
            isVoid: false,
          },
        ],
        isVoid: false,
      });
    }

    fixedRows.push(paddedRow);
  }

  return fixedRows;
}

function transformText(node: CfText): Text {
  const text: Text = {
    text: node.value,
    data: node.data ?? {},
  };

  for (const mark of node.marks) {
    text[mark.type] = true;
  }

  return text;
}

function transformNode(node: CfBlock | CfInline): Element {
  const el: Element = {
    type: node.nodeType,
    children: [],
    data: node.data ?? {},
    isVoid: voidTypes.has(node.nodeType),
  };

  for (const child of node.content) {
    const lastChild = el.children.at(-1);

    if (child.nodeType === 'text') {
      const text = transformText(child);

      // Two adjacent texts with the same custom properties will be merged.
      // If two adjacent text nodes have the same formatting, they're merged
      // into a single text node with a combined text string of the two.
      // Ref: https://docs.slatejs.org/concepts/11-normalizing
      if (isText(lastChild) && TextInterface.equals(lastChild, text, { loose: true })) {
        lastChild.text += child.value;
      } else {
        el.children.push(text);
      }

      continue;
    }

    // Empty hyperlinks should be removed
    if (isEmptyHyperlink(child)) {
      continue;
    }

    // Inline nodes cannot be the first or last child of a parent block, nor
    // can it be next to another inline node in the children array. If this is
    // the case, an empty text node will be added to correct this to be in
    // compliance with the constraint.
    //
    // Note: this only handles the case where an inline node is the first or
    // after another inline node. Handling the case where an inline node is
    // the last child of a parent block is implemented further down below
    // outside the loop.
    //
    // Ref: https://docs.slatejs.org/concepts/11-normalizing
    if (inlineTypes.has(child.nodeType) && !isText(lastChild)) {
      el.children.push({ text: '' });
    }

    el.children.push(transformNode(child));
  }

  // All Element nodes must contain at least one Text descendant — even Void
  // Elements. If an element node does not contain any children, an empty text
  // node will be added as its only child
  // Ref: https://docs.slatejs.org/concepts/11-normalizing
  if (el.children.length === 0) {
    // Some elements require at least one block child but it's not enforced by
    // the schema for backwards compatibility. We match these first before
    // falling back to the default case of adding an empty text node.
    switch (el.type) {
      case BLOCKS.QUOTE:
      case BLOCKS.LIST_ITEM:
        el.children.push({
          type: BLOCKS.PARAGRAPH,
          data: {},
          children: [{ text: '' }],
          isVoid: false,
        });
        break;

      case BLOCKS.UL_LIST:
      case BLOCKS.OL_LIST:
        el.children.push({
          type: BLOCKS.LIST_ITEM,
          data: {},
          children: [
            {
              type: BLOCKS.PARAGRAPH,
              data: {},
              children: [{ text: '' }],
              isVoid: false,
            },
          ],
          isVoid: false,
        });
        break;

      default:
        el.children.push({ text: '' });
        break;
    }
  }

  // Handle the case where an inline node is the last child of a parent block
  const lastChildElement = el.children.at(-1);
  if (ElementInterface.isElement(lastChildElement) && inlineTypes.has(lastChildElement.type)) {
    el.children.push({ text: '' });
  }

  // Fix potentially uneven tables
  if (el.type === BLOCKS.TABLE) {
    el.children = maybeFixUnevenTableRows(el);
  }

  return el;
}

export function toSlateDoc(doc?: CfDocument): Element[] {
  if (!doc || !doc?.content?.length) {
    return [
      {
        type: 'paragraph',
        children: [{ text: '' }],
        data: {},
        isVoid: false,
      },
    ];
  }

  const elements = doc.content.map(transformNode);

  const lastElement = elements.at(-1);

  // Ensure a trailing paragraph
  if (lastElement?.type !== BLOCKS.PARAGRAPH) {
    elements.push({
      type: BLOCKS.PARAGRAPH,
      children: [{ text: '' }],
      data: {},
      isVoid: false,
    });
  }

  return elements;
}
