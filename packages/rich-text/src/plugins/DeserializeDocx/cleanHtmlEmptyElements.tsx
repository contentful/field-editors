/*
 The cleanHtmlEmptyElements from Plate is overly aggressive in removing elements, removing those that are necessary for maintaining proper spacing (span).
 We are using a slightly adjusted version of the cleanHtmlEmptyElements function to prevent the removal of span elements.
 */
import { traverseHtmlElements } from '@udecode/plate-common';

const ALLOWED_EMPTY_ELEMENTS = new Set(['BR', 'IMG', 'TH', 'TD', 'SPAN']);

const isEmpty = (element: Element): boolean => {
  return !ALLOWED_EMPTY_ELEMENTS.has(element.nodeName) && !element.innerHTML.trim();
};

const removeIfEmpty = (element: Element): void => {
  if (isEmpty(element)) {
    const { parentElement } = element;

    element.remove();

    if (parentElement) {
      removeIfEmpty(parentElement);
    }
  }
};

/** Remove empty elements from rootNode. Allowed empty elements: BR, IMG. */
export const cleanHtmlEmptyElements = (rootNode: Node): void => {
  traverseHtmlElements(rootNode, (element) => {
    removeIfEmpty(element);

    return true;
  });
};
