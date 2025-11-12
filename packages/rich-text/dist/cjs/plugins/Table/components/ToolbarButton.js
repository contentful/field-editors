"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ToolbarTableButton", {
    enumerable: true,
    get: function() {
        return ToolbarTableButton;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36icons = require("@contentful/f36-icons");
const _ContentfulEditorProvider = require("../../../ContentfulEditorProvider");
const _editor = require("../../../helpers/editor");
const _ToolbarButton = require("../../shared/ToolbarButton");
const _helpers = require("./../helpers");
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
function ToolbarTableButton(props) {
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const isActive = editor && (0, _helpers.isTableActive)(editor);
    async function handleClick() {
        if (!editor) return;
        editor.tracking.onToolbarAction('insertTable');
        (0, _helpers.insertTableAndFocusFirstCell)(editor);
        (0, _editor.focus)(editor);
    }
    if (!editor) return null;
    return /*#__PURE__*/ _react.createElement(_ToolbarButton.ToolbarButton, {
        title: "Table",
        testId: "table-toolbar-button",
        onClick: handleClick,
        isActive: !!isActive,
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ _react.createElement(_f36icons.TableIcon, null));
}
