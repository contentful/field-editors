"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "cleanHtmlEmptyElements", {
    enumerable: true,
    get: function() {
        return cleanHtmlEmptyElements;
    }
});
const _platecommon = require("@udecode/plate-common");
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
const cleanHtmlEmptyElements = (rootNode)=>{
    (0, _platecommon.traverseHtmlElements)(rootNode, (element)=>{
        removeIfEmpty(element);
        return true;
    });
};
