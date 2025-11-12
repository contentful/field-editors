"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createMarksPlugin", {
    enumerable: true,
    get: function() {
        return createMarksPlugin;
    }
});
const _Bold = require("./Bold");
const _Code = require("./Code");
const _Italic = require("./Italic");
const _Strikethrough = require("./Strikethrough");
const _Subscript = require("./Subscript");
const _Superscript = require("./Superscript");
const _Underline = require("./Underline");
const createMarksPlugin = ()=>({
        key: 'Marks',
        plugins: [
            (0, _Bold.createBoldPlugin)(),
            (0, _Code.createCodePlugin)(),
            (0, _Italic.createItalicPlugin)(),
            (0, _Underline.createUnderlinePlugin)(),
            (0, _Superscript.createSuperscriptPlugin)(),
            (0, _Subscript.createSubscriptPlugin)(),
            (0, _Strikethrough.createStrikethroughPlugin)()
        ]
    });
