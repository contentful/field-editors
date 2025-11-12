"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createTestEditor", {
    enumerable: true,
    get: function() {
        return createTestEditor;
    }
});
const _internal = require("../internal");
const _plugins = require("../plugins");
const _randomId = require("./randomId");
const createTestEditor = (options)=>{
    const trackingHandler = options.trackingHandler ?? jest.fn();
    const sdk = options.sdk ?? {
        field: {
            validation: []
        }
    };
    const editor = (0, _internal.createPlateEditor)({
        id: (0, _randomId.randomId)('editor'),
        editor: options.input,
        plugins: options.plugins || (0, _plugins.getPlugins)(sdk, trackingHandler),
        normalizeInitialValue: false
    });
    return {
        editor: editor,
        normalize: ()=>(0, _internal.normalize)(editor)
    };
};
