"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "setEmptyDataAttribute", {
    enumerable: true,
    get: function() {
        return setEmptyDataAttribute;
    }
});
const _platecommon = require("@udecode/plate-common");
const _slate = require("slate");
const setEmptyDataAttribute = (root)=>{
    (0, _platecommon.setNodes)(root, {
        data: {}
    }, {
        at: [],
        match: (node)=>_slate.Element.isElement(node) && !node.data,
        mode: 'all'
    });
};
