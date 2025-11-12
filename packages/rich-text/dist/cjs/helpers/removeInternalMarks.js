"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "removeInternalMarks", {
    enumerable: true,
    get: function() {
        return removeInternalMarks;
    }
});
const _constants = require("../plugins/CommandPalette/constants");
const internalMarks = [
    _constants.COMMAND_PROMPT
];
const removeInternalMarks = (document)=>{
    return {
        ...document,
        content: document.content.map((node)=>{
            if (node.nodeType === 'text') {
                node.marks = node.marks.filter((mark)=>!internalMarks.includes(mark.type));
                return node;
            }
            return removeInternalMarks(node);
        })
    };
};
