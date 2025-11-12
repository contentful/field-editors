"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createCommandPalettePlugin", {
    enumerable: true,
    get: function() {
        return createCommandPalettePlugin;
    }
});
const _CommandPrompt = require("./components/CommandPrompt");
const _constants = require("./constants");
const _onKeyDown = require("./onKeyDown");
const createCommandPalettePlugin = ()=>{
    return {
        key: _constants.COMMAND_PROMPT,
        type: _constants.COMMAND_PROMPT,
        isLeaf: true,
        component: _CommandPrompt.CommandPrompt,
        handlers: {
            onKeyDown: (0, _onKeyDown.createOnKeyDown)()
        }
    };
};
