"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    isEmbedElement: function() {
        return isEmbedElement;
    },
    isEmptyElement: function() {
        return isEmptyElement;
    }
});
function isEmbedElement(element) {
    return element.hasAttribute('data-embedded-entity-inline-id') || element.hasAttribute('data-entity-type');
}
function isEmptyElement(element) {
    return element.textContent === '';
}
