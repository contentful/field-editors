import { traverseHtmlElements } from '@udecode/plate-common';
const ALLOWED_EMPTY_ELEMENTS = new Set([
    'BR',
    'IMG',
    'TH',
    'TD',
    'SPAN'
]);
const isEmpty = (element)=>{
    return !ALLOWED_EMPTY_ELEMENTS.has(element.nodeName) && !element.innerHTML.trim();
};
const removeIfEmpty = (element)=>{
    if (isEmpty(element)) {
        const { parentElement } = element;
        element.remove();
        if (parentElement) {
            removeIfEmpty(parentElement);
        }
    }
};
export const cleanHtmlEmptyElements = (rootNode)=>{
    traverseHtmlElements(rootNode, (element)=>{
        removeIfEmpty(element);
        return true;
    });
};
