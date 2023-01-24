import { Text, Node } from '../internal/types';

const isTextElement = (node: Node): node is Text => 'text' in node;

/**
 * Ensures all nodes have a child leaf text element. This should be handled by
 * Slate but its behavior has proven to be buggy and unpredictable.
 */
export function sanitizeIncomingSlateDoc(nodes: Node[] = []): Node[] {
  return nodes.map((node: Node): Node => {
    if (isTextElement(node)) {
      return node;
    }
    if ((node.children as Node[])?.length === 0) {
      return {
        ...node,
        children: [{ text: '', data: {} }],
      };
    }
    return {
      ...node,
      children: sanitizeIncomingSlateDoc(node?.children as Node[]),
    };
  });
}
