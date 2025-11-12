"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "setHeader", {
    enumerable: true,
    get: function() {
        return setHeader;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _queries = require("../../../internal/queries");
const _transforms = require("../../../internal/transforms");
const setHeader = (editor, enable)=>{
    const tableItem = (0, _queries.getAboveNode)(editor, {
        match: {
            type: _richtexttypes.BLOCKS.TABLE
        }
    });
    if (!tableItem) {
        return;
    }
    const firstRow = (0, _queries.getChildren)(tableItem)[0];
    if (!firstRow) {
        return;
    }
    (0, _queries.getChildren)(firstRow).forEach(([, path])=>{
        (0, _transforms.setNodes)(editor, {
            type: enable ? _richtexttypes.BLOCKS.TABLE_HEADER_CELL : _richtexttypes.BLOCKS.TABLE_CELL
        }, {
            at: path
        });
    });
};
