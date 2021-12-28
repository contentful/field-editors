import { CustomText, TextOrCustomElement } from 'types';

const isTextElement = (node: TextOrCustomElement): node is CustomText => 'text' in node;

/**
 * Ensures incoming void nodes have a child leaf text element.
 */
export function sanitizeIncomingSlateDoc(nodes: TextOrCustomElement[] = []): TextOrCustomElement[] {
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
