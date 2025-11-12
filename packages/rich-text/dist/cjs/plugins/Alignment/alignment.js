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
    ALIGNABLE_BLOCKS: function() {
        return ALIGNABLE_BLOCKS;
    },
    getAlignment: function() {
        return getAlignment;
    },
    isAlignableBlock: function() {
        return isAlignableBlock;
    },
    isAlignmentActive: function() {
        return isAlignmentActive;
    },
    setAlignment: function() {
        return setAlignment;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _slate = require("slate");
const _queries = require("../../internal/queries");
const _transforms = require("../../internal/transforms");
const ALIGNABLE_BLOCKS = [
    _richtexttypes.BLOCKS.PARAGRAPH,
    _richtexttypes.BLOCKS.HEADING_1,
    _richtexttypes.BLOCKS.HEADING_2,
    _richtexttypes.BLOCKS.HEADING_3,
    _richtexttypes.BLOCKS.HEADING_4,
    _richtexttypes.BLOCKS.HEADING_5,
    _richtexttypes.BLOCKS.HEADING_6,
    _richtexttypes.BLOCKS.QUOTE,
    _richtexttypes.BLOCKS.LIST_ITEM
];
function isAlignableBlock(nodeType) {
    return ALIGNABLE_BLOCKS.includes(nodeType);
}
function getAlignment(editor) {
    if (!editor.selection) return null;
    const matches = Array.from(_slate.Editor.nodes(editor, {
        match: (n)=>(0, _queries.isElement)(n) && isAlignableBlock(n.type),
        mode: 'lowest'
    }));
    if (matches.length === 0) return null;
    const [node] = matches[0];
    if ((0, _queries.isElement)(node) && node.data) {
        return node.data.align || 'left';
    }
    return 'left';
}
function isAlignmentActive(editor, alignment) {
    return getAlignment(editor) === alignment;
}
function setAlignment(editor, alignment) {
    if (!editor.selection) return;
    const nodes = Array.from(_slate.Editor.nodes(editor, {
        match: (n)=>(0, _queries.isElement)(n) && isAlignableBlock(n.type),
        mode: 'lowest'
    }));
    if (nodes.length === 0) return;
    for (const [node, path] of nodes){
        if ((0, _queries.isElement)(node)) {
            const nodeData = node.data || {};
            const newData = {
                ...nodeData,
                align: alignment
            };
            (0, _transforms.setNodes)(editor, {
                data: newData
            }, {
                at: path
            });
        }
    }
}
