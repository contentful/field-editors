import { CustomText, TextOrCustomElement } from '../types';

const isTextElement = (node: TextOrCustomElement): node is CustomText => 'text' in node;

/**
 * Ensures all nodes have a child leaf text element. This should be handled by
 * Slate but its behavior has proven to be buggy and unpredictable.
 */
export function sanitizeIncomingSlateDoc(nodes: TextOrCustomElement[] = []): TextOrCustomElement[] {
  return nodes.map((node: TextOrCustomElement): TextOrCustomElement => {
    if (isTextElement(node)) {
      return node;
    }
    if (node.children?.length === 0) {
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
