"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "shouldResetQuoteOnBackspace", {
    enumerable: true,
    get: function() {
        return shouldResetQuoteOnBackspace;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platecommon = require("@udecode/plate-common");
const _queries = require("../../internal/queries");
const shouldResetQuoteOnBackspace = (editor)=>{
    const container = (0, _queries.getAboveNode)(editor, {
        match: {
            type: _richtexttypes.TEXT_CONTAINERS
        },
        mode: 'lowest'
    });
    if (!container) {
        return false;
    }
    if (!(0, _queries.isAncestorEmpty)(editor, container[0])) {
        return false;
    }
    const quote = (0, _queries.getBlockAbove)(editor, {
        match: {
            type: _richtexttypes.BLOCKS.QUOTE
        },
        mode: 'lowest'
    });
    if (!quote) {
        return false;
    }
    if ((0, _platecommon.hasSingleChild)(quote[0]) && (0, _platecommon.isLastChild)(quote, container[1])) {
        return true;
    }
    return false;
};
