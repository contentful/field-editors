"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createResetNodePlugin", {
    enumerable: true,
    get: function() {
        return createResetNodePlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _plateresetnode = require("@udecode/plate-reset-node");
const createResetNodePlugin = ()=>(0, _plateresetnode.createResetNodePlugin)({
        options: {
            rules: []
        },
        then: (editor)=>{
            const rules = editor.plugins.flatMap((p)=>{
                return p.resetNode || [];
            });
            for (const rule of rules){
                if (!rule.defaultType) {
                    rule.defaultType = _richtexttypes.BLOCKS.PARAGRAPH;
                }
            }
            return {
                options: {
                    rules
                }
            };
        }
    });
