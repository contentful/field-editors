"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ToolbarAlignmentButtons", {
    enumerable: true,
    get: function() {
        return ToolbarAlignmentButtons;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36icons = require("@contentful/f36-icons");
const _ContentfulEditorProvider = require("../../../ContentfulEditorProvider");
const _editor = require("../../../helpers/editor");
const _ToolbarButton = require("../../shared/ToolbarButton");
const _alignment = require("../alignment");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function ToolbarAlignmentButtons(props) {
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    function handleClick(alignment) {
        return ()=>{
            if (!editor?.selection) return;
            (0, _alignment.setAlignment)(editor, alignment);
            (0, _editor.focus)(editor);
        };
    }
    if (!editor) return null;
    return /*#__PURE__*/ _react.createElement(_react.Fragment, null, /*#__PURE__*/ _react.createElement(_ToolbarButton.ToolbarButton, {
        title: "Align Left",
        testId: "align-left-toolbar-button",
        onClick: handleClick('left'),
        isActive: (0, _alignment.isAlignmentActive)(editor, 'left'),
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ _react.createElement(_f36icons.TextAlignLeftIcon, null)), /*#__PURE__*/ _react.createElement(_ToolbarButton.ToolbarButton, {
        title: "Align Center",
        testId: "align-center-toolbar-button",
        onClick: handleClick('center'),
        isActive: (0, _alignment.isAlignmentActive)(editor, 'center'),
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ _react.createElement(_f36icons.TextAlignCenterIcon, null)), /*#__PURE__*/ _react.createElement(_ToolbarButton.ToolbarButton, {
        title: "Align Right",
        testId: "align-right-toolbar-button",
        onClick: handleClick('right'),
        isActive: (0, _alignment.isAlignmentActive)(editor, 'right'),
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ _react.createElement(_f36icons.TextAlignRightIcon, null)));
}
