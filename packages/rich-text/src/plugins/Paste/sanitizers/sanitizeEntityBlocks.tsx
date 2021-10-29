import { isHTMLElement, removeChildNodes, SanitizerTuple } from './helpers';

/**
 * Ensures the text selection from entity block elements is
 * not included in the paste buffer.
 */
export const sanitizeEntityBlocks = ([doc, editor]: SanitizerTuple): SanitizerTuple => {
  const nodes = Array.from(doc.childNodes);
  while (nodes.length > 0) {
    const node = nodes.pop() as ChildNode;
    if (isHTMLElement(node) && node.getAttribute('data-entity-type')) {
      removeChildNodes(node);
      continue;
    }
    for (const childNode of Array.from(node.childNodes)) {
      nodes.push(childNode);
    }
  }
  return [doc, editor];
};
