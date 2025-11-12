"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createSoftBreakPlugin", {
    enumerable: true,
    get: function() {
        return createSoftBreakPlugin;
    }
});
const _platebreak = require("@udecode/plate-break");
const createSoftBreakPlugin = ()=>(0, _platebreak.createSoftBreakPlugin)({
        then: (editor)=>{
            const rules = editor.plugins.flatMap((p)=>{
                return p.softBreak || [];
            });
            return {
                options: {
                    rules
                }
            };
        }
    });
