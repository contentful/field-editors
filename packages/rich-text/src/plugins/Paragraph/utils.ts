import { BLOCKS, INLINES, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { Text, Element, Node } from 'slate';

const INLINE_TYPES = Object.values(INLINES) as string[];

export const isValidTextContainer = (type: string) => {
  return TEXT_CONTAINERS.includes(type as BLOCKS) || INLINE_TYPES.includes(type);
};

export const isValidParagraphChild = (node: Node) => {
  // either text or inline elements
  return Text.isText(node) || (Element.isElement(node) && INLINE_TYPES.includes(node.type));
};

export function isEmbedElement(element: HTMLElement) {
  return (
    element.hasAttribute('data-embedded-entity-inline-id') ||
    element.hasAttribute('data-entity-type')
  );
}

export function isEmptyElement(element: HTMLElement) {
  return element.textContent === '';
}
