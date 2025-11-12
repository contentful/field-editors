"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createSelectOnBackspacePlugin", {
    enumerable: true,
    get: function() {
        return createSelectOnBackspacePlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _plateselect = require("@udecode/plate-select");
const createSelectOnBackspacePlugin = ()=>(0, _plateselect.createSelectOnBackspacePlugin)({
        options: {
            query: {
                allow: [
                    _richtexttypes.INLINES.EMBEDDED_ENTRY
                ]
            }
        }
    });
