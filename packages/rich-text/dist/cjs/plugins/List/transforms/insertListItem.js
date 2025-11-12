"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "insertListItem", {
    enumerable: true,
    get: function() {
        return insertListItem;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _internal = require("../../../internal");
const _queries = require("../../../internal/queries");
const _transforms = require("../../../internal/transforms");
const emptyListItemNode = (editor, withChildren = false)=>{
    let children = [];
    if (withChildren) {
        const marks = (0, _queries.getMarks)(editor) || {};
        children = [
            {
                type: _richtexttypes.BLOCKS.PARAGRAPH,
                data: {},
                children: [
                    {
                        text: '',
                        ...marks
                    }
                ]
            }
        ];
    }
    return {
        type: _richtexttypes.BLOCKS.LIST_ITEM,
        data: {},
        children
    };
};
const insertListItem = (editor)=>{
    if (!editor.selection) {
        return false;
    }
    const paragraph = (0, _queries.getAboveNode)(editor, {
        match: {
            type: _richtexttypes.TEXT_CONTAINERS
        }
    });
    if (!paragraph) {
        return false;
    }
    const [, paragraphPath] = paragraph;
    const listItem = (0, _queries.getParentNode)(editor, paragraphPath);
    if (!listItem) {
        return false;
    }
    const [listItemNode, listItemPath] = listItem;
    if (listItemNode.type !== _richtexttypes.BLOCKS.LIST_ITEM) {
        return false;
    }
    (0, _internal.withoutNormalizing)(editor, ()=>{
        if (!editor.selection) {
            return;
        }
        const isAtStart = (0, _queries.isSelectionAtBlockStart)(editor);
        const isAtEnd = (0, _queries.isSelectionAtBlockEnd)(editor);
        const isAtStartOfListItem = isAtStart && (0, _queries.isFirstChildPath)(paragraphPath);
        const shouldSplit = !isAtStart && !isAtEnd;
        if (shouldSplit) {
            (0, _transforms.splitNodes)(editor);
        }
        const newListItemPath = isAtStartOfListItem ? listItemPath : (0, _queries.getNextPath)(listItemPath);
        (0, _transforms.insertNodes)(editor, emptyListItemNode(editor, !shouldSplit), {
            at: newListItemPath
        });
        const fromPath = isAtStart ? paragraphPath : (0, _queries.getNextPath)(paragraphPath);
        const fromStartIndex = fromPath[fromPath.length - 1] || 0;
        const toPath = newListItemPath.concat([
            shouldSplit ? 0 : 1
        ]);
        if (!isAtStartOfListItem) {
            (0, _transforms.moveChildren)(editor, {
                at: listItemPath,
                to: toPath,
                fromStartIndex
            });
        }
        (0, _transforms.select)(editor, newListItemPath);
        (0, _transforms.collapseSelection)(editor, {
            edge: 'start'
        });
    });
    return true;
};
