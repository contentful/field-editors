import { BLOCKS } from '@contentful/rich-text-types';
import { getNodeEntryFromSelection } from '../../../helpers/editor';
import { isHTMLElement, removeChildNodesUsingPredicate, SanitizerTuple } from './helpers';

const TAG_NAME_TABLE = 'TABLE';
const TAG_NAME_TABLE_CAPTION = 'CAPTION';
const DISALLOWED_TABLE_CHILD_ELEMENTS: Element['tagName'][] = [TAG_NAME_TABLE_CAPTION];
type DisallowedTableChildElement = HTMLTableCaptionElement;

const isTableElement = (node: ChildNode): node is HTMLTableElement =>
  isHTMLElement(node) && node.tagName === TAG_NAME_TABLE;

const isDisallowedTableChildElement = (node: ChildNode): node is DisallowedTableChildElement =>
  isHTMLElement(node) && DISALLOWED_TABLE_CHILD_ELEMENTS.includes(node.tagName);

const removeDisallowedTableChildElements = removeChildNodesUsingPredicate(
  isDisallowedTableChildElement
);

const removeTableGrandchildren = (nodeList: NodeList) => {
  const nodes = Array.from(nodeList);
  while (nodes.length > 0) {
    const node = nodes.pop() as ChildNode;
    if (isTableElement(node)) {
      removeDisallowedTableChildElements(node.childNodes);
      continue;
    }
    for (const childNode of Array.from(node.childNodes)) {
      nodes.push(childNode);
    }
  }
  return nodes;
};

export const sanitizeTables = ([doc, editor]: SanitizerTuple): SanitizerTuple => {
  const [node] = getNodeEntryFromSelection(editor, BLOCKS.TABLE);
  const isTableInCurrentSelection = !!node;
  if (isTableInCurrentSelection) {
    removeDisallowedTableChildElements(doc.childNodes);
  } else {
    removeTableGrandchildren(doc.childNodes);
  }
  return [doc, editor];
};
