import { SPEditor } from '@udecode/plate-core';

export type SanitizerTuple = [Document, SPEditor];

type Predicate = (node: ChildNode) => boolean;

const removeChildNodes = (node: ChildNode, predicate: Predicate) =>
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
