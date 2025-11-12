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
    firstNodeIsNotList: function() {
        return firstNodeIsNotList;
    },
    hasListAsDirectParent: function() {
        return hasListAsDirectParent;
    },
    insertParagraphAsChild: function() {
        return insertParagraphAsChild;
    },
    isListTypeActive: function() {
        return isListTypeActive;
    },
    isNonEmptyListItem: function() {
        return isNonEmptyListItem;
    },
    normalizeOrphanedListItem: function() {
        return normalizeOrphanedListItem;
    },
    replaceNodeWithListItems: function() {
        return replaceNodeWithListItems;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _queries = require("../../internal/queries");
const _transforms = require("../../internal/transforms");
const isList = (node)=>[
        _richtexttypes.BLOCKS.OL_LIST,
        _richtexttypes.BLOCKS.UL_LIST
    ].includes(node.type);
const hasListAsDirectParent = (editor, [, path])=>{
    const [parentNode] = (0, _queries.getParentNode)(editor, path) || [];
    return isList(parentNode);
};
const getNearestListAncestor = (editor, path)=>{
    return (0, _queries.getAboveNode)(editor, {
        at: path,
        mode: 'lowest',
        match: isList
    }) || [];
};
const normalizeOrphanedListItem = (editor, [, path])=>{
    const [parentList] = getNearestListAncestor(editor, path);
    const parentListType = parentList?.type;
    (0, _transforms.wrapNodes)(editor, {
        type: parentListType || _richtexttypes.BLOCKS.UL_LIST,
        children: [],
        data: {}
    }, {
        at: path
    });
};
const isNonEmptyListItem = (_, entry)=>{
    const listItemChildren = (0, _queries.getChildren)(entry);
    return listItemChildren.length !== 0;
};
const firstNodeIsNotList = (_editor, [node])=>{
    if (node.children.length === 1) {
        const firstNode = node.children[0];
        return !(0, _queries.isText)(firstNode) && !isList(firstNode);
    }
    return true;
};
const insertParagraphAsChild = (editor, [, path])=>{
    (0, _transforms.insertNodes)(editor, [
        {
            type: _richtexttypes.BLOCKS.PARAGRAPH,
            data: {},
            children: [
                {
                    text: ''
                }
            ]
        }
    ], {
        at: path.concat([
            0
        ])
    });
};
const replaceNodeWithListItems = (editor, entry)=>{
    const [node, path] = entry;
    (0, _transforms.removeNodes)(editor, {
        at: path
    });
    (0, _transforms.insertNodes)(editor, node.children[0].children, {
        at: path
    });
};
const isListTypeActive = (editor, type)=>{
    const { selection } = editor;
    if (!selection) {
        return false;
    }
    if ((0, _queries.isRangeExpanded)(selection)) {
        const [start, end] = (0, _queries.getRangeEdges)(selection);
        const node = (0, _queries.getCommonNode)(editor, start.path, end.path);
        if (node[0].type === type) {
            return true;
        }
    }
    const listNode = (0, _queries.getBlockAbove)(editor, {
        match: {
            type: [
                _richtexttypes.BLOCKS.OL_LIST,
                _richtexttypes.BLOCKS.UL_LIST
            ]
        },
        mode: 'lowest'
    });
    return listNode?.[0].type === type;
};
