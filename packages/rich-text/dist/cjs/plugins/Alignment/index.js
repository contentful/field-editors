"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    TextAlignment: function() {
        return _alignment.TextAlignment;
    },
    ToolbarAlignmentButtons: function() {
        return _ToolbarAlignmentButtons.ToolbarAlignmentButtons;
    },
    createAlignmentPlugin: function() {
        return _createAlignmentPlugin.createAlignmentPlugin;
    },
    getAlignment: function() {
        return _alignment.getAlignment;
    },
    isAlignmentActive: function() {
        return _alignment.isAlignmentActive;
    },
    setAlignment: function() {
        return _alignment.setAlignment;
    }
});
const _ToolbarAlignmentButtons = require("./components/ToolbarAlignmentButtons");
const _alignment = require("./alignment");
const _createAlignmentPlugin = require("./createAlignmentPlugin");
