"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "assertOutput", {
    enumerable: true,
    get: function() {
        return assertOutput;
    }
});
const _internal = require("../internal");
const _createTestEditor = require("./createTestEditor");
const _setEmptyDataAttribute = require("./setEmptyDataAttribute");
const assertOutput = (options)=>{
    const editor = options.editor ?? (0, _createTestEditor.createTestEditor)({
        input: options.input
    }).editor;
    (0, _internal.normalize)(editor);
    (0, _setEmptyDataAttribute.setEmptyDataAttribute)(editor);
    if (options.log) {
        console.log(JSON.stringify({
            expected: options.expected,
            actual: editor.children,
            actualSelection: editor.selection
        }, null, 2));
    }
    expect(editor.children).toEqual(options.expected.children);
    if (options.expected.selection !== null) {
        expect(editor.selection).toEqual(options.expected.selection);
    }
};
