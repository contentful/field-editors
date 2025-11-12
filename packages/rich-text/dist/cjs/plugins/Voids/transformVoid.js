"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "transformVoid", {
    enumerable: true,
    get: function() {
        return transformVoid;
    }
});
const _transforms = require("../../internal/transforms");
const transformVoid = (editor, [node, path])=>{
    const validVoid = {
        ...node,
        children: [
            {
                text: ''
            }
        ]
    };
    (0, _transforms.removeNodes)(editor, {
        at: path
    });
    (0, _transforms.insertNodes)(editor, [
        validVoid
    ], {
        at: path
    });
};
