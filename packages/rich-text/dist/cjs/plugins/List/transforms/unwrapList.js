"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "unwrapList", {
    enumerable: true,
    get: function() {
        return unwrapList;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _internal = require("../../../internal");
const _queries = require("../../../internal/queries");
const _transforms = require("../../../internal/transforms");
function hasUnliftedListItems(editor, at) {
    return (0, _queries.getNodeEntries)(editor, {
        at,
        match: (node, path)=>(0, _queries.isElement)(node) && node.type === _richtexttypes.BLOCKS.LIST_ITEM && path.length >= 2
    }).next().done;
}
const unwrapList = (editor, { at } = {})=>{
    (0, _internal.withoutNormalizing)(editor, ()=>{
        do {
            (0, _transforms.liftNodes)(editor, {
                at,
                match: (node)=>(0, _queries.isElement)(node) && node.type === _richtexttypes.BLOCKS.LIST_ITEM,
                mode: 'lowest'
            });
        }while (!hasUnliftedListItems(editor, at))
        (0, _transforms.unwrapNodes)(editor, {
            at,
            match: {
                type: _richtexttypes.BLOCKS.LIST_ITEM
            },
            split: false
        });
    });
};
