import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { INLINE_TYPES } from '../../helpers/editor';

export const isValidTextContainer = (type: string) => {
  return TEXT_CONTAINERS.includes(type as BLOCKS) || INLINE_TYPES.includes(type);
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
