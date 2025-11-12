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
    addColumnLeft: function() {
        return addColumnLeft;
    },
    addColumnRight: function() {
        return addColumnRight;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platetable = require("@udecode/plate-table");
const _queries = require("../../../internal/queries");
const _transforms = require("../../../internal/transforms");
const addColumn = (editor, { header }, getNextCellPath)=>{
    if ((0, _queries.someNode)(editor, {
        match: {
            type: _richtexttypes.BLOCKS.TABLE
        }
    })) {
        const currentCellItem = (0, _queries.getAboveNode)(editor, {
            match: {
                type: [
                    _richtexttypes.BLOCKS.TABLE_HEADER_CELL,
                    _richtexttypes.BLOCKS.TABLE_CELL
                ]
            }
        });
        const currentTableItem = (0, _queries.getAboveNode)(editor, {
            match: {
                type: _richtexttypes.BLOCKS.TABLE
            }
        });
        if (currentCellItem && currentTableItem) {
            const nextCellPath = getNextCellPath(currentCellItem[1]);
            const newCellPath = nextCellPath.slice();
            const replacePathPos = newCellPath.length - 2;
            currentTableItem[0].children.forEach((_, rowIdx)=>{
                newCellPath[replacePathPos] = rowIdx;
                (0, _transforms.insertNodes)(editor, (0, _platetable.getEmptyCellNode)(editor, {
                    header: header && rowIdx === 0
                }), {
                    at: newCellPath,
                    select: rowIdx === 0
                });
            });
        }
    }
};
const addColumnRight = (editor, options)=>{
    addColumn(editor, options, (currentCellPath)=>(0, _queries.getNextPath)(currentCellPath));
};
const addColumnLeft = (editor, options)=>{
    addColumn(editor, options, (currentCellPath)=>currentCellPath);
};
