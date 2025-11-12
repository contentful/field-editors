"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createVoidsPlugin", {
    enumerable: true,
    get: function() {
        return createVoidsPlugin;
    }
});
const _editor = require("../../helpers/editor");
const _queries = require("../../internal/queries");
const createVoidsPlugin = ()=>({
        key: 'VoidsPlugin',
        exitBreak: [
            {
                hotkey: 'enter',
                before: true,
                query: {
                    filter: ([node, path])=>(0, _editor.isRootLevel)(path) && (0, _queries.isFirstChildPath)(path) && !!node.isVoid
                }
            },
            {
                hotkey: 'enter',
                level: -2,
                query: {
                    filter: ([node, path])=>!((0, _editor.isRootLevel)(path) && (0, _queries.isFirstChildPath)(path)) && !!node.isVoid
                }
            }
        ]
    });
