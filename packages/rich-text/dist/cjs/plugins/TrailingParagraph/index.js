"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createTrailingParagraphPlugin", {
    enumerable: true,
    get: function() {
        return createTrailingParagraphPlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platetrailingblock = require("@udecode/plate-trailing-block");
const createTrailingParagraphPlugin = ()=>{
    return (0, _platetrailingblock.createTrailingBlockPlugin)({
        options: {
            type: _richtexttypes.BLOCKS.PARAGRAPH,
            level: 0
        }
    });
};
