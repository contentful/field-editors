"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "extractParagraphs", {
    enumerable: true,
    get: function() {
        return extractParagraphs;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _queries = require("../internal/queries");
function extractNodes(editor, path, match) {
    return Array.from((0, _queries.getNodeEntries)(editor, {
        match,
        at: path,
        mode: 'lowest'
    })).map(([node])=>node);
}
function extractParagraphs(editor, path) {
    return extractNodes(editor, path, {
        type: _richtexttypes.TEXT_CONTAINERS
    }).map((node)=>({
            ...node,
            type: _richtexttypes.BLOCKS.PARAGRAPH
        }));
}
