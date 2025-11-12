"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ButtonUndo", {
    enumerable: true,
    get: function() {
        return ButtonUndo;
    }
});
const _react = /*#__PURE__*/ _interop_require_default(require("react"));
const _f36icons = require("@contentful/f36-icons");
const _ContentfulEditorProvider = require("../../ContentfulEditorProvider");
const _ToolbarButton = require("../../plugins/shared/ToolbarButton");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const ButtonUndo = ()=>{
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const onClickHandler = ()=>{
        editor.undo('toolbar');
    };
    return /*#__PURE__*/ _react.default.createElement(_ToolbarButton.ToolbarButton, {
        title: "Undo",
        testId: "undo-toolbar-button",
        onClick: onClickHandler,
        isActive: false,
        isDisabled: editor.history.undos.length === 0
    }, /*#__PURE__*/ _react.default.createElement(_f36icons.ArrowArcLeftIcon, null));
};
