"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createCharCounterPlugin", {
    enumerable: true,
    get: function() {
        return createCharCounterPlugin;
    }
});
const _withCharCounter = require("./withCharCounter");
const createCharCounterPlugin = ()=>({
        key: 'char-counter',
        withOverrides: _withCharCounter.withCharCounter
    });
