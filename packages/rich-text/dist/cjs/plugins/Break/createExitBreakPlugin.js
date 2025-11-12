"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createExitBreakPlugin", {
    enumerable: true,
    get: function() {
        return createExitBreakPlugin;
    }
});
const _platebreak = require("@udecode/plate-break");
const createExitBreakPlugin = ()=>(0, _platebreak.createExitBreakPlugin)({
        options: {
            rules: []
        },
        then: (editor)=>{
            const rules = editor.plugins.flatMap((p)=>{
                return p.exitBreak || [];
            });
            return {
                options: {
                    rules
                }
            };
        }
    });
