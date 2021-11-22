import { PlateEditor } from '@udecode/plate';

export type SanitizerTuple = [Document, PlateEditor];

type Predicate = (node: ChildNode) => boolean;

export const isHTMLElement = (node: ChildNode): node is HTMLElement =>
  node.nodeType === Node.ELEMENT_NODE;

export const removeChildNodes = (node: ChildNode, predicate: Predicate = Boolean) =>
  Array.from(node.childNodes)
    .filter(predicate)
    .forEach((table) => node.removeChild(table));

export const removeChildNodesUsingPredicate =
  (predicate: Predicate) =>
  (nodeList: NodeList): Node[] => {
    const nodes = Array.from(nodeList);
    while (nodes.length > 0) {
      const node = nodes.pop() as ChildNode;
      removeChildNodes(node, predicate);
      for (const childNode of Array.from(node.childNodes)) {
        nodes.push(childNode);
      }
    }
    return nodes;
  };
