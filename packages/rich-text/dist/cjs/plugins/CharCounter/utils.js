"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getTextContent", {
    enumerable: true,
    get: function() {
        return getTextContent;
    }
});
const _internal = require("../../internal");
const _richtexttypes = require("@contentful/rich-text-types");
const blocks = new Set(Object.values(_richtexttypes.BLOCKS));
function getTextContent(root) {
    if ((0, _internal.isText)(root)) {
        return root.text;
    }
    const nodes = root.children;
    return nodes.reduce((acc, node, index)=>{
        const text = getTextContent(node);
        if (!text) {
            return acc;
        }
        const nextNode = nodes[index + 1];
        if (nextNode && blocks.has(nextNode.type)) {
            return acc + text + ' ';
        }
        return acc + text;
    }, '');
}
