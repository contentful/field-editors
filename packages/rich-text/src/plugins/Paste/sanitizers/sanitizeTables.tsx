import { BLOCKS } from '@contentful/rich-text-types';
import { getNodeEntryFromSelection } from '../../../helpers/editor';
import { removeChildNodesUsingPredicate, SanitizerTuple } from './helpers';

const TAG_NAME_TABLE = 'TABLE';

const isHTMLElement = (node: ChildNode): node is HTMLElement => node.nodeType === Node.ELEMENT_NODE;

const isTableElement = (node: ChildNode): node is HTMLTableElement =>
  isHTMLElement(node) && node.tagName === TAG_NAME_TABLE;

const removeTableChildren = removeChildNodesUsingPredicate(isTableElement);

const removeTableGrandchildren = (nodeList: NodeList) => {
  const nodes = Array.from(nodeList);
  while (nodes.length > 0) {
    const node = nodes.pop() as ChildNode;
    if (isTableElement(node)) {
      removeTableChildren(node.childNodes);
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
    removeTableChildren(doc.childNodes);
  } else {
    removeTableGrandchildren(doc.childNodes);
  }
  return [doc, editor];
};
