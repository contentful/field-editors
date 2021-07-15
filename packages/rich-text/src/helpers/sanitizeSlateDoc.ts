import { BLOCKS, INLINES, VOID_BLOCKS, Text } from '@contentful/rich-text-types';
import { CustomElement, TextElement, TextOrCustomElement } from 'types';
import values from 'lodash/values'; // eslint-disable-line you-dont-need-lodash-underscore/values

type NodeType = BLOCKS | INLINES | Text['nodeType'];

const TEXT_PARENT_NODES: string[] =
  (VOID_BLOCKS as string[])
    .concat(values(INLINES) as string[])
    .concat(
      BLOCKS.PARAGRAPH,
      BLOCKS.HEADING_1,
      BLOCKS.HEADING_2,
      BLOCKS.HEADING_3,
      BLOCKS.HEADING_4,
      BLOCKS.HEADING_5,
      BLOCKS.HEADING_6,
    );

const isTextElement = (
  node: TextOrCustomElement
): node is TextElement => 'text' in node;

const wrapNode = (
  type: BLOCKS,
  node: TextOrCustomElement
): CustomElement => ({
  type,
  data: {},
  children: [node],
});

function wrapOrphanedTextNode(
  parentNodeType: NodeType,
  node: TextElement
): CustomElement {
  const paragraph = wrapNode(BLOCKS.PARAGRAPH, node);
  switch (parentNodeType) {
    case BLOCKS.OL_LIST:
    case BLOCKS.UL_LIST:
      return wrapNode(BLOCKS.LIST_ITEM, paragraph);
    case BLOCKS.TABLE_ROW:
      return wrapNode(BLOCKS.TABLE_CELL, paragraph);
    case BLOCKS.TABLE:
      return wrapNode(BLOCKS.TABLE_ROW, wrapNode(BLOCKS.TABLE_CELL, paragraph));
    default:
      return paragraph;
  }
}

/**
 * Ensures "orphaned" text node elements (those without a parent capable of
 * validly rendering a text child node) are wrapped with a suitable parent
 * element to prevent failures on the validation layer.
 *
 * It is commonplace for third party plugins (including udecode) to reconcile
 * deletion events by inserting such nodes into their schema. This
 * subprocedure is intended as a guard against such cases.
 */
export function sanitizeSlateDoc(
  nodes: TextOrCustomElement[] = [],
  parentNodeType: NodeType = BLOCKS.DOCUMENT,
): TextOrCustomElement[] {
  return nodes.map((node: TextOrCustomElement): TextOrCustomElement => {
    if (isTextElement(node)) {
      return TEXT_PARENT_NODES.includes(parentNodeType) 
        ? node
        : wrapOrphanedTextNode(parentNodeType, node);
    }
    return {
      ...node,
      children: sanitizeSlateDoc(node.children, node.type as NodeType)
    };
  });
}

/**
 * Ensures incoming void nodes have a child leaf text element.
 */
export function sanitizeIncomingSlateDoc(
  nodes: TextOrCustomElement[] = []
): TextOrCustomElement[] {
  return nodes.map((node: TextOrCustomElement): TextOrCustomElement => {
    if (isTextElement(node)) {
      return node;
    }
    if (node.isVoid && node.children?.length === 0) {
      return {
        ...node,
        children: [{ text: '', data: {} }],
      };
    }
    return {
      ...node,
      children: sanitizeIncomingSlateDoc(node.children),
    };
  });
}
