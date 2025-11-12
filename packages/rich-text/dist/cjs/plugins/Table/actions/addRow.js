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
    addRowAbove: function() {
        return addRowAbove;
    },
    addRowBelow: function() {
        return addRowBelow;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platetable = require("@udecode/plate-table");
const _queries = require("../../../internal/queries");
const _transforms = require("../../../internal/transforms");
const addRow = (editor, getNextRowPath)=>{
    if ((0, _queries.someNode)(editor, {
        match: {
            type: _richtexttypes.BLOCKS.TABLE
        }
    })) {
        const currentRowItem = (0, _queries.getAboveNode)(editor, {
            match: {
                type: _richtexttypes.BLOCKS.TABLE_ROW
            }
        });
        if (currentRowItem) {
            const [currentRowElem, currentRowPath] = currentRowItem;
            const nextRowPath = getNextRowPath(currentRowPath);
            (0, _transforms.insertNodes)(editor, (0, _platetable.getEmptyRowNode)(editor, {
                header: false,
                colCount: currentRowElem.children.length
            }), {
                at: nextRowPath,
                select: true
            });
            (0, _transforms.select)(editor, (0, _queries.getStartPoint)(editor, nextRowPath));
        }
    }
};
const addRowBelow = (editor)=>{
    addRow(editor, (currentRowPath)=>{
        return (0, _queries.getNextPath)(currentRowPath);
    });
};
const addRowAbove = (editor)=>{
    addRow(editor, (currentRowPath)=>{
        return currentRowPath;
    });
};
